import React, { useRef } from 'react';
import { useData } from '../context/DataContext';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function Settings() {
  const { donations, expenses, loans, repayments, showNotification, fetchAllData } = useData();
  const fileInputRef = useRef();

  const handleExport = () => {
    const data = { donations, expenses, loans, repayments, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donation_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Data exported successfully!', 'success');
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        JSON.parse(reader.result);
        showNotification('Import: Replace db.json with this file, then restart server.', 'info');
      } catch {
        showNotification('Invalid JSON file!', 'error');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader icon="fa-database" title="Data Management" />
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleExport}><i className="fas fa-download"></i> Export Backup (JSON)</Button>
            <Button variant="secondary" onClick={() => fileInputRef.current.click()}><i className="fas fa-upload"></i> Import Data</Button>
            <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleImport} />
            <Button variant="secondary" onClick={fetchAllData}><i className="fas fa-sync"></i> Refresh Data</Button>
          </div>
          <div className="mt-5">
            <h4 className="font-semibold mb-2">Print</h4>
            <Button onClick={() => window.print()}><i className="fas fa-print"></i> Print Current Page</Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon="fa-info-circle" title="About" />
        <CardBody>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">Donation Management System</p>
            <p>Version 3.0 (React + Axios + Tailwind + JSON Server)</p>
            <p>Data stored in <code className="bg-gray-100 px-1 rounded">db.json</code> via REST API (Axios)</p>
            <p>Currency: PKR (Pakistani Rupee)</p>
            <p className="text-gray-500 mt-2">All changes are saved to the JSON file through json-server.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
