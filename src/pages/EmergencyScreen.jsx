import { useState } from 'react';
import TopBar from '../components/TopBar';
import SideNav from '../components/SideNav';

export default function EmergencyScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="screen">
      <TopBar title="Emergency Assistance" onMenu={() => setDrawerOpen(true)} />
      <SideNav open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="card emergency-banner" style={{ marginTop: 16 }}>
        <span style={{ fontSize: 44 }}>🆘</span>
        <h2 style={{ color: '#d32f2f', margin: '8px 0 4px' }}>Urgent Medical Attention</h2>
        <p style={{ fontSize: 13, margin: '0 0 16px' }}>
          If you or someone near you is experiencing severe symptoms like chest pain, severe breathlessness, stroke signs, or intense bleeding, please seek immediate emergency care.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="tel:108" className="btn" style={{ background: '#d32f2f', color: '#fff', textAlign: 'center', textDecoration: 'none', padding: 12, fontWeight: 700 }}>
            📞 Call Ambulance / Emergency Services (108)
          </a>
          <a href="tel:112" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none', padding: 10 }}>
            📞 National Emergency Helpline (112)
          </a>
          <a href="tel:102" className="btn btn-outline" style={{ textAlign: 'center', textDecoration: 'none', padding: 10 }}>
            📞 Pregnant Women & Infant Helpline (102)
          </a>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>Safety Reminder</h3>
        <p style={{ fontSize: 13, color: 'var(--color-muted)' }}>
          HealBuddy is an organization & navigation tool designed for personal record-keeping. It is not an automated emergency responder and does not replace professional medical intervention during acute emergencies.
        </p>
      </div>
    </div>
  );
}
