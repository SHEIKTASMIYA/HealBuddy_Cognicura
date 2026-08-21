import { useState } from 'react';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';

export default function PrivacyCenter() {
  const { user, signOut } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  async function handleExportData() {
    setExporting(true);
    const [prof, reps, symp, meds] = await Promise.all([
      supabase.from(TABLES.profiles).select('*').eq('id', user.id).maybeSingle(),
      supabase.from(TABLES.reports).select('*').eq('user_id', user.id),
      supabase.from(TABLES.symptoms).select('*').eq('user_id', user.id),
      supabase.from(TABLES.medications).select('*').eq('user_id', user.id)
    ]);

    const fullExport = {
      exportDate: new Date().toISOString(),
      profile: prof.data,
      reports: reps.data,
      symptoms: symp.data,
      medications: meds.data
    };

    const blob = new Blob([JSON.stringify(fullExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healbuddy_data_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  }

  async function handleDeleteData() {
    if (!window.confirm('CAUTION: Are you sure you want to permanently delete all your health data? This cannot be undone.')) {
      return;
    }
    await supabase.from(TABLES.profiles).delete().eq('id', user.id);
    await signOut();
  }

  return (
    <div className="screen">
      <TopBar title="Privacy & Security" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="card" style={{ marginTop: 16 }}>
        <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
          <span style={{ fontSize: 36 }}>🔒</span>
          <h2 style={{ fontSize: 18, margin: '8px 0 4px' }}>Privacy Center</h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
            Your health information belongs to you. HealBuddy never sells or shares your personal records automatically.
          </p>
        </div>

        <div className="privacy-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
          <h3 style={{ fontSize: 14 }}>Security & Storage</h3>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            ✔ Row Level Security (RLS) enabled on all personal tables.<br />
            ✔ Encrypted connections over HTTPS/TLS.<br />
            ✔ Private cloud storage buckets for your report documents.
          </p>
        </div>

        <div className="privacy-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 12 }}>
          <h3 style={{ fontSize: 14 }}>Data Export</h3>
          <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
            Download a full copy of your health timeline, reports metadata, symptoms, and medications.
          </p>
          <button className="btn btn-outline" style={{ width: '100%' }} onClick={handleExportData} disabled={exporting}>
            {exporting ? 'Preparing export…' : '📥 Export My Data (JSON)'}
          </button>
        </div>

        <div className="privacy-section" style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, marginTop: 12 }}>
          <h3 style={{ fontSize: 14, color: 'var(--color-error)' }}>Danger Zone</h3>
          <button className="btn btn-outline" style={{ width: '100%', color: 'var(--color-error)', borderColor: 'var(--color-error)' }} onClick={handleDeleteData}>
            🗑️ Permanently Delete My Account & Data
          </button>
        </div>
      </div>
    </div>
  );
}
