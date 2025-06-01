import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Academic from './components/Academic';
import Growth from './components/Growth';
import Library from './components/Library';
import Jobs from './components/Jobs';
import Mentors from './components/Mentors';
import Users from './components/Users';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
            <Route index element={<Navigate to="/academic" replace />} />
            <Route path="academic" element={<Academic />} />
            <Route path="growth" element={<Growth />} />
            <Route path="library" element={<Library />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="mentors" element={<Mentors />} />
            <Route path="users" element={<Users />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App; 