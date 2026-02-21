import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import {
    Activity,
    TrendingUp,
    Award,
    Calendar,
    CheckCircle2,
    Clock,
    Check,
    X
} from "lucide-react";
import { motion } from "framer-motion";

export default function Progress() {
    const { user, logout, authHeader } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [activityData, setActivityData] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [pending, setPending] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProgress = async () => {
            try {
                const headers = authHeader();
                const api = process.env.REACT_APP_API_URL;

                const requests = [
                    fetch(`${api}/api/admin/user-activity`, { headers }).then(r => r.json()),
                    fetch(`${api}/api/admin/user-submissions`, { headers }).then(r => r.json()),
                    fetch(`${api}/api/admin/stats`, { headers }).then(r => r.json())
                ];

                if (user?.role === 'Faculty' || user?.role === 'Admin') {
                    requests.push(fetch(`${api}/api/admin/resources/pending`, { headers }).then(r => r.json()));
                }

                const dataArray = await Promise.all(requests);

                setActivityData(dataArray[0].map(item => ({
                    name: new Date(item.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
                    work: item.count,
                    fullDate: item.date
                })));
                setSubmissions(dataArray[1]);
                setStats(dataArray[2]);
                if (dataArray[3]) setPending(dataArray[3]);
            } catch (err) {
                console.error("Progress fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProgress();
    }, [authHeader, user]);

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`${process.env.REACT_APP_API_URL}/api/admin/resources/${id}/${action}`, {
                method: 'PATCH',
                headers: authHeader()
            });
            if (res.ok) window.location.reload();
        } catch (err) {
            console.error(`Error ${action}ing:`, err);
        }
    };

    const totalActions = activityData.reduce((acc, curr) => acc + curr.work, 0);
    const streak = activityData.length > 0 ? activityData.filter(d => d.work > 0).length : 0;

    return (
        <div className="dash-layout">
            <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            <div className="dash-main">
                <Topbar title="My Progress" onLogout={logout} />

                <div className="content">
                    <div className="pg-in">
                        <div className="role-pill" style={{ marginBottom: '32px' }}>
                            <div className="pill-dot" style={{ background: 'var(--primary)' }} />
                            <div className="pill-txt">Activity Tracking</div>
                            <div className="pill-role" style={{ color: 'var(--primary)' }}>Real-time Statistics</div>
                        </div>

                        {/* STATS ROW */}
                        <div className="stats">
                            <div className="sc">
                                <div className="sc-ico" style={{ color: 'var(--st)', background: 'rgba(16, 185, 129, 0.1)' }}><Activity size={20} /></div>
                                <div className="sc-val">{stats?.userSubmissions || 0}</div>
                                <div className="sc-lbl">Total Contributions</div>
                                <div className="sc-chg up">{stats?.userApproved || 0} approved</div>
                                <div className="sc-mesh" />
                            </div>
                            <div className="sc">
                                <div className="sc-ico" style={{ color: 'var(--ad)', background: 'rgba(0, 163, 255, 0.1)' }}><TrendingUp size={20} /></div>
                                <div className="sc-val">{stats?.completion || "0%"}</div>
                                <div className="sc-lbl">Course Completion</div>
                                <div className="sc-chg up">Based on targets</div>
                                <div className="sc-mesh" />
                            </div>
                            {user?.role === 'Faculty' ? (
                                <div className="sc">
                                    <div className="sc-ico" style={{ color: 'var(--pf)', background: 'rgba(147, 51, 234, 0.1)' }}><Clock size={20} /></div>
                                    <div className="sc-val">{pending.length}</div>
                                    <div className="sc-lbl">Action Required</div>
                                    <div className="sc-chg dn">Pending Reviews</div>
                                    <div className="sc-mesh" />
                                </div>
                            ) : (
                                <div className="sc">
                                    <div className="sc-ico" style={{ color: 'var(--pf)', background: 'rgba(147, 51, 234, 0.1)' }}><Award size={20} /></div>
                                    <div className="sc-val">{stats?.classRank || "N/A"}</div>
                                    <div className="sc-lbl">Platform Rank</div>
                                    <div className="sc-chg up">Keep it up!</div>
                                    <div className="sc-mesh" />
                                </div>
                            )}
                        </div>

                        {/* CHART PANEL */}
                        <div className="panel" style={{ padding: '32px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '4px' }}>Daily Contribution Graph</h2>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--textM)' }}>Visualizing your work across the platform for the last 14 days</p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <div style={{ padding: '8px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', fontSize: '0.75rem', fontWeight: '700', border: '1px solid var(--border)' }}>
                                        Last 2 Weeks
                                    </div>
                                </div>
                            </div>

                            <div style={{ width: '100%', height: 350 }}>
                                {activityData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={activityData}>
                                            <defs>
                                                <linearGradient id="colorWork" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--textD)', fontSize: 12 }}
                                                dy={10}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: 'var(--textD)', fontSize: 12 }}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: 'var(--panel)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '12px',
                                                    color: 'white'
                                                }}
                                                itemStyle={{ color: 'var(--primary)' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="work"
                                                stroke="var(--primary)"
                                                strokeWidth={3}
                                                fillOpacity={1}
                                                fill="url(#colorWork)"
                                                animationDuration={2000}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--textD)' }}>
                                        <Activity size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                        <p>No activity recorded yet. Start by uploading resources!</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ACTION ITEMS (FACULTY ONLY) */}
                        {user?.role === 'Faculty' && pending.length > 0 && (
                            <div className="panel" style={{ marginBottom: '24px' }}>
                                <div className="ph"><div className="ph-t">Action Items: Pending Requests</div></div>
                                <div className="rl">
                                    {pending.map(item => (
                                        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--textD)' }}>{item.uploader_name} · {item.subject_code}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => handleAction(item.id, 'approve')} style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--st)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Check size={18} /></button>
                                                <button onClick={() => handleAction(item.id, 'reject')} style={{ background: 'rgba(218, 54, 51, 0.1)', color: 'var(--danger)', border: 'none', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><X size={18} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* SUBMISSION HISTORY */}
                        <div className="panel">
                            <div className="ph"><div className="ph-t">Submission History & Status</div></div>
                            <div className="rl">
                                {submissions.length > 0 ? submissions.map(item => (
                                    <div key={item.id} style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ width: 40, height: 40, borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}>
                                            <Activity size={18} style={{ color: item.status === 'Approved' ? 'var(--st)' : 'var(--pf)' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{item.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--textD)' }}>{item.subject_code} · Sem {item.semester}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{
                                                fontSize: '0.7rem',
                                                fontWeight: '800',
                                                padding: '4px 10px',
                                                borderRadius: '100px',
                                                textTransform: 'uppercase',
                                                backgroundColor: item.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(147, 51, 234, 0.1)',
                                                color: item.status === 'Approved' ? 'var(--st)' : 'var(--pf)',
                                                marginBottom: '4px'
                                            }}>
                                                {item.status}
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--textD)' }}>
                                                {new Date(item.upload_date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ padding: '32px', textAlign: 'center', color: 'var(--textD)' }}>
                                        No submissions found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
