import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Layout } from './components/Layout';
import { Registration } from './components/Registration';
import { Catalog } from './components/Catalog';
import { AppointmentForm } from './components/AppointmentForm';
import { Payment } from './components/Payment';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';
import { Guide } from './components/Guide';
import { Support } from './components/Support';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { Client } from './types';

export default function App() {
  const [client, setClient] = useState<Client | null>(() => {
    const saved = localStorage.getItem('gloria_client');
    return saved ? JSON.parse(saved) : null;
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    return localStorage.getItem('gloria_admin') === 'true';
  });

  const [accessibility, setAccessibility] = useState({
    fontSize: 100,
    highContrast: false,
    simplifiedMode: false,
  });

  useEffect(() => {
    if (client) {
      localStorage.setItem('gloria_client', JSON.stringify(client));
      console.log('Client updated:', client);
    } else {
      localStorage.removeItem('gloria_client');
    }
  }, [client]);

  useEffect(() => {
    if (isAdmin) {
      localStorage.setItem('gloria_admin', 'true');
      console.log('Admin logged in');
    } else {
      localStorage.removeItem('gloria_admin');
    }
  }, [isAdmin]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.isAnonymous) {
        // Se for anônimo, o cliente já deve estar no localStorage ou será setado no Registration
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      setClient(null);
      setIsAdmin(false);
      localStorage.removeItem('gloria_client');
      localStorage.removeItem('gloria_admin');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const accessibilityStyles = {
    fontSize: `${accessibility.fontSize}%`,
    filter: accessibility.highContrast ? 'contrast(1.5) grayscale(0.5)' : 'none',
  };

  if (!client && !isAdmin) {
    return (
      <div style={accessibilityStyles}>
        <Registration onRegister={setClient} onAdminLogin={() => setIsAdmin(true)} />
      </div>
    );
  }

  return (
    <div style={accessibilityStyles} className={accessibility.simplifiedMode ? 'simplified-mode' : ''}>
      <Router>
        <Layout client={client} isAdmin={isAdmin} onLogout={handleLogout} accessibility={accessibility} setAccessibility={setAccessibility}>
          <Routes>
            <Route path="/" element={isAdmin ? <Navigate to="/admin" /> : <Catalog />} />
            <Route path="/agendar" element={<AppointmentForm client={client} isAdmin={isAdmin} />} />
            <Route path="/pagamento" element={<Payment client={client} />} />
            <Route path="/perfil" element={<Profile client={client} onLogout={handleLogout} accessibility={accessibility} setAccessibility={setAccessibility} />} />
            <Route path="/guia" element={<Guide />} />
            <Route path="/suporte" element={<Support />} />
            <Route path="/privacidade" element={<PrivacyPolicy />} />
            {isAdmin && <Route path="/admin" element={<AdminPanel onLogout={() => setIsAdmin(false)} />} />}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      </Router>
    </div>
  );
}

