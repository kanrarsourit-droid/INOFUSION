import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages imports
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SymptomChecker from './pages/SymptomChecker';
import HospitalFinder from './pages/HospitalFinder';
import EmergencyAssistance from './pages/EmergencyAssistance';
import PatientDashboard from './pages/PatientDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Header Sticky Navigation */}
            <Navbar />
            
            {/* Main viewport */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/triage" element={<SymptomChecker />} />
                <Route path="/hospitals" element={<HospitalFinder />} />
                <Route path="/emergency" element={<EmergencyAssistance />} />
                <Route path="/dashboard" element={<PatientDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </main>
            
            {/* Footer Navigation */}
            <Footer />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
