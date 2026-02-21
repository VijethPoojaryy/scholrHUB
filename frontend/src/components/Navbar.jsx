import React from "react";

const Navbar = () => {

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <nav className="navbar navbar-dark bg-dark px-3">
      <span className="navbar-brand mb-0 h5">
        Department Knowledge Hub
      </span>

      <div className="d-flex gap-3 ms-auto align-items-center">
        <a href="/dashboard" className="text-white text-decoration-none small">
          <i className="bi bi-grid-fill me-1"></i>Dashboard
        </a>

        <a href="/upload" className="text-white text-decoration-none small">
          <i className="bi bi-cloud-upload-fill me-1"></i>Upload
        </a>

        <a href="/notices" className="text-white text-decoration-none small">
          <i className="bi bi-bell-fill me-1"></i>Notices
        </a>

        <a href="/admin" className="text-warning text-decoration-none small fw-semibold">
          <i className="bi bi-shield-check me-1"></i>Admin
        </a>

        <button
          className="btn btn-outline-light btn-sm"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;