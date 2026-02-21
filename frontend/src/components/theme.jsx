/**
 * components/theme/ThemeToggle.jsx
 * ─────────────────────────────────────────────────────────────
 * Animated light/dark toggle button (pill style).
 * Can be placed anywhere in the UI.
 * Uses ThemeContext.
 */

import { useTheme } from "../../context/ThemeContext";
import "./ThemeToggle.css";

export default function ThemeToggle({ label = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className={`theme-toggle ${isDark ? "theme-toggle-dark" : "theme-toggle-light"}`}
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          {isDark ? (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M13 8.5A7 7 0 015.5 1 7 7 0 1013 8.5z" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="3" fill="currentColor"/>
              <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.6 2.6l1 1M10.4 10.4l1 1M2.6 11.4l1-1M10.4 3.6l1-1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          )}
        </div>
      </div>
      {label && (
        <span className="theme-toggle-label">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}