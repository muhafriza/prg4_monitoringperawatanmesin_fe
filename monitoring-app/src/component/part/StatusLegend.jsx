import React from "react";
import { DEFAULT_MAINTENANCE_STATUS } from "./config/statusConfig";

export default function StatusLegend({ 
  showPrintIcon = false, 
  showEditIcon = true, 
  showDetailIcon = true,
  customInstructions = null,
  statusList = DEFAULT_MAINTENANCE_STATUS
}) {
  const defaultInstructions = [
    showEditIcon && "* Klik ikon <i className=\"bi bi-pencil\"></i> untuk mengedit data.",
    showDetailIcon && "* Klik ikon <i className=\"bi bi-eye\"></i> untuk melihat detail data.",
    showPrintIcon && "* Klik ikon <i className=\"bi bi-printer\"></i> untuk mencetak laporan.",
    "* Status dan outline warna baris akan berubah otomatis sesuai progres perawatan."
  ].filter(Boolean);

  const instructions = customInstructions || defaultInstructions;

  return (
    <div className="mt-3">
      <strong>Legend Status:</strong>
      <ul className="mb-0">
        {statusList.map((status, index) => (
          <li key={index}>
            <span className={`badge ${status.badge}`}>{status.value}</span>: {status.description}
          </li>
        ))}
      </ul>
      <div className="text-muted mt-2" style={{fontSize: '0.95em'}}>
        {instructions.map((instruction, index) => (
          <React.Fragment key={index}>
            <span dangerouslySetInnerHTML={{ __html: instruction }} />
            {index < instructions.length - 1 && <br/>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
} 