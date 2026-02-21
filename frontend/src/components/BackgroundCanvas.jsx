import React, { useEffect, useRef } from 'react';

const BackgroundCanvas = () => {
    const ref = useRef(null);

    useEffect(() => {
        const cv = ref.current;
        if (!cv) return;
        const ctx = cv.getContext("2d");
        let W, H, pts = [], mouse = { x: -9999, y: -9999 }, RAF;
        const COLS = ["rgba(0,229,255,", "rgba(191,122,240,", "rgba(0,245,160,"];

        function resize() {
            W = cv.width = window.innerWidth;
            H = cv.height = window.innerHeight;
        }
        resize();
        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });

        class P {
            reset() {
                this.x = Math.random() * W;
                this.y = Math.random() * H;
                this.vx = (Math.random() - .5) * .4;
                this.vy = (Math.random() - .5) * .4;
                this.r = Math.random() * 1.7 + .4;
                this.a = Math.random() * .4 + .07;
                this.col = COLS[Math.floor(Math.random() * COLS.length)];
                this.ph = Math.random() * Math.PI * 2;
            }
            constructor() { this.reset(); }
            tick() {
                this.ph += .016;
                const dx = mouse.x - this.x, dy = mouse.y - this.y, d = Math.hypot(dx, dy);
                if (d < 120) {
                    this.vx -= (dx / d) * .022;
                    this.vy -= (dy / d) * .022;
                }
                this.vx *= .979;
                this.vy *= .979;
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
            }
            draw() {
                const a = this.a * (0.6 + 0.4 * Math.sin(this.ph));
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fillStyle = this.col + a + ")";
                ctx.fill();
            }
        }

        for (let i = 0; i < 100; i++) pts.push(new P());

        let ot = 0;
        function frame() {
            ctx.clearRect(0, 0, W, H);
            ot += .0025;
            const orbs = [
                { x: W * .12 + Math.sin(ot) * W * .06, y: H * .18 + Math.cos(ot * .7) * H * .05, r: 380, c: "rgba(0,229,255,.055)" },
                { x: W * .88 + Math.cos(ot * .9) * W * .05, y: H * .78 + Math.sin(ot) * H * .06, r: 320, c: "rgba(191,122,240,.045)" },
                { x: W * .5 + Math.sin(ot * 1.2) * W * .04, y: H * .5 + Math.cos(ot * .8) * H * .04, r: 260, c: "rgba(0,245,160,.038)" },
            ];
            orbs.forEach(o => {
                const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
                g.addColorStop(0, o.c);
                g.addColorStop(1, "transparent");
                ctx.fillStyle = g;
                ctx.fillRect(0, 0, W, H);
            });

            pts.forEach(p => p.tick());
            for (let i = 0; i < pts.length; i++) {
                for (let j = i + 1; j < pts.length; j++) {
                    const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y, d = Math.hypot(dx, dy);
                    if (d < 90) {
                        ctx.beginPath();
                        ctx.moveTo(pts[i].x, pts[i].y);
                        ctx.lineTo(pts[j].x, pts[j].y);
                        ctx.strokeStyle = `rgba(0,229,255,${.04 * (1 - d / 90)})`;
                        ctx.lineWidth = .5;
                        ctx.stroke();
                    }
                }
            }
            pts.forEach(p => p.draw());
            RAF = requestAnimationFrame(frame);
        }
        frame();
        return () => {
            cancelAnimationFrame(RAF);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return <canvas ref={ref} id="bgCv" style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />;
};

export default BackgroundCanvas;
