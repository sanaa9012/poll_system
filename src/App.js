import React, { useState } from "react";
import TeacherPanel from "./components/TeacherPanel";
import StudentPanel from "./components/StudentPanel";
import "./App.css";

function App() {
  const [role, setRole] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const handleContinue = () => {
    if (selectedRole) {
      setRole(selectedRole);
    }
  };

  if (role) {
    return role === "teacher" ? <TeacherPanel /> : <StudentPanel />;
  }

  return (
    <div className="app-container">
      <div className="header-badge">Intervue Poll</div>
      
      <h1 className="welcome-title">Welcome to the Live Polling System</h1>
      <p className="welcome-subtitle">
        Please select the role that best describes you to begin using the live polling system
      </p>

      <div className="role-container">
        <div 
          className={`role-card ${selectedRole === 'student' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('student')}
        >
          <h3>I'm a Student</h3>
          <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
        </div>

        <div 
          className={`role-card ${selectedRole === 'teacher' ? 'selected' : ''}`}
          onClick={() => setSelectedRole('teacher')}
        >
          <h3>I'm a Teacher</h3>
          <p>Submit answers and view live poll results in real-time.</p>
        </div>
      </div>

      <button 
        className="continue-button" 
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        Continue
      </button>
    </div>
  );
}

export default App;
