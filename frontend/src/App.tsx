import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RecruiterDashboard from './components/RecruiterDashboard';
import AddCandidateForm from './components/AddCandidateForm';
import Positions from './components/Positions';
import Position from './components/Position';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RecruiterDashboard />} />
        <Route path="/add-candidate" element={<AddCandidateForm />} />
        <Route path="/positions" element={<Positions />} />
        <Route path="/positions/:id" element={<Position />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
