import { useEffect, useState } from 'react';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import { EmptyState, LoadingBlock } from '../components/Bits';

export default function ConsultationHistory() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [notes, setNotes] = useState('');
  const [prescriptionText, setPrescriptionText] = useState('');

  async function loadConsultations() {
    const { data } = await supabase
      .from(TABLES.doctorSummaries)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setConsultations(data || []);
  }

  useEffect(() => {
    loadConsultations();
  }, [user.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!doctorName.trim()) return;
    setLoading(true);

    const summaryObj = {
      doctor_name: doctorName.trim(),
      specialty: specialty.trim() || 'General Physician',
      visit_date: visitDate || new Date().toISOString().slice(0, 10),
      notes: notes.trim(),
      prescription: prescriptionText.trim()
    };

    await supabase.from(TABLES.doctorSummaries).insert({
      user_id: user.id,
      summary_json: summaryObj,
      shared: false
    });

    setLoading(false);
    setDoctorName('');
    setSpecialty('');
    setVisitDate('');
    setNotes('');
    setPrescriptionText('');
    setShowAdd(false);
    loadConsultations();
  }

  return (
    <div className="screen">
      <TopBar title="My Consultations" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Doctor Visit Records</h2>
        <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Consultation'}
        </button>
      </div>

      {showAdd && (
        <form className="card" onSubmit={handleAdd} style={{ marginBottom: 20 }}>
          <h3>Log Consultation</h3>
          <div className="field">
            <label>Doctor / Hospital Name *</label>
            <input value={doctorName} onChange={(e) => setDoctorName(e.target.value)} required placeholder="e.g. Dr. A. Sharma" />
          </div>
          <div className="field">
            <label>Specialty</label>
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="e.g. Cardiologist / General Physician" />
          </div>
          <div className="field">
            <label>Visit Date</label>
            <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Doctor Notes & Advice</label>
            <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Advised 7-day course of medicines and follow-up blood test." />
          </div>
          <div className="field">
            <label>Prescribed Medicines / Advice</label>
            <textarea rows={2} value={prescriptionText} onChange={(e) => setPrescriptionText(e.target.value)} placeholder="e.g. Tab Amoxicillin 500mg" />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Saving…' : 'Save Consultation'}
          </button>
        </form>
      )}

      {consultations === null && <LoadingBlock />}
      {consultations !== null && consultations.length === 0 && !showAdd && (
        <EmptyState emoji="🏥" title="No consultations logged" description="Keep a clean history of your doctor visits, notes, and prescriptions." />
      )}

      <div>
        {consultations?.map((item) => {
          const json = item.summary_json || {};
          return (
            <div key={item.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span className="tag accent">CONSULTATION</span>
                  <h3 style={{ margin: '4px 0 2px' }}>{json.doctor_name || 'Doctor Visit'}</h3>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>{json.specialty || 'General'}</p>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-muted)' }}>
                  {json.visit_date ? new Date(json.visit_date).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>

              {json.notes && (
                <div style={{ marginTop: 12, fontSize: 13 }}>
                  <strong>Doctor Advice / Notes:</strong>
                  <p style={{ margin: '4px 0 0', background: 'var(--color-bg-secondary)', padding: '8px', borderRadius: '6px' }}>{json.notes}</p>
                </div>
              )}

              {json.prescription && (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>Prescription:</strong>
                  <p style={{ margin: '4px 0 0', color: 'var(--color-primary-dark)' }}>💊 {json.prescription}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
