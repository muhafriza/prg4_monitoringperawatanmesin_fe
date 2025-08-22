import React from "react";

const CardSummary = ({ title, value, icon, color }) => {
  return (
    <div className="col-md-3 col-sm-6 mb-3" style={{ height: "130px" }}> {/* biar responsif */}
      <div
        className="card text-white shadow-sm h-100"
        style={{ backgroundColor: color }}
      >
        <div className="card-body d-flex align-items-center justify-content-between">
          <div>
            <h6 className="card-title fw-bold">{title}</h6>
            <h3 className="fw-bold">{value}</h3>
          </div>
          <div className="fs-2">{icon}</div>
        </div>
      </div>
    </div>
  );
};

export default CardSummary;
