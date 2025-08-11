import React from 'react';
import StatusLegend from '../StatusLegend';
import { STATUS_CONFIG, getAllStatusByType } from '../config';

export default function AdvancedStatusLegendExamples() {
  const maintenanceStatus = getAllStatusByType('MAINTENANCE');
  const userStatus = getAllStatusByType('USER');
  const approvalStatus = getAllStatusByType('APPROVAL');

  return (
    <div className="container mt-4">
      <h2>Advanced StatusLegend Examples</h2>
      
      <div className="row">
        <div className="col-md-6">
          <h4>1. Maintenance Status (Default)</h4>
          <StatusLegend />
        </div>
        
        <div className="col-md-6">
          <h4>2. User Status</h4>
          <StatusLegend 
            statusList={userStatus}
            customInstructions={[
              "* Klik ikon <i className=\"bi bi-pencil\"></i> untuk mengedit user",
              "* Klik ikon <i className=\"bi bi-toggle-on\"></i> untuk mengaktifkan/nonaktifkan"
            ]}
          />
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <h4>3. Approval Status</h4>
          <StatusLegend 
            statusList={approvalStatus}
            showEditIcon={false}
            customInstructions={[
              "* Klik ikon <i className=\"bi bi-check-circle\"></i> untuk menyetujui",
              "* Klik ikon <i className=\"bi bi-x-circle\"></i> untuk menolak"
            ]}
          />
        </div>
        
        <div className="col-md-6">
          <h4>4. Custom Maintenance Status</h4>
          <StatusLegend 
            statusList={[
              {
                value: "Selesai",
                badge: "bg-success",
                description: "Perawatan sudah selesai dilakukan"
              },
              {
                value: "Dalam Pengerjaan",
                badge: "bg-warning text-dark", 
                description: "Perawatan sedang berlangsung"
              },
              {
                value: "Tertunda",
                badge: "bg-danger",
                description: "Perawatan ditunda atau belum dimulai"
              }
            ]}
            showPrintIcon={true}
          />
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <h4>5. Minimal Instructions</h4>
          <StatusLegend 
            showEditIcon={false}
            showDetailIcon={false}
            showPrintIcon={false}
            customInstructions={[
              "* Status akan berubah otomatis sesuai progres perawatan"
            ]}
          />
        </div>
        
        <div className="col-md-6">
          <h4>6. Full Featured</h4>
          <StatusLegend 
            showPrintIcon={true}
            customInstructions={[
              "* Klik ikon <i className=\"bi bi-pencil\"></i> untuk mengedit data",
              "* Klik ikon <i className=\"bi bi-eye\"></i> untuk melihat detail data",
              "* Klik ikon <i className=\"bi bi-printer\"></i> untuk mencetak laporan",
              "* Klik ikon <i className=\"bi bi-download\"></i> untuk mengunduh data",
              "* Status dan outline warna baris akan berubah otomatis sesuai progres perawatan"
            ]}
          />
        </div>
      </div>
    </div>
  );
} 