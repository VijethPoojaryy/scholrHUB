import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Library,
  UploadCloud,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export default function Sidebar({ user, collapsed, onToggle }) {
  const navItems = [
    { label: 'MAIN', type: 'label' },
    { id: 'dash', to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'res', to: '/resources', label: 'Resources', icon: <Library size={20} /> },
    { label: 'MY WORK', type: 'label' },
    { id: 'sub', to: '/upload', label: 'Submit Work', icon: <UploadCloud size={20} /> },
    { id: 'prog', to: '/progress', label: 'My Progress', icon: <ClipboardList size={20} /> },
    { label: 'OTHER', type: 'label' },
    { id: 'not', to: '/notices', label: 'Notices', icon: <Bell size={20} /> },
    { id: 'set', to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <aside className={`sb ${collapsed ? 'col' : ''}`}>
      <div className="sb-head">
        <div className="sb-logo">N</div>
        {!collapsed && <div className="sb-name">Scholr<em>Hub</em></div>}
        <button className="sb-tog" onClick={onToggle}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sb-nav">
        {navItems.map((item, idx) => (
          item.type === 'label' ? (
            !collapsed && <div key={idx} className="grp-lbl">{item.label}</div>
          ) : (
            <NavLink key={item.id} to={item.to} className={({ isActive }) => `ni ${isActive ? 'act' : ''}`}>
              <div className="ni-i">{item.icon}</div>
              {!collapsed && (
                <>
                  <span className="ni-lbl">{item.label}</span>
                  {item.badge && <span className="ni-badge">{item.badge}</span>}
                </>
              )}
            </NavLink>
          )
        ))}
      </nav>

      <div className="sb-foot">
        <div className="uc">
          <div className="uc-av" style={{ background: user?.role === 'Admin' ? 'var(--adGrad)' : user?.role === 'Faculty' ? 'var(--pfGrad)' : 'var(--stGrad)' }}>
            {user?.name?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          {!collapsed && (
            <div className="uc-info">
              <div className="uc-name">{user?.name || 'User'}</div>
              <div className="uc-role">{user?.role || 'Role'} · {user?.usn || 'USN'}</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}