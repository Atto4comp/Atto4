// lib/player/controllers.ts

export type ControllerType = 'none' | 'youtube' | 'vimeo' | 'custom';

export interface PlayerState {
  playing?: boolean;
  muted?: boolean;
  currentTime?: number;
  duration?: number;
}

export interface IframeController {
  init(iframe: HTMLIFrameElement): void;
  play(): void;
  pause(): void;
  mute(): void;
  unmute(): void;
  seek(seconds: number): void; // absolute seconds
  attach(onState: (patch: PlayerState) => void): void;
  detach(): void;
}

function post(iframe: HTMLIFrameElement | null, data: any, targetOrigin = '*') {
  iframe?.contentWindow?.postMessage(data, targetOrigin);
}

export class NoopController implements IframeController {
  init() {}
  play() {}
  pause() {}
  mute() {}
  unmute() {}
  seek() {}
  attach() {}
  detach() {}
}

/** YouTube adapter (enablejsapi=1 on the iframe src required) */
export class YouTubeController implements IframeController {
  private iframe: HTMLIFrameElement | null = null;
  private onState?: (p: PlayerState) => void;

  private handler = (e: MessageEvent) => {
    try {
      const payload = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
      if (payload?.event === 'onStateChange') {
        if (payload?.info === 1) this.onState?.({ playing: true });
        if (payload?.info === 2) this.onState?.({ playing: false });
      }
    } catch {
      /* ignore */
    }
  };

  init(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
    post(this.iframe, JSON.stringify({ event: 'listening', id: 1 }), '*');
  }
  play() {
    post(this.iframe, JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
  }
  pause() {
    post(this.iframe, JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
  }
  mute() {
    post(this.iframe, JSON.stringify({ event: 'command', func: 'mute', args: [] }), '*');
  }
  unmute() {
    post(this.iframe, JSON.stringify({ event: 'command', func: 'unMute', args: [] }), '*');
  }
  seek(s: number) {
    post(this.iframe, JSON.stringify({ event: 'command', func: 'seekTo', args: [s, true] }), '*');
  }

  attach(onState: (p: PlayerState) => void) {
    this.onState = onState;
    window.addEventListener('message', this.handler);
  }
  detach() {
    window.removeEventListener('message', this.handler);
    this.onState = undefined;
  }
}

/** Vimeo adapter */
export class VimeoController implements IframeController {
  private iframe: HTMLIFrameElement | null = null;
  private onState?: (p: PlayerState) => void;

  private handler = (e: MessageEvent) => {
    const { event, data } = (e?.data as any) || {};
    if (event === 'play') this.onState?.({ playing: true });
    if (event === 'pause') this.onState?.({ playing: false });
    if (event === 'volumechange') this.onState?.({ muted: data === 0 });
    if (event === 'timeupdate')
      this.onState?.({ currentTime: data?.seconds, duration: data?.duration });
  };

  init(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }
  play() {
    post(this.iframe, { method: 'play' });
  }
  pause() {
    post(this.iframe, { method: 'pause' });
  }
  mute() {
    post(this.iframe, { method: 'setVolume', value: 0 });
  }
  unmute() {
    post(this.iframe, { method: 'setVolume', value: 1 });
  }
  seek(s: number) {
    post(this.iframe, { method: 'setCurrentTime', value: s });
  }
  attach(onState: (p: PlayerState) => void) {
    this.onState = onState;
    window.addEventListener('message', this.handler);
  }
  detach() {
    window.removeEventListener('message', this.handler);
    this.onState = undefined;
  }
}

/** Custom provider skeleton */
export class CustomController implements IframeController {
  private iframe: HTMLIFrameElement | null = null;
  private onState?: (p: PlayerState) => void;

  private handler = (e: MessageEvent) => {
    const msg = e.data as any;
    if (msg?.type === 'play') this.onState?.({ playing: true });
    if (msg?.type === 'pause') this.onState?.({ playing: false });
    if (msg?.type === 'time')
      this.onState?.({ currentTime: msg.position, duration: msg.duration });
  };

  init(iframe: HTMLIFrameElement) {
    this.iframe = iframe;
  }
  play() {
    post(this.iframe, { type: 'play' });
  }
  pause() {
    post(this.iframe, { type: 'pause' });
  }
  mute() {
    post(this.iframe, { type: 'mute' });
  }
  unmute() {
    post(this.iframe, { type: 'unmute' });
  }
  seek(s: number) {
    post(this.iframe, { type: 'seek', seconds: s });
  }
  attach(onState: (p: PlayerState) => void) {
    this.onState = onState;
    window.addEventListener('message', this.handler);
  }
  detach() {
    window.removeEventListener('message', this.handler);
    this.onState = undefined;
  }
}

export function makeController(kind: ControllerType): IframeController {
  switch (kind) {
    case 'youtube':
      return new YouTubeController();
    case 'vimeo':
      return new VimeoController();
    case 'custom':
      return new CustomController();
    default:
      return new NoopController();
  }
}
