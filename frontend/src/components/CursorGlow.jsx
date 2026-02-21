import React, { useEffect, useRef } from 'react';

const CursorGlow = () => {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const move = e => {
            el.style.left = e.clientX + "px";
            el.style.top = e.clientY + "px";
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, []);

    return (
        <div
            ref={ref}
            className="cg"
            style={{
                position: 'fixed',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                pointerEvents: 'none',
                zIndex: 999,
                mixBlendMode: 'screen',
                filter: 'blur(70px)',
                background: 'radial-gradient(circle, rgba(0,229,255,.055), transparent 70%)',
                transform: 'translate(-50%, -50%)',
                transition: 'left .1s, top .1s'
            }}
        />
    );
};

export default CursorGlow;
