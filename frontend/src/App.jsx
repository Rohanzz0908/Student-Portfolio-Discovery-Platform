import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';

// Pages (all .jsx)
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import Discover from './pages/Discover';
import StudentPortfolio from './pages/StudentPortfolio';
import ResumeView from './pages/ResumeView';
import Messages from './pages/Messages';
import Jobs from './pages/Jobs';

import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/PageTransition';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="/discover" element={<PageTransition><Discover /></PageTransition>} />
            <Route path="/portfolio/:userId" element={<PageTransition><StudentPortfolio /></PageTransition>} />
            <Route path="/resume/:userId" element={<PageTransition><ResumeView /></PageTransition>} />
            <Route path="/messages" element={<PrivateRoute><PageTransition><Messages /></PageTransition></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><PageTransition><Jobs /></PageTransition></PrivateRoute>} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <PrivateRoute><PageTransition><Dashboard /></PageTransition></PrivateRoute>
            } />
            <Route path="/profile/edit" element={
              <PrivateRoute><PageTransition><EditProfile /></PageTransition></PrivateRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  );
}

export default App;
