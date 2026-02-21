import React from 'react';
import { Search, Bell, LogOut } from 'lucide-react';

export default function Topbar({ title, onLogout }) {
    const dateStr = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <header className="tb">
            <div className="tb-left">
                <h1 className="tb-ttl">{title}</h1>
                <div className="tb-sub">{dateStr}</div>
            </div>

            <div className="tb-right">
                <div className="ib">
                    <Search size={20} />
                </div>
                <div className="ib">
                    <Bell size={20} />
                    <div className="ib-dot" />
                </div>
                <button className="logout-b" onClick={onLogout}>
                    <LogOut size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                    Sign out
                </button>
            </div>
        </header>
    );
}
