import React from 'react';

// This component receives "setter functions" as props from Dashboard
// When a dropdown changes, it calls the setter to update the filter in Dashboard
function FilterBar({ onSemesterChange, onSubjectChange, onProfessorChange }) {
  return (
    <div className="row g-2 p-3 bg-light rounded border">
      {/* Semester Filter */}
      <div className="col-md-4">
        <select className="form-select" onChange={(e) => onSemesterChange(e.target.value)}>
          <option value="">All Semesters</option>
          <option value="1">1st Semester</option>
          <option value="2">2nd Semester</option>
          <option value="3">3rd Semester</option>
          <option value="4">4th Semester</option>
          <option value="5">5th Semester</option>
          <option value="6">6th Semester</option>
        </select>
      </div>

      {/* Subject Filter */}
      <div className="col-md-4">
        <select className="form-select" onChange={(e) => onSubjectChange(e.target.value)}>
          <option value="">All Subjects</option>
          <option value="BCA401">BCA401 - Data Structures</option>
          <option value="BCA402">BCA402 - Operating Systems</option>
          <option value="BCA403">BCA403 - DBMS</option>
          <option value="BCA404">BCA404 - Computer Networks</option>
        </select>
      </div>

      {/* Professor Filter */}
      <div className="col-md-4">
        <select className="form-select" onChange={(e) => onProfessorChange(e.target.value)}>
          <option value="">All Professors</option>
          <option value="Prof. Sharma">Prof. Sharma</option>
          <option value="Prof. Meena">Prof. Meena</option>
          <option value="Prof. Kumar">Prof. Kumar</option>
        </select>
      </div>
    </div>
  );
}

export default FilterBar;