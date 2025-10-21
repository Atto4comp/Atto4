'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Settings, 
  ArrowLeft,
  Loader2,
  SkipForward,
  SkipBack,
} from 'lucide-react';

export interface Atto4PlayerProps {
  titleId: string;
  mediaType: 'movie' | 'tv';
  season?: number;
  episode?: number;
  title?: string;
  poster?: string;
  initialTime?: number;
  onBack?: () => void;
  onTelemetry?: (event: TelemetryEvent) => void;
  theme?: 'dark' | 'light' | 'auto';
  controls?: PlayerControls;
}

export interface PlayerControls {
  showBack?: boolean;
  showQuality?: boolean;
  showPip?: boolean;
  showBrand?: boolean;
  showSkip?: boolean;
}

export interface TelemetryEvent {
  type: 'play' | 'pause' | 'end' | 'seek' | 'quality_change' | 'error' | 'source_failed';
  titleId?: string;
  position: number;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

export default function Atto4Player({
  titleId,
  mediaType,
  season,
  episode,
  title,
  poster,
  initialTime = 0,
  onBack,
  onTelemetry,
  theme = 'dark',
  controls = {
    showBack: true,
    showQuality: true,
    showPip: true,
    showBrand: true,
    showSkip: true,
  },
}: Atto4PlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const telemetryIntervalRef = useRef<NodeJS.Timeout>();
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  // State management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(initialTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);
  const [qualityLevels, setQualityLevels] = useState<Hls.Level[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Extraction state
  const [extracting, setExtracting] = useState(true);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [m3u8Url, setM3u8Url] = useState<string | null>(null);
  const [extractionAttempts, setExtractionAttempts] = useState<string[]>([]);

  // Extract stream on mount
  useEffect(() => {
    let mounted = true;

    async function extractStream() {
      setExtracting(true);
      setLoading(true);
      setError(null);

      try {
        console.log(`🔄 Extracting stream for ${mediaType} ${titleId}${mediaType === 'tv' ? ` S${season}E${episode}` : ''}`);

        const response = await fetch('/api/stream/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaType,
            id: titleId,
            season: mediaType === 'tv' ? season : undefined,
            episode: mediaType === 'tv' ? episode : undefined,
            quality: 'best',
          }),
        });

        const data = await response.json();

        if (!mounted) return;

        if (!response.ok || !data.success) {
          setExtractionAttempts(data.attempts?.map((a: any) => a.provider) || []);
          throw new Error(data.error || 'Failed to extract stream from all providers');
        }

        console.log(`✅ Stream extracted from ${data.provider}${data.cached ? ' (cached)' : ''}`);
        
        setM3u8Url(data.m3u8Url);
        setCurrentProvider(data.provider);
        setExtracting(false);
      } catch (error: any) {
        console.error('❌ Stream extraction failed:', error);
        if (mounted) {
          setError(error.message || 'Failed to extract stream');
          setExtracting(false);
          setLoading(false);
        }
      }
    }

    extractStream();

    return () => {
      mounted = false;
    };
  }, [titleId, mediaType, season, episode]);

  // Initialize HLS when m3u8 URL is available
  useEffect(() => {
    if (!m3u8Url || !videoRef.current) return;

    const video = videoRef.current;
    setLoading(true);
    setError(null);

    console.log(`🎬 Loading m3u8: ${m3u8Url}`);

    // Check if HLS is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 90,
        maxBufferLength: 30,
        maxMaxBufferLength: 600,
        maxBufferSize: 60 * 1000 * 1000,
        maxBufferHole: 0.5,
      });

      hlsRef.current = hls;
      hls.loadSource(m3u8Url);
      hls.attachMedia(video);

      // Manifest parsed - HLS ready
      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        console.log('✅ HLS manifest parsed', data);
        setQualityLevels(data.levels as Hls.Level[]);
        setLoading(false);
        
        // Resume from initial time if provided
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
        
        // Auto-play
        video.play().catch(err => {
          console.warn('Auto-play prevented:', err);
        });
      });

      // Quality level switched
      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentQuality(data.level);
        sendTelemetry('quality_change', { 
          level: data.level, 
          height: data.levelInfo?.height 
        });
      });

      // Error handling
      hls.on(Hls.Events.ERROR, (event, data) => {
        console.error('HLS error:', data);
        
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('Network error, trying to recover...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('Media error, trying to recover...');
              hls.recoverMediaError();
              break;
            default:
              console.error('Fatal HLS error');
              sendTelemetry('source_failed', { 
                error: data.details,
                provider: currentProvider
              });
              setError(`Playback failed: ${data.details}`);
              setLoading(false);
              break;
          }
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = m3u8Url;
      setLoading(false);
      
      if (initialTime > 0) {
        video.currentTime = initialTime;
      }
      
      video.play().catch(err => {
        console.warn('Auto-play prevented:', err);
      });
    } else {
      setError('HLS not supported in this browser');
      setLoading(false);
    }
  }, [m3u8Url, initialTime, currentProvider]);

  // Telemetry
  const sendTelemetry = useCallback((
    type: TelemetryEvent['type'], 
    metadata?: Record<string, any>
  ) => {
    if (!onTelemetry || !videoRef.current) return;

    onTelemetry({
      type,
      titleId,
      position: videoRef.current.currentTime,
      duration: videoRef.current.duration || 0,
      timestamp: Date.now(),
      metadata,
    });
  }, [onTelemetry, titleId]);

  // Periodic telemetry (every 15 seconds)
  useEffect(() => {
    if (isPlaying) {
      telemetryIntervalRef.current = setInterval(() => {
        sendTelemetry('play');
      }, 15000);
    } else {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    }

    return () => {
      if (telemetryIntervalRef.current) {
        clearInterval(telemetryIntervalRef.current);
      }
    };
  }, [isPlaying, sendTelemetry]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      sendTelemetry('play');
    };

    const handlePause = () => {
      setIsPlaying(false);
      sendTelemetry('pause');
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Update buffered
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        setBuffered((bufferedEnd / video.duration) * 100);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      sendTelemetry('end');
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('volumechange', handleVolumeChange);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('volumechange', handleVolumeChange);
    };
  }, [sendTelemetry]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      const shortcuts = [' ', 'k', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'f', 'm', 'j', 'l'];
      if (shortcuts.includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case ' ':
        case 'k':
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case 'ArrowRight':
        case 'l':
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case 'ArrowUp':
          setVolume(Math.min(1, volume + 0.1));
          if (video) video.volume = Math.min(1, volume + 0.1);
          break;
        case 'ArrowDown':
          setVolume(Math.max(0, volume - 0.1));
          if (video) video.volume = Math.max(0, volume - 0.1);
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'm':
          toggleMute();
          break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          const percent = parseInt(e.key) / 10;
          video.currentTime = video.duration * percent;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [volume]);

  // Auto-hide controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(controlsTimeoutRef.current);
      
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('touchstart', handleMouseMove);
    }

    return () => {
      clearTimeout(controlsTimeoutRef.current);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('touchstart', handleMouseMove);
      }
    };
  }, [isPlaying]);

  // Fullscreen change detection
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Control functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuted = !isMuted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * video.duration;
    video.currentTime = newTime;
    sendTelemetry('seek', { from: currentTime, to: newTime });
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const changeQuality = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setShowQualityMenu(false);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackRate(speed);
      setShowSpeedMenu(false);
    }
  };

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(videoRef.current.duration, videoRef.current.currentTime + seconds)
      );
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return h > 0 
      ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
      : `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-[var(--player-bg-900)] flex items-center justify-center text-[var(--player-text)]">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-semibold mb-4">Stream Extraction Failed</h2>
          <p className="text-[var(--player-muted-text)] mb-6">{error}</p>
          
          {extractionAttempts.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-[var(--player-muted-text)] mb-2">
                Tried {extractionAttempts.length} providers:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {extractionAttempts.map((provider) => (
                  <span key={provider} className="px-3 py-1 bg-red-900/30 text-red-400 rounded-full text-xs">
                    {provider}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {onBack && (
            <button
              onClick={onBack}
              className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  // Loading/Extracting state
  if (loading || extracting) {
    return (
      <div className="fixed inset-0 bg-[var(--player-bg-900)] flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
          <p className="text-lg mb-2">
            {extracting ? 'Extracting stream...' : 'Loading video...'}
          </p>
          {currentProvider && (
            <p className="text-sm text-[var(--player-muted-text)]">
              Provider: {currentProvider}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-[var(--player-bg-900)] flex items-center justify-center cursor-default"
      data-player-theme={theme}
      onClick={() => showControls && togglePlay()}
    >
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster}
        playsInline
        onClick={(e) => e.stopPropagation()}
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 transition-opacity pointer-events-none ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDuration: 'var(--player-transition)' }}
      >
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
          <div className="flex items-center justify-between">
            {controls.showBack && onBack && (
              <button
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                className="p-2 rounded-full bg-[var(--player-glass)] hover:bg-[var(--player-glass-strong)] transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={24} className="text-white" />
              </button>
            )}

            {title && (
              <div className="flex-1 mx-4">
                <div className="text-white text-lg font-medium line-clamp-1">{title}</div>
                {mediaType === 'tv' && season && episode && (
                  <div className="text-[var(--player-muted-text)] text-sm">
                    S{season} E{episode}
                  </div>
                )}
              </div>
            )}

            {controls.showBrand && (
              <div className="px-4 py-2 rounded-full bg-[var(--player-glass)] backdrop-blur-sm">
                <span className="text-white font-semibold tracking-wide">Atto4</span>
              </div>
            )}
          </div>
        </div>

        {/* Center play button (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="p-6 rounded-full bg-[var(--player-accent)] hover:scale-110 transition-transform"
              aria-label="Play"
            >
              <Play size={48} fill="black" className="text-black ml-1" />
            </button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto">
          {/* Seek bar */}
          <div
            onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
            className="relative w-full h-[var(--player-seekbar-height)] bg-white/20 rounded-full cursor-pointer mb-4 group"
          >
            <div
              className="absolute h-full bg-white/30 rounded-full pointer-events-none"
              style={{ width: `${buffered}%` }}
            />
            <div
              className="absolute h-full bg-[var(--player-accent)] rounded-full pointer-events-none"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div
              className="absolute top-1/2 w-4 h-4 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg"
              style={{ 
                left: `${(currentTime / duration) * 100}%`, 
                transform: 'translate(-50%, -50%)' 
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-3">
              <button 
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="text-white hover:text-[var(--player-accent)] transition-colors" 
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={28} /> : <Play size={28} />}
              </button>

              {controls.showSkip && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); skipTime(-10); }}
                    className="text-white hover:text-[var(--player-accent)] transition-colors"
                    aria-label="Skip back 10 seconds"
                  >
                    <SkipBack size={24} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); skipTime(10); }}
                    className="text-white hover:text-[var(--player-accent)] transition-colors"
                    aria-label="Skip forward 10 seconds"
                  >
                    <SkipForward size={24} />
                  </button>
                </>
              )}

              <div className="flex items-center gap-2 group">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                  className="text-white hover:text-[var(--player-accent)] transition-colors" 
                  aria-label={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => { e.stopPropagation(); handleVolumeChange(parseFloat(e.target.value)); }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-0 opacity-0 group-hover:w-20 group-hover:opacity-100 transition-all duration-200"
                />
              </div>

              <div className="text-white text-sm font-medium tabular-nums">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-3">
              {/* Speed control */}
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}
                  className="text-white hover:text-[var(--player-accent)] transition-colors text-sm font-medium min-w-[3rem]"
                  aria-label="Playback speed"
                >
                  {playbackRate}x
                </button>

                {showSpeedMenu && (
                  <div 
                    className="absolute bottom-full right-0 mb-2 bg-[var(--player-bg-800)] rounded-lg p-2 min-w-[100px] shadow-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="text-white text-sm font-semibold mb-2 px-2">Speed</div>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={(e) => { e.stopPropagation(); changeSpeed(speed); }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          playbackRate === speed
                            ? 'bg-[var(--player-accent)] text-black'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        {speed}x {speed === 1 && '(Normal)'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quality selector */}
              {controls.showQuality && qualityLevels.length > 1 && (
                <div className="relative">
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); }}
                    className="text-white hover:text-[var(--player-accent)] transition-colors"
                    aria-label="Quality settings"
                  >
                    <Settings size={24} />
                  </button>

                  {showQualityMenu && (
                    <div 
                      className="absolute bottom-full right-0 mb-2 bg-[var(--player-bg-800)] rounded-lg p-2 min-w-[120px] shadow-xl"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="text-white text-sm font-semibold mb-2 px-2">Quality</div>
                      {qualityLevels.map((level, index) => (
                        <button
                          key={index}
                          onClick={(e) => { e.stopPropagation(); changeQuality(index); }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            currentQuality === index
                              ? 'bg-[var(--player-accent)] text-black'
                              : 'text-white hover:bg-white/10'
                          }`}
                        >
                          {level.height}p
                        </button>
                      ))}
                      <button
                        onClick={(e) => { e.stopPropagation(); changeQuality(-1); }}
                        className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                          currentQuality === -1
                            ? 'bg-[var(--player-accent)] text-black'
                            : 'text-white hover:bg-white/10'
                        }`}
                      >
                        Auto
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Fullscreen */}
              <button 
                onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                className="text-white hover:text-[var(--player-accent)] transition-colors" 
                aria-label="Toggle fullscreen"
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
