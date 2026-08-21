import { useState } from 'react';

export default function SpecialistCareMap({ symptomText = '', reportCategory = '', reportName = '' }) {
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Infer specialist based on inputs
  function getSpecialistRecommendation() {
    const text = (symptomText + ' ' + reportCategory + ' ' + reportName).toLowerCase();

    if (text.includes('chest') || text.includes('heart') || text.includes('cardio') || text.includes('ecg')) {
      return {
        specialty: 'Cardiologist / Heart Specialist',
        reason: 'Recommended for cardiovascular parameters, heart palpitations, or chest discomfort.',
        disclaimer: 'If chest pain is severe or acute, please call emergency (108) immediately.'
      };
    }
    if (text.includes('scan') || text.includes('x-ray') || text.includes('mri') || text.includes('bone') || text.includes('joint')) {
      return {
        specialty: 'Orthopedic Specialist / Radiologist',
        reason: 'Recommended for reviewing bone, joint, or radiological imaging results.',
        disclaimer: 'Bring your printed scan film or digital CD to your appointment.'
      };
    }
    if (text.includes('skin') || text.includes('rash') || text.includes('itching') || text.includes('allergy')) {
      return {
        specialty: 'Dermatologist / Allergist',
        reason: 'Recommended for specialized skin conditions, rashes, or allergic responses.',
        disclaimer: 'Avoid applying new unverified ointments before your consultation.'
      };
    }
    if (text.includes('stomach') || text.includes('digestion') || text.includes('acidity') || text.includes('liver') || text.includes('gut')) {
      return {
        specialty: 'Gastroenterologist',
        reason: 'Recommended for gastrointestinal discomfort, digestive changes, or abdominal reports.',
        disclaimer: 'Note down food triggers to share with your doctor.'
      };
    }
    if (text.includes('blood') || text.includes('cbc') || text.includes('hemoglobin') || text.includes('sugar') || text.includes('diabetes')) {
      return {
        specialty: 'General Physician / Endocrinologist',
        reason: 'Recommended for blood test evaluation, metabolic health, or routine lab review.',
        disclaimer: 'Fasting may be required for follow-up blood tests.'
      };
    }

    return {
      specialty: 'General Physician / Primary Care',
      reason: 'Recommended for comprehensive evaluation and initial health consultation.',
      disclaimer: 'Your physician can refer you to a specific specialist if required.'
    };
  }

  const rec = getSpecialistRecommendation();

  const mockProviders = [
    { id: 1, name: 'Apollo Health Clinic', specialty: rec.specialty, location: 'Vijayawada Central', dist: '1.8 km', phone: '+91 866 2450000', verified: true, coords: { x: 30, y: 35 } },
    { id: 2, name: 'Dr. R. K. Varma Care Center', specialty: 'General & Primary Care', location: 'MG Road, Vijayawada', dist: '2.5 km', phone: '+91 866 2571122', verified: true, coords: { x: 55, y: 60 } },
    { id: 3, name: 'Manipal Super Specialty Hospital', specialty: 'Multi-Specialty Center', location: 'Tadepalli', dist: '4.2 km', phone: '+91 866 2223344', verified: true, coords: { x: 75, y: 30 } },
    { id: 4, name: 'City Care Diagnostics & Clinic', specialty: 'Internal Medicine & Labs', location: 'Eluru Road', dist: '5.1 km', phone: '+91 866 2889900', verified: true, coords: { x: 40, y: 75 } }
  ];

  return (
    <div className="card" style={{ marginTop: 20, border: '1.5px solid var(--color-primary)', background: '#F8FAF9' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
        <div>
          <span className="tag accent">🩺 RECOMMENDED CONSULTATION</span>
          <h3 style={{ margin: '6px 0 4px', fontSize: 17, color: 'var(--color-primary-dark)' }}>
            {rec.specialty}
          </h3>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text)' }}>{rec.reason}</p>
        </div>
      </div>

      <p style={{ margin: '10px 0 16px', fontSize: 11, color: 'var(--color-muted)', background: 'rgba(255,255,255,0.7)', padding: '6px 10px', borderRadius: 6 }}>
        ℹ️ {rec.disclaimer}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, borderTop: '1px solid var(--color-border)', paddingTop: 14 }}>
        <h4 style={{ margin: 0, fontSize: 14 }}>Nearby Verified Doctors & Clinics</h4>
        <div className="lang-toggle" style={{ width: 130 }}>
          <button className={viewMode === 'list' ? 'active' : ''} style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setViewMode('list')}>List</button>
          <button className={viewMode === 'map' ? 'active' : ''} style={{ padding: '6px 10px', fontSize: 12 }} onClick={() => setViewMode('map')}>Map</button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="providers-list">
          {mockProviders.slice(0, 3).map((p) => (
            <div key={p.id} style={{ background: '#fff', border: '1px solid var(--color-border)', borderRadius: 10, padding: 12, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{p.name} {p.verified && '✅'}</strong>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-primary-dark)', fontWeight: 500 }}>{p.specialty}</p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-muted)' }}>📍 {p.location} • <strong>{p.dist}</strong></p>
                </div>
              </div>
              <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                <a href={`tel:${p.phone}`} className="btn btn-outline" style={{ flex: 1, padding: '6px', fontSize: 12, textDecoration: 'none', textAlign: 'center' }}>
                  📞 Call
                </a>
                <button className="btn btn-primary" style={{ flex: 1, padding: '6px', fontSize: 12 }} onClick={() => alert(`Directions to ${p.name}`)}>
                  🗺️ Map
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ height: 220, position: 'relative', background: '#e0ece6', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--color-border)' }}>
          <div style={{ position: 'absolute', top: 8, left: 8, background: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, zIndex: 2 }}>
            Interactive Clinic Map
          </div>
          {mockProviders.slice(0, 3).map((p) => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                top: `${p.coords.y}%`,
                left: `${p.coords.x}%`,
                background: 'var(--color-primary-dark)',
                color: '#fff',
                padding: '4px 8px',
                borderRadius: 14,
                fontSize: 11,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              onClick={() => alert(`${p.name} (${p.dist})\nSpecialty: ${p.specialty}\nPhone: ${p.phone}`)}
            >
              📍 {p.name.split(' ')[0]} ({p.dist})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
