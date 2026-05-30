import React, { useState, useEffect } from "react";

interface LightboxState {
    isOpen: boolean;
    src: string;
    caption: string;
}

let openLightboxFn: (src: string, caption: string) => void = () => {};

export const YogurtLightbox = {
    open: (src: string, caption: string) => {
        openLightboxFn(src, caption);
    },
};

if (typeof window !== "undefined") {
    (window as any).YogurtLightbox = YogurtLightbox;
}

/* ─── SVG icons ─────────────────────────────────────────── */
const IconZoomOut = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);

const IconZoomIn = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
);

const IconClose = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconInfo = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0, opacity: 0.6 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
/* ───────────────────────────────────────────────────────── */

export const Lightbox: React.FC = () => {
    const [state, setState] = useState<LightboxState>({
        isOpen: false,
        src: "",
        caption: "",
    });
    const [scale, setScale] = useState(1);
    const [isAnimatingIn, setIsAnimatingIn] = useState(false);

    useEffect(() => {
        openLightboxFn = (src: string, caption: string) => {
            setIsAnimatingIn(true);
            setState({ isOpen: true, src, caption });
            setScale(1);
            document.body.classList.add("modal-open");
        };
        return () => { openLightboxFn = () => {}; };
    }, []);

    const close = () => {
        setIsAnimatingIn(false);
        setState((prev) => ({ ...prev, isOpen: false }));
        document.body.classList.remove("modal-open");
    };

    const zoomIn    = () => setScale((s) => Math.min(4, +(s + 0.25).toFixed(2)));
    const zoomOut   = () => setScale((s) => Math.max(0.25, +(s - 0.25).toFixed(2)));
    const zoomReset = () => setScale(1);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        e.deltaY < 0 ? zoomIn() : zoomOut();
    };

    useEffect(() => {
        if (!state.isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "+" || e.key === "=") zoomIn();
            if (e.key === "-") zoomOut();
            if (e.key === "0") zoomReset();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [state.isOpen]);

    if (!state.isOpen) return null;

    return (
        <div
            className="image-modal-overlay is-open"
            role="dialog"
            aria-modal="true"
            onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
            <div
                className={`image-modal-box${isAnimatingIn ? " is-animating-in" : ""}`}
                onWheel={handleWheel}
            >
                {/* ── Toolbar ── */}
                <div className="image-modal-toolbar">
                    {/* Zoom controls pill */}
                    <div className="image-modal-zoom-controls">
                        <button
                            onClick={zoomOut}
                            className="image-modal-tool-btn btn-icon"
                            type="button"
                            aria-label="Zoom out"
                            title="Zoom out (−)"
                        >
                            <IconZoomOut />
                        </button>

                        <button
                            onClick={zoomReset}
                            className="image-modal-tool-btn btn-label"
                            type="button"
                            aria-label="Reset zoom"
                            title="Reset zoom (0)"
                        >
                            {Math.round(scale * 100)}%
                        </button>

                        <button
                            onClick={zoomIn}
                            className="image-modal-tool-btn btn-icon"
                            type="button"
                            aria-label="Zoom in"
                            title="Zoom in (+)"
                        >
                            <IconZoomIn />
                        </button>
                    </div>

                    {/* Close */}
                    <button
                        onClick={close}
                        className="image-modal-close"
                        type="button"
                        aria-label="Close"
                        title="Tutup (Esc)"
                    >
                        <IconClose />
                    </button>
                </div>

                {/* ── Image ── */}
                <div className="image-modal-content">
                    <img
                        src={state.src}
                        alt={state.caption}
                        className="image-modal-img"
                        style={{ transform: `scale(${scale})` }}
                        draggable={false}
                    />
                </div>

                {/* ── Caption ── */}
                {state.caption && (
                    <div className="image-modal-caption">
                        <IconInfo />
                        {state.caption}
                    </div>
                )}
            </div>
        </div>
    );
};
