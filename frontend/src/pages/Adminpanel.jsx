import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import {
  CheckCircle,
  XCircle,
  FileText,
  Eye,
  Trash2,
  Clock,
  ShieldCheck,
  Bell
} from "lucide-react";

export default function AdminPanel() {
  const { authHeader } = useAuth();
  const [pending, setPending] = useState([]);

  const fetchPending = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resources/pending`, {
        headers: authHeader()
      });
      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const method = action === 'approve' ? 'PATCH' : 'DELETE';
      const endpoint = action === 'approve' ? `approve/${id}` : `reject/${id}`;

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/resources/${endpoint}`, {
        method,
        headers: authHeader()
      });

      if (res.ok) {
        setPending(pending.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="tb" style={{ borderRadius: '16px', marginBottom: '24px', background: 'var(--s2)' }}>
        <div style={{ paddingLeft: '8px' }}>
          <div className="tb-ttl">Review Center</div>
          <div className="tb-sub">Verify and approve student resource submissions</div>
        </div>
        <div className="tb-right">
          <div className="ib"><ShieldCheck size={18} /></div>
          <div className="ib"><Bell size={18} /></div>
        </div>
      </div>

      <div className="panel">
        <div className="ph">
          <span className="ph-title">Pending Resource Approvals</span>
          <span className="ni-badge" style={{ background: 'var(--apGrad)' }}>{pending.length} Requests</span>
        </div>

        {pending.length > 0 ? (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid var(--border)" }}>
                  <th style={{ textAlign: "left", padding: "16px", color: "var(--textM)", fontWeight: "600" }}>RESOURCE</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "var(--textM)", fontWeight: "600" }}>UPLOADED BY</th>
                  <th style={{ textAlign: "left", padding: "16px", color: "var(--textM)", fontWeight: "600" }}>TYPE</th>
                  <th style={{ textAlign: "right", padding: "16px", color: "var(--textM)", fontWeight: "600" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((item) => (
                  <tr key={item.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.2s" }} className="ri">
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div className="sc-icon" style={{ padding: 0, width: 32, height: 32, margin: 0, background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)' }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: "600" }}>{item.title}</div>
                          <div style={{ fontSize: "0.75rem", color: "var(--textM)" }}>Sem {item.semester} · {item.subject_code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ fontWeight: "500" }}>{item.uploader_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--textM)" }}>Student</div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span className="ri-tag" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--textM)' }}>{item.file_type.toUpperCase()}</span>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <a
                          href={`${process.env.REACT_APP_API_URL}/${item.file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="ib"
                          style={{ width: 32, height: 32 }}
                        >
                          <Eye size={16} />
                        </a>
                        <button className="ib" style={{ width: 32, height: 32, color: 'var(--success)' }} onClick={() => handleAction(item.id, 'approve')}>
                          <CheckCircle size={16} />
                        </button>
                        <button className="ib" style={{ width: 32, height: 32, color: 'var(--danger)' }} onClick={() => handleAction(item.id, 'reject')}>
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: "80px 20px", textAlign: "center", color: "var(--textM)" }}>
            <CheckCircle size={48} style={{ opacity: 0.1, marginBottom: "16px" }} />
            <p>Inbox Zero! No pending approvals at the moment.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}