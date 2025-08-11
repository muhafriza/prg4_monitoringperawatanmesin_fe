import React from 'react';
import StatusLegend from '../StatusLegend';

export default function StatusLegendExamples() {
  return (
    <div className="container mt-4">
      <h2>StatusLegend Component Examples</h2>
      
      <div className="row">
        <div className="col-md-6">
          <h4>1. Basic StatusLegend</h4>
          <StatusLegend />
        </div>
        
        <div className="col-md-6">
          <h4>2. With Print Icon</h4>
          <StatusLegend showPrintIcon={true} />
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <h4>3. Edit Icon Only</h4>
          <StatusLegend 
            showDetailIcon={false}
            showPrintIcon={false}
          />
        </div>
        
        <div className="col-md-6">
          <h4>4. Custom Instructions</h4>
          <StatusLegend 
            customInstructions={[
              "* Klik tombol biru untuk melihat detail",
              "* Klik tombol hijau untuk mengedit",
              "* Status akan berubah otomatis sesuai progres"
            ]}
          />
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-6">
          <h4>5. Detail Icon Only</h4>
          <StatusLegend 
            showEditIcon={false}
            showPrintIcon={false}
          />
        </div>
        
        <div className="col-md-6">
          <h4>6. All Icons Disabled</h4>
          <StatusLegend 
            showEditIcon={false}
            showDetailIcon={false}
            showPrintIcon={false}
          />
        </div>
      </div>
    </div>
  );
} 