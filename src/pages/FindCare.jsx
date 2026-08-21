import { useState } from 'react';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';

export default function FindCare() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'
  const [recommendation, setRecommendation] = useState(null);

  const mockProviders = [
    { id: 1, name: 'Apollo Health Clinic', specialty: 'General Physician & Primary Care', location: 'Vijayawada Central', dist: '1.8 km', phone: '+91 866 2450000', verified: true, coords: { x: 30, y: 40 } },
    { id: 2, name: 'Dr. R. K. Varma Clinic', specialty: 'General Practitioner', location: 'MG Road, Vijayawada', dist: '2.5 km', phone: '+91 866 2571122', verified: true, coords: { x: 50, y: 60 } },
    { id: 3, name: 'Manipal Super Specialty Hospital', specialty: 'Multi-specialty Hospital', location: 'Tadepalli', dist: '4.2 km', phone: '+91 866 2223344', verified: true, coords: { x: 70, y: 35 } },
    { id: 4, name: 'City Care Diagnostics & Clinic', specialty: 'Internal Medicine', location: 'Eluru Road', dist: '5.1 km', phone: '+91 866 2889900', verified: true, coords: { x: 45, y: 75 } }
  ];

  function handleAnalyze(e) {
    e.preventDefault();
    if (!query.trim()) return;
    const q = query.toLowerCase();

    let rec = {
      type: 'General Physician / Primary Care',
      why: 'A General Physician is recommended for initial assessment, general symptoms, fever, or routine consultations.',
      disclaimer: 'HealBuddy provides healthcare navigation guidance to help you choose the relevant specialty. This is not a diagnosis.'
    };

    if (q.includes('chest') || q.includes('heart') || q.includes('palpitation')) {
      rec = {
        type: 'Cardiologist / Urgent Care',
        why: 'Symptoms involving chest discomfort or heart palpitations are best evaluated by a Cardiologist or Emergency Care.',
        disclaimer: 'If chest pain is severe or accompanied by shortness of breath, please seek emergency care (108) immediately.'
      };
    } else if (q.includes('skin') || q.includes('rash') || q.includes('itching')) {
      rec = {
        type: 'Dermatologist',
        why: 'Skin conditions, persistent rashes, or allergic skin reactions are specialized under Dermatology.',
        disclaimer: 'HealBuddy navigation guidance.'
      };
    } else if (q.includes('stomach') || q.includes('digestion') || q.includes('acidity') || q.includes('pain')) {
      rec = {
        type: 'Gastroenterologist or General Physician',
        why: 'Abdominal pain or digestive changes can be initially checked by a General Physician, or a Gastroenterologist for persistent issues.',
        disclaimer: 'HealBuddy navigation guidance.'
      };
    }

    setRecommendation(rec);
  }

  return (
    <div className="screen">
      <TopBar title="Find the Right Care" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="card" style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 16, margin: '0 0 8px' }}>🩺 Specialist & Care Advisor</h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '0 0 12px' }}>
          Describe your symptoms to explore which type of healthcare professional may be relevant for your consultation.
        </p>

        <form onSubmit={handleAnalyze}>
          <div className="field">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. stomach pain after eating, fever for 2 days…"
            />
          </div>
          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>
            Explore Relevant Care
          </button>
        </form>

        {recommendation && (
          <div style={{ marginTop: 16, padding: 12, background: 'var(--color-bg-secondary)', borderRadius: 8 }}>
            <span className="tag accent">SUGGESTED SPECIALTY</span>
            <h3 style={{ margin: '6px 0 4px', fontSize: 16, color: 'var(--color-primary-dark)' }}>
              {recommendation.type}
            </h3>
            <p style={{ margin: '0 0 8px', fontSize: 13 }}>{recommendation.why}</p>
            <p style={{ margin: 0, fontSize: 11, color: 'var(--color-muted)' }}>ℹ️ {recommendation.disclaimer}</p>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 12px' }}>
        <h3 style={{ margin: 0, fontSize: 16 }}>Available Nearby Providers</h3>
        <div className="lang-toggle" style={{ width: 140 }}>
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>List</button>
          <button className={viewMode === 'map' ? 'active' : ''} onClick={() => setViewMode('map')}>Map</button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="providers-list">
          {mockProviders.map((p) => (
            <div key={p.id} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: '0 0 4px', fontSize: 15 }}>{p.name} {p.verified && '✅'}</h4>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-primary-dark)', fontWeight: 500 }}>{p.specialty}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-muted)' }}>📍 {p.location} • <strong>{p.dist}</strong></p>
                </div>
              </div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                <a href={`tel:${p.phone}`} className="btn btn-outline" style={{ flex: 1, padding: 6, fontSize: 12, textDecoration: 'none', textAlign: 'center' }}>
                  📞 Call
                </a>
                <button className="btn btn-primary" style={{ flex: 1, padding: 6, fontSize: 12 }} onClick={() => alert(`Directions to ${p.name}`)}>
                  🗺️ Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ height: 260, position: 'relative', background: '#e5eee9', overflow: 'hidden', borderRadius: 12 }}>
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>
            Interactive Map View (Vijayawada)
          </div>
          {mockProviders.map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: `${p.coords.y}%`,
                left: `${p.coords.x}%`,
                background: 'var(--color-primary-dark)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 16,
                fontSize: 11,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              onClick={() => alert(`${p.name} - ${p.dist}`)}
            >
              📍 {p.name.split(' ')[0]} ({p.dist})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
