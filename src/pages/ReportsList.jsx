import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import { EmptyState, LoadingBlock } from '../components/Bits';

export default function ReportsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reports, setReports] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchReports() {
      setError('');
      let q = supabase
        .from(TABLES.reports)
        .select('*')
        .eq('user_id', user.id)
        .order('report_date', { ascending: false });

      const { data, error: err } = await q;
      if (err) {
        setError('Failed to load reports. Please try again.');
        setReports([]);
      } else {
        setReports(data || []);
      }
    }
    fetchReports();
  }, [user.id]);

  const categories = [
    { id: 'all', label: 'All Reports' },
    { id: 'blood_test', label: 'Blood Tests' },
    { id: 'scan', label: 'Scans & X-Rays' },
    { id: 'prescription', label: 'Prescriptions' },
    { id: 'doctor_note', label: 'Doctor Notes' },
    { id: 'other', label: 'Other Documents' }
  ];

  const filtered = reports
    ? reports.filter((r) => categoryFilter === 'all' || r.category === categoryFilter)
    : [];

  return (
    <div className="screen">
      <TopBar title="My Reports" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0 12px' }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Categorized Records</h2>
        <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => navigate('/upload-report')}>
          + Upload Report
        </button>
      </div>

      <div className="category-pills">
        {categories.map((c) => (
          <button
            key={c.id}
            className={`pill ${categoryFilter === c.id ? 'active' : ''}`}
            onClick={() => setCategoryFilter(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <p className="error-text">{error}</p>}
      {reports === null && <LoadingBlock />}

      {reports !== null && filtered.length === 0 && (
        <EmptyState
          emoji="📁"
          title="No reports found"
          description="Upload lab tests, scans, or prescriptions to organize your health records."
        />
      )}

      <div className="reports-list">
        {filtered.map((item) => (
          <div key={item.id} className="card report-card">
            <div className="report-card-header">
              <span className="tag accent">{item.category?.replace('_', ' ').toUpperCase() || 'REPORT'}</span>
              <span className="report-date">{item.report_date ? new Date(item.report_date).toLocaleDateString() : 'Recent'}</span>
            </div>
            <h3 className="report-name">{item.report_name || 'Medical Report'}</h3>
            {item.hospital_lab && <p className="report-sub">{item.hospital_lab}</p>}

            <div className="report-card-actions">
              <button
                className="btn btn-outline"
                style={{ flex: 1, padding: '8px', fontSize: 13 }}
                onClick={() => navigate(`/reports/${item.id}`)}
              >
                Understand & View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
