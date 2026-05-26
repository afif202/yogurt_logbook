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

        return () => {
            openLightboxFn = () => {};
        };
    }, []);

    const close = () => {
        setIsAnimatingIn(false);
        setState((prev) => ({ ...prev, isOpen: false }));
        document.body.classList.remove("modal-open");
    };

    const zoomIn = () => setScale((s) => Math.min(4, s + 0.2));
    const zoomOut = () => setScale((s) => Math.max(0.5, s - 0.2));
    const zoomReset = () => setScale(1);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    };

    if (!state.isOpen) return null;

    return (
        <div
            className="image-modal-overlay is-open"
            role="dialog"
            aria-modal="true"
            onClick={(e) => {
                if (e.target === e.currentTarget) close();
            }}
        >
            <div
                className={`image-modal-box${isAnimatingIn ? " is-animating-in" : ""}`}
                onWheel={handleWheel}
            >
                <div className="image-modal-toolbar">
                    <div className="image-modal-zoom-controls">
                        <button
                            onClick={zoomOut}
                            className="image-modal-tool-btn"
                            type="button"
                            aria-label="Zoom out"
                        >
                            🔍-
                        </button>
                        <button
                            onClick={zoomReset}
                            className="image-modal-tool-btn"
                            style={{ width: "auto", padding: "0 8px" }}
                            type="button"
                            aria-label="Reset zoom"
                        >
                            {Math.round(scale * 100)}%
                        </button>
                        <button
                            onClick={zoomIn}
                            className="image-modal-tool-btn"
                            type="button"
                            aria-label="Zoom in"
                        >
                            🔍+
                        </button>
                    </div>
                    <button
                        onClick={close}
                        className="image-modal-close"
                        type="button"
                        aria-label="Close preview"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                        }}
                    >
                        ❌
                    </button>
                </div>
                <div className="image-modal-content">
                    <img
                        src={state.src}
                        alt={state.caption}
                        className="image-modal-img"
                        style={{ transform: `scale(${scale})` }}
                    />
                </div>
                {state.caption && (
                    <div className="image-modal-caption">
                        <span style={{ marginRight: "8px" }}>ℹ️</span>{" "}
                        {state.caption}
                    </div>
                )}
            </div>
        </div>
    );
};
