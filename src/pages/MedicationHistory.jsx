import { useEffect, useState } from 'react';
import { supabase, TABLES } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';
import { EmptyState, LoadingBlock } from '../components/Bits';

export default function MedicationHistory() {
  const { user } = useAuth();
  const [meds, setMeds] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [notes, setNotes] = useState('');

  async function loadMeds() {
    setError('');
    const { data, error: err } = await supabase
      .from(TABLES.medications)
      .select('*')
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    if (err) setError('Failed to load medications.');
    else setMeds(data || []);
  }

  useEffect(() => {
    loadMeds();
  }, [user.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');

    const { error: err } = await supabase.from(TABLES.medications).insert({
      user_id: user.id,
      name: name.trim(),
      reason: reason.trim() || null,
      start_date: startDate || new Date().toISOString().slice(0, 10),
      end_date: endDate || null,
      prescribed_by: prescribedBy.trim() || null,
      notes: notes.trim() || null
    });

    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setName('');
      setReason('');
      setStartDate('');
      setEndDate('');
      setPrescribedBy('');
      setNotes('');
      setShowAdd(false);
      loadMeds();
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this medicine entry?')) return;
    await supabase.from(TABLES.medications).delete().eq('id', id);
    loadMeds();
  }

  return (
    <div className="screen">
      <TopBar title="My Medicines" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
        <h2 style={{ fontSize: 18, margin: 0 }}>Medication Record</h2>
        <button className="btn btn-primary" style={{ padding: '8px 14px', fontSize: 13 }} onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : '+ Add Medicine'}
        </button>
      </div>

      <div className="disclaimer-banner">
        ℹ️ HealBuddy stores your medication history for personal organization. It does not prescribe or alter medications.
      </div>

      {showAdd && (
        <form className="card" onSubmit={handleAdd} style={{ marginBottom: 20 }}>
          <h3>Add Medicine</h3>
          <div className="field">
            <label>Medicine Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Paracetamol 500mg" />
          </div>
          <div className="field">
            <label>Reason / Purpose</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fever & body pain" />
          </div>
          <div className="field" style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label>End Date (Optional)</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label>Prescribed By / Doctor</label>
            <input value={prescribedBy} onChange={(e) => setPrescribedBy(e.target.value)} placeholder="e.g. Dr. Rao (General Physician)" />
          </div>
          <div className="field">
            <label>Notes / Dosage Instructions</label>
            <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Take after meal twice daily" />
          </div>

          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Saving…' : 'Save Medicine'}
          </button>
        </form>
      )}

      {error && <p className="error-text">{error}</p>}
      {meds === null && <LoadingBlock />}

      {meds !== null && meds.length === 0 && !showAdd && (
        <EmptyState emoji="💊" title="No medicines logged" description="Keep track of your current and past prescribed medicines." />
      )}

      <div className="meds-list">
        {meds?.map((med) => (
          <div key={med.id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="tag">MEDICINE</span>
                <h3 style={{ margin: '4px 0 2px' }}>{med.name}</h3>
                {med.reason && <p style={{ margin: 0, fontSize: 13, color: 'var(--color-muted)' }}>Reason: {med.reason}</p>}
              </div>
              <button className="icon-btn" onClick={() => handleDelete(med.id)} style={{ color: 'var(--color-error)' }}>🗑️</button>
            </div>

            <div style={{ margin: '12px 0 0', fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>📅 Started: {med.start_date ? new Date(med.start_date).toLocaleDateString() : 'N/A'}</div>
              <div>🏁 Ended: {med.end_date ? new Date(med.end_date).toLocaleDateString() : 'Ongoing'}</div>
              {med.prescribed_by && <div>🩺 Prescribed by: {med.prescribed_by}</div>}
              {med.notes && <div>📝 Notes: {med.notes}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
