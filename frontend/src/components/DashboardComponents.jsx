import React from 'react';

export const StatCard = ({ cls, icon, val, lbl, chg, dir, delay = "0s" }) => (
    <div className={`sc ${cls}`} style={{ animationDelay: delay }}>
        <div className="sc-ico">{icon}</div>
        <div className="sc-val">{val}</div>
        <div className="sc-lbl">{lbl}</div>
        <div className={`sc-chg ${dir}`}>
            {dir === "up" ? "↑" : dir === "dn" ? "↓" : "·"} {chg}
        </div>
        <div className="sc-mesh" />
    </div>
);

export const ResItem = ({ type, name, meta, status }) => {
    const icons = { pdf: "📄", vid: "🎬", doc: "📝", zip: "🗂" };
    return (
        <div className="ri">
            <div className="ri-th">{icons[type] || "📄"}</div>
            <div className="ri-info">
                <div className="ri-name">{name}</div>
                <div className="ri-meta">{meta}</div>
            </div>
            <span className={`ri-tag ${status === "ok" ? "ok" : "wait"}`}>
                {status === "ok" ? "Approved" : "In Review"}
            </span>
        </div>
    );
};

export const NoticeItem = ({ state, title, time }) => (
    <div className="nli" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className={`nli-dot ${state === 'nw' ? 'new' : 'old'}`} style={{ width: 8, height: 8, borderRadius: '50%', background: state === 'nw' ? 'var(--st)' : 'var(--textD)' }} />
        <div style={{ flex: 1 }}>
            <div className="nli-t" style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                {title}
                {state === "nw" && <span style={{ marginLeft: '8px', fontSize: '0.65rem', padding: '2px 6px', background: 'var(--st)', color: 'white', borderRadius: '4px' }}>NEW</span>}
            </div>
            <div className="nli-time" style={{ fontSize: '0.75rem', color: 'var(--textD)', marginTop: '2px' }}>{time}</div>
        </div>
    </div>
);

export const BarChartComp = ({ vals, labels }) => {
    const max = Math.max(...vals);
    return (
        <div className="chart-wrap">
            <div className="bars">
                {vals.map((v, i) => (
                    <div key={i} className="bar"
                        style={{ height: `${(v / max) * 100}%`, animationDelay: `${i * .05}s` }} />
                ))}
            </div>
            <div className="b-lbls">
                {labels.map((l, i) => <div key={i} className="b-lbl">{l}</div>)}
            </div>
        </div>
    );
};

export const ProgBar = ({ lbl, pct, color, delay = "0s" }) => (
    <div className="pr">
        <div className="pr-top">
            <span className="pr-l">{lbl}</span>
            <span className="pr-pct" style={{ color }}>{pct}</span>
        </div>
        <div className="pr-track">
            <div className="pr-fill" style={{ width: pct, background: color, animationDelay: delay }} />
        </div>
    </div>
);
