import React from 'react';

// A map of file types to Bootstrap Icons and colors
const typeConfig = {
  pdf:  { icon: 'bi-file-earmark-pdf-fill',  color: 'text-danger' },
  ppt:  { icon: 'bi-file-earmark-ppt-fill',  color: 'text-warning' },
  doc:  { icon: 'bi-file-earmark-word-fill', color: 'text-primary' },
  jpg:  { icon: 'bi-file-earmark-image-fill',color: 'text-success' },
};

function FileCard({ file }) {
  // Pick the right icon and color based on file type, default to a generic icon
  const config = typeConfig[file.type] || { icon: 'bi-file-earmark', color: 'text-secondary' };

  return (
    <div className="card h-100 shadow-sm">
      <div className="card-body d-flex flex-column">
        {/* File Type Icon */}
        <div className="mb-2">
          <i className={`bi ${config.icon} ${config.color}`} style={{ fontSize: '2rem' }}></i>
        </div>

        {/* File Info */}
        <h6 className="card-title fw-semibold">{file.title}</h6>
        <p className="card-text small text-muted mb-1">
          <i className="bi bi-bookmark me-1"></i>{file.subject}
        </p>
        <p className="card-text small text-muted mb-1">
          <i className="bi bi-person me-1"></i>{file.professor}
        </p>
        <p className="card-text small text-muted">
          <i className="bi bi-layers me-1"></i>Semester {file.semester}
        </p>

        {/* Download Button (non-functional for now) */}
        <button className="btn btn-outline-primary btn-sm mt-auto">
          <i className="bi bi-download me-1"></i>Download
        </button>
      </div>
    </div>
  );
}

export default FileCard;