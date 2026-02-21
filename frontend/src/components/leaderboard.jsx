/**
 * components/leaderboard/Leaderboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Shows top contributors ranked by uploads + average rating.
 * Used on the Leaderboard page.
 */

import { useEffect, useState } from "react";
import { leaderboardService }  from "../../services/api";
import StarRating              from "../rating/StarRating";
import { getInitials, getAvatarColor, formatNumber } from "../../utils/helpers";
import "./Leaderboard.css";

const MOCK_LEADERBOARD = [
  { _id: "1", name: "Dr. Anjali Mehta", role: "faculty", uploads: 42, avgRating: 4.8, totalReviews: 156, badge: "🏆" },
  { _id: "2", name: "Prof. Ramesh Iyer", role: "faculty", uploads: 38, avgRating: 4.6, totalReviews: 120, badge: "🥈" },
  { _id: "3", name: "Kartik Sharma",     role: "student", uploads: 29, avgRating: 4.5, totalReviews: 89,  badge: "🥉" },
  { _id: "4", name: "Sneha Patel",       role: "student", uploads: 22, avgRating: 4.3, totalReviews: 67,  badge: null },
  { _id: "5", name: "Dr. Vijay Nair",   role: "faculty", uploads: 19, avgRating: 4.7, totalReviews: 78,  badge: null },
  { _id: "6", name: "Rohan Desai",       role: "student", uploads: 15, avgRating: 4.1, totalReviews: 42,  badge: null },
  { _id: "7", name: "Meena Krishnan",   role: "faculty", uploads: 14, avgRating: 4.4, totalReviews: 55,  badge: null },
  { _id: "8", name: "Aditya Joshi",     role: "student", uploads: 11, avgRating: 3.9, totalReviews: 30,  badge: null },
];

const ROLE_COLOR = {
  admin:   "var(--red)",
  faculty: "var(--amber)",
  student: "var(--blue)",
};

export default function Leaderboard() {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("all"); // "all" | "faculty" | "student"

  useEffect(() => {
    leaderboardService.getLeaderboard()
      .then(d => setData(d || []))
      .catch(() => setData(MOCK_LEADERBOARD))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? data : data.filter(u => u.role === filter);

  return (
    <div className="leaderboard">
      {/* Top 3 podium */}
      {data.slice(0, 3).length === 3 && (
        <div className="lb-podium">
          {[data[1], data[0], data[2]].map((u, i) => {
            const positions = [2, 1, 3];
            const pos = positions[i];
            return (
              <div key={u._id} className={`lb-podium-item lb-pos-${pos}`}>
                <div className="lb-podium-badge">{u.badge}</div>
                <div
                  className="avatar avatar-lg"
                  style={{ background: getAvatarColor(u.name) }}
                >
                  {getInitials(u.name)}
                </div>
                <div className="lb-podium-name">{u.name.split(" ")[0]}</div>
                <div className="lb-podium-uploads">{u.uploads} uploads</div>
                <div className={`lb-podium-stand lb-stand-${pos}`} />
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <div className="lb-filters">
        {["all", "faculty", "student"].map(f => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setFilter(f)}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="lb-loading">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 8 }} />)}
        </div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Contributor</th>
                <th>Role</th>
                <th>Uploads</th>
                <th>Avg. Rating</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={user._id} className={idx < 3 ? "lb-row-top" : ""}>
                  <td>
                    <div className="lb-rank">
                      {user.badge ? (
                        <span className="lb-rank-badge">{user.badge}</span>
                      ) : (
                        <span className="lb-rank-num">#{idx + 1}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        className="avatar avatar-sm"
                        style={{ background: getAvatarColor(user.name) }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: ROLE_COLOR[user.role] + "20",
                        color: ROLE_COLOR[user.role],
                      }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: "var(--accent)" }}>
                      {formatNumber(user.uploads)}
                    </span>
                  </td>
                  <td>
                    <StarRating value={user.avgRating} readonly size="sm" showValue />
                  </td>
                  <td>
                    <span style={{ color: "var(--text-secondary)" }}>{formatNumber(user.totalReviews)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}