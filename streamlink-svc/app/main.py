from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, HttpUrl
from typing import List, Optional, Dict
import streamlink

app = FastAPI(title="streamlink-svc", version="1.0.0")

class ExtractRequest(BaseModel):
    url: HttpUrl
    quality: str = "best"  # e.g. "best", "720p"

class ExtractResponse(BaseModel):
    success: bool
    m3u8Url: Optional[str] = None
    quality: Optional[str] = None
    availableQualities: List[str] = []
    provider: Optional[str] = None
    error: Optional[str] = None

@app.get("/health")
def health():
    try:
        # basic sanity: create a session and check version
        _ = streamlink.__version__
        return {"status": "ok", "installed": True, "version": _}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract", response_model=ExtractResponse)
def extract(req: ExtractRequest):
    try:
        session = streamlink.Streamlink()
        # sensible defaults / tunables
        session.set_option("http-timeout", 12.0)
        session.set_option("hls-live-edge", 3)

        streams: Dict[str, streamlink.Stream] = session.streams(str(req.url)) or {}
        qualities = list(streams.keys())
        if not qualities:
            return ExtractResponse(success=False, error="No streams available")

        # choose quality
        sel = req.quality if req.quality in qualities else ("best" if "best" in qualities else qualities[0])

        # open stream to introspect URL when possible
        chosen = streams.get(sel) or streams.get("best") or list(streams.values())[0]
        m3u8_url = None

        # Prefer HLSStream.url if available
        try:
            # many stream types expose .url; fallback to open().reader
            m3u8_url = getattr(chosen, "url", None)
            if not m3u8_url:
                fd = chosen.open()
                # if open() succeeds, we can’t reliably read an HLS URL here, so just report success
                fd.close()
        except Exception:
            pass

        # If we couldn't derive a URL string, try streamlink's CLI translator (safer fallback)
        if not m3u8_url:
            from subprocess import run, PIPE, TimeoutExpired
            try:
                r = run(["streamlink", "--stream-url", str(req.url), sel], stdout=PIPE, stderr=PIPE, text=True, timeout=15)
                m3u8_url = r.stdout.strip() if r.returncode == 0 and r.stdout.strip() else None
            except TimeoutExpired:
                pass

        if not m3u8_url or not m3u8_url.startswith("http"):
            return ExtractResponse(
                success=False,
                error="Failed to resolve stream URL",
                availableQualities=qualities
            )

        return ExtractResponse(
            success=True,
            m3u8Url=m3u8_url,
            quality=sel,
            availableQualities=qualities
        )
    except Exception as e:
        return ExtractResponse(success=False, error=str(e))
