/**
 * components/analytics/AnalyticsDashboard.jsx
 * ─────────────────────────────────────────────────────────────
 * Admin-only analytics dashboard using Chart.js.
 * Charts: monthly uploads (line), category split (doughnut),
 * top resources (bar), user activity (line).
 * Install: npm install chart.js react-chartjs-2
 */

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { analyticsService } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";
import "./AnalyticsDashboard.css";

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
);

// ─── Mock data ───
const MOCK = {
  overview: { totalResources: 248, totalUsers: 1_204, pendingApprovals: 14, totalDownloads: 18_420 },
  uploads: {
    labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"],
    datasets: [{ label: "Uploads", data: [18, 24, 19, 32, 28, 35, 41] }],
  },
  categories: {
    labels: ["PDF", "Docs", "Slides", "Images", "Videos", "Other"],
    datasets: [{ data: [38, 22, 18, 12, 7, 3] }],
  },
  topResources: {
    labels: ["React Hooks Guide", "OS Notes", "ML Slides", "DS Handbook", "Web Dev"],
    datasets: [{ label: "Downloads", data: [420, 380, 310, 290, 250] }],
  },
};

const COLORS = ["#2d6a4f", "#1e6fa3", "#6b44c8", "#d4832a", "#c0392b", "#0891b2"];

export default function AnalyticsDashboard() {
  const { isDark } = useTheme();
  const [data,    setData]    = useState(MOCK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getOverview()
      .then(() => {
        Promise.all([
          analyticsService.getUploads(),
          analyticsService.getCategoryStats(),
          analyticsService.getTopResources(),
          analyticsService.getUserActivity(),
        ]).then(([uploads, categories, top]) => {
          setData({ overview: data.overview, uploads, categories, topResources: top });
        });
      })
      .catch(() => {/* use mock */})
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line

  const textColor = isDark ? "#a8a89e" : "#5a5a56";
  const gridColor = isDark ? "#2a2c2a" : "#e2e0d8";
  const accent    = isDark ? "#52b788" : "#2d6a4f";

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: textColor, font: { family: "'Cabinet Grotesk', sans-serif", size: 12 } } },
      tooltip: {
        backgroundColor: isDark ? "#1e2020" : "#fff",
        borderColor: gridColor,
        borderWidth: 1,
        titleColor: isDark ? "#f0efe8" : "#1a1a18",
        bodyColor: textColor,
        titleFont: { family: "'Clash Display', sans-serif", weight: "bold" },
        bodyFont:  { family: "'Cabinet Grotesk', sans-serif" },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  const lineData = {
    labels: data.uploads.labels,
    datasets: [{
      label: "Resources Uploaded",
      data: data.uploads.datasets[0].data,
      borderColor: accent,
      backgroundColor: accent + "20",
      fill: true,
      tension: 0.42,
      pointBackgroundColor: accent,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const doughnutData = {
    labels: data.categories.labels,
    datasets: [{
      data: data.categories.datasets[0].data,
      backgroundColor: COLORS,
      borderWidth: 0,
    }],
  };

  const barData = {
    labels: data.topResources.labels,
    datasets: [{
      label: "Downloads",
      data: data.topResources.datasets[0].data,
      backgroundColor: COLORS[1] + "cc",
      borderRadius: 6,
      borderSkipped: false,
    }],
  };

  const STATS = [
    { label: "Total Resources", value: data.overview?.totalResources,    color: "var(--accent)",  icon: "📁" },
    { label: "Total Users",     value: data.overview?.totalUsers,         color: "var(--blue)",    icon: "👥" },
    { label: "Pending Approvals",value: data.overview?.pendingApprovals, color: "var(--amber)",   icon: "⏳" },
    { label: "Total Downloads", value: data.overview?.totalDownloads,    color: "var(--purple)",  icon: "⬇️" },
  ];

  return (
    <div className="analytics-dash">
      {/* Stat cards */}
      <div className="analytics-stats grid-4">
        {STATS.map(s => (
          <div key={s.label} className="card analytics-stat-card">
            <div className="analytics-stat-icon">{s.icon}</div>
            <div
              className="analytics-stat-value"
              style={{ color: s.color }}
            >
              {loading ? "—" : s.value?.toLocaleString() ?? "—"}
            </div>
            <div className="analytics-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="analytics-charts-row">
        <div className="card analytics-chart-card" style={{ flex: 2 }}>
          <h3 className="analytics-chart-title">Monthly Uploads</h3>
          <div className="analytics-chart-body">
            {loading ? <div className="skeleton" style={{ height: "100%" }} /> : (
              <Line data={lineData} options={baseOptions} />
            )}
          </div>
        </div>

        <div className="card analytics-chart-card" style={{ flex: 1 }}>
          <h3 className="analytics-chart-title">File Categories</h3>
          <div className="analytics-chart-body">
            {loading ? <div className="skeleton" style={{ height: "100%" }} /> : (
              <Doughnut
                data={doughnutData}
                options={{ ...baseOptions, scales: undefined, plugins: { ...baseOptions.plugins, legend: { position: "bottom", labels: { color: textColor, padding: 12 } } } }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="card analytics-chart-card">
        <h3 className="analytics-chart-title">Top Downloaded Resources</h3>
        <div className="analytics-chart-body" style={{ height: 240 }}>
          {loading ? <div className="skeleton" style={{ height: "100%" }} /> : (
            <Bar
              data={barData}
              options={{
                ...baseOptions,
                plugins: { ...baseOptions.plugins, legend: { display: false } },
                indexAxis: "y",
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}