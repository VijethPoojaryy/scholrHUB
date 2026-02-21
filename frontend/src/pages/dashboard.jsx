import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  Users,
  Library,
  Bell,
  UploadCloud,
  LayoutGrid,
  Check,
  X
} from "lucide-react";
import {
  StatCard,
  ResItem,
  NoticeItem,
  BarChartComp,
  ProgBar
} from "../components/DashboardComponents";



const AdminDash = ({ stats, pending, activity, onRefresh }) => {
  const { authHeader } = useAuth();
  const api = process.env.REACT_APP_API_URL;

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${api}/api/admin/resources/${id}/${action}`, {
        method: 'PATCH',
        headers: authHeader()
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(`Error ${action}ing:`, err);
    }
  };

  return (
    <div className="pg-in">
      <div className="role-pill" style={{ marginBottom: '32px' }}>
        <div className="pill-dot" style={{ background: 'var(--ad)' }} />
        <div className="pill-txt">Viewing as</div>
        <div className="pill-role" style={{ color: 'var(--ad)', textTransform: 'capitalize' }}>Administrator</div>
      </div>
      <div className="stats">
        <StatCard cls="ad" icon={<Users size={20} />} val={stats?.totalUsers || 0} lbl="Active Users" chg="Platform reach" dir="up" />
        <StatCard cls="ad" icon={<Library size={20} />} val={stats?.totalResources || 0} lbl="Total Resources" chg="Knowledge base" dir="up" />
        <StatCard cls="ad" icon={<Bell size={20} />} val={stats?.pendingReview || 0} lbl="Pending Approvals" chg="Needs action" dir={stats?.pendingReview > 0 ? "up" : "neu"} />
        <StatCard cls="ad" icon={<LayoutGrid size={20} />} val={`${stats?.approvalRate || 0}%`} lbl="Approval Rate" chg="Quality metric" dir="up" />
      </div>
      <div className="panels">
        <div className="panel">
          <div className="ph"><div className="ph-t">Recent Pending Submissions</div></div>
          <div className="rl">
            {pending && pending.length > 0 ? pending.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <ResItem type={item.file_type} name={item.title} meta={`${item.uploader_name} · ${item.subject_code}`} status="wait" />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction(item.id, 'approve')} style={{ background: 'rgba(0,214,143,0.1)', color: 'var(--success)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Check size={16} /></button>
                  <button onClick={() => handleAction(item.id, 'reject')} style={{ background: 'rgba(255,61,90,0.1)', color: 'var(--danger)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              </div>
            )) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--textD)' }}>All caught up! No pending reviews.</div>}
          </div>
        </div>
        <div className="panel">
          <div className="ph"><div className="ph-t">Platform Activity</div></div>
          <BarChartComp vals={activity?.vals || [0, 0, 0, 0, 0, 0, 0]} labels={activity?.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S']} />
        </div>
      </div>
    </div>
  );
};

const ProfDash = ({ stats, resources, pending, activity, onRefresh }) => {
  const navigate = useNavigate();
  const { authHeader } = useAuth();
  const api = process.env.REACT_APP_API_URL;

  const handleAction = async (id, action) => {
    try {
      const res = await fetch(`${api}/api/admin/resources/${id}/${action}`, {
        method: 'PATCH',
        headers: authHeader()
      });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(`Error ${action}ing:`, err);
    }
  };

  return (
    <div className="pg-in">
      <div className="role-pill" style={{ marginBottom: '32px' }}>
        <div className="pill-dot" style={{ background: 'var(--pf)' }} />
        <div className="pill-txt">Viewing as</div>
        <div className="pill-role" style={{ color: 'var(--pf)', textTransform: 'capitalize' }}>Professor</div>
      </div>
      <div className="stats">
        <StatCard cls="pf" icon={<UploadCloud size={20} />} val={stats?.userSubmissions || 0} lbl="My Uploads" chg={`${stats?.userApproved || 0} approved`} dir="up" />
        <StatCard cls="pf" icon={<Users size={20} />} val={stats?.totalUsers || 0} lbl="Student Reach" chg="Total engagement" dir="up" />
        <StatCard cls="pf" icon={<Bell size={20} />} val={activity?.unreadNotices || 0} lbl="Unread Notices" chg="Check inbox" dir="neu" />
      </div>
      <div className="panels">
        <div className="panel">
          <div className="ph">
            <div className="ph-t">Current Available Resources</div>
            <button onClick={() => navigate('/upload')} style={{ background: 'none', border: 'none', color: 'var(--pf)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>+ Upload →</button>
          </div>
          <div className="rl">
            {resources && resources.length > 0 ? resources.slice(0, 5).map(item => (
              <ResItem key={item.id} type={item.file_type} name={item.title} meta={`${item.subject_code} · Sem ${item.semester}`} status="ok" />
            )) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--textD)' }}>No resources available.</div>}
          </div>
        </div>
        <div className="panel">
          <div className="ph"><div className="ph-t">Action Required: Student Submissions</div></div>
          <div className="rl">
            {pending && pending.length > 0 ? pending.slice(0, 3).map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1 }}>
                  <ResItem type={item.file_type} name={item.title} meta={`${item.uploader_name} · ${item.subject_code}`} status="wait" />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAction(item.id, 'approve')} style={{ background: 'rgba(0,214,143,0.1)', color: 'var(--success)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><Check size={16} /></button>
                  <button onClick={() => handleAction(item.id, 'reject')} style={{ background: 'rgba(255,61,90,0.1)', color: 'var(--danger)', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}><X size={16} /></button>
                </div>
              </div>
            )) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--textD)' }}>No student requests pending.</div>}
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="ph"><div className="ph-t">Activity Trends</div></div>
        <div style={{ padding: '0 20px 20px' }}>
          <BarChartComp vals={activity?.vals || [0, 0, 0, 0, 0, 0, 0]} labels={activity?.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S']} />
        </div>
      </div>
    </div>
  );
};

const StuDash = ({ stats, resources, notices, activity }) => {
  const navigate = useNavigate();
  return (
    <div className="pg-in">
      <div className="role-pill" style={{ marginBottom: '32px' }}>
        <div className="pill-dot" style={{ background: 'var(--st)' }} />
        <div className="pill-txt">Viewing as</div>
        <div className="pill-role" style={{ color: 'white', background: 'var(--st)', padding: '2px 10px', borderRadius: '6px' }}>Student</div>
      </div>
      <div className="stats">
        <StatCard cls="st" icon={<Library size={20} />} val={stats?.totalResources || 0} lbl="Resources" chg="Available modules" dir="up" />
        <StatCard cls="st" icon={<UploadCloud size={20} />} val={stats?.userSubmissions || 0} lbl="Submissions" chg={`+${stats?.userApproved || 0} approved`} dir="up" />
        <StatCard cls="st" icon={<LayoutGrid size={20} />} val={stats?.completion || "0%"} lbl="Completion" chg="Keep going!" dir="up" />
        <StatCard cls="st" icon={<Users size={20} />} val={stats?.classRank || "N/A"} lbl="Class Rank" chg="Great work" dir="up" />
      </div>
      <div className="panels">
        <div className="panel">
          <div className="ph">
            <div className="ph-t">📁 Available Resources</div>
            <button onClick={() => navigate('/resources')} style={{ background: 'none', border: 'none', color: 'var(--st)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>Browse all →</button>
          </div>
          <div className="rl">
            {resources && resources.length > 0 ? resources.slice(0, 5).map(item => (
              <ResItem key={item.id} type={item.file_type} name={item.title} meta={`${item.uploader_name} · ${item.subject_code}`} status="ok" />
            )) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--textD)' }}>No resources available.</div>}
          </div>
        </div>
        <div className="panel">
          <div className="ph">
            <div className="ph-t">📢 Latest Notices</div>
            <button onClick={() => navigate('/notices')} style={{ background: 'none', border: 'none', color: 'var(--st)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>View all →</button>
          </div>
          <div className="rl">
            {notices && notices.length > 0 ? notices.slice(0, 3).map(item => (
              <NoticeItem key={item.id} state="old" title={item.title} time={new Date(item.created_at).toLocaleDateString()} />
            )) : <div style={{ padding: '20px', textAlign: 'center', color: 'var(--textD)' }}>No notices yet.</div>}
          </div>
        </div>
      </div>
      <div className="panel" style={{ marginTop: '24px' }}>
        <div className="ph">
          <div className="ph-t">📈 Learning Activity</div>
          <button onClick={() => navigate('/upload')} style={{ background: 'none', border: 'none', color: 'var(--st)', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>+ Submit →</button>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <BarChartComp vals={activity?.vals || [0, 0, 0, 0, 0, 0, 0]} labels={activity?.labels || ['M', 'T', 'W', 'T', 'F', 'S', 'S']} />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, logout, authHeader } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [data, setData] = useState({
    stats: null,
    pending: [],
    resources: [],
    notices: [],
    activity: null
  });

  const fetchData = async () => {
    const api = process.env.REACT_APP_API_URL;
    const headers = authHeader();

    try {
      const [resArr, noticeArr, activityRes] = await Promise.all([
        fetch(`${api}/api/resources`, { headers }).then(r => r.json()),
        fetch(`${api}/api/notices`, { headers }).then(r => r.json()),
        fetch(`${api}/api/admin/activity-stats`, { headers }).then(r => r.json())
      ]);

      let statsData = null;
      let pendingData = [];

      // Always fetch stats for all roles now
      const statsRes = await fetch(`${api}/api/admin/stats`, { headers });
      statsData = await statsRes.json();

      if (user?.role === 'Admin' || user?.role === 'Faculty') {
        const p = await fetch(`${api}/api/admin/resources/pending`, { headers }).then(r => r.json());
        pendingData = p;
      }

      setData({
        stats: statsData,
        pending: pendingData,
        resources: resArr,
        notices: noticeArr,
        activity: activityRes
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, authHeader]);

  return (
    <div className="dash-layout">
      <Sidebar user={user} collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="dash-main">
        <Topbar title={`${user?.role} Dashboard`} onLogout={logout} />
        <div className="content">
          <div className="pg-in">
            {user?.role === 'Admin' && <AdminDash stats={data.stats} pending={data.pending} activity={data.activity} onRefresh={fetchData} />}
            {user?.role === 'Faculty' && <ProfDash stats={data.stats} resources={data.resources} pending={data.pending} activity={data.activity} onRefresh={fetchData} />}
            {user?.role === 'Student' && <StuDash stats={data.stats} resources={data.resources} notices={data.notices} activity={data.activity} />}
          </div>
        </div>
      </div>
    </div>
  );
}
