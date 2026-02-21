import React, { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className="dash-main">
                <main className="content">
                    <div className="page-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
