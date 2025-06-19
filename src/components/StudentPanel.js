import React, { useEffect, useState } from "react";
import socket from "../socket";

const StudentPanel = () => {
  const [name, setName] = useState(() => sessionStorage.getItem("studentName") || "");
  const [tempName, setTempName] = useState("");
  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [results, setResults] = useState(null);
  const [isKicked, setIsKicked] = useState(() => sessionStorage.getItem("isKicked") === "true");

  useEffect(() => {
    const savedName = sessionStorage.getItem("studentName");
    if (savedName && !isKicked) {
      socket.emit("join", savedName);
    }

    socket.on("poll-started", (data) => {
      console.log("📩 poll-started received:", data);
      setQuestionData(data);
      setSubmitted(false);
      setSelectedOption(null);
      setTimeLeft(60);
      setResults(null);
    });

    socket.on("poll-results", (answers) => {
      console.log("📊 poll-results received:", answers);
      setSubmitted(true);
      const countMap = {};
      Object.values(answers).forEach((ans) => {
        countMap[ans] = (countMap[ans] || 0) + 1;
      });
      setResults(countMap);
    });

    socket.on("kicked", () => {
      alert("🚫 You have been removed by the teacher.");
      sessionStorage.setItem("isKicked", "true");
      sessionStorage.removeItem("studentName");
      setIsKicked(true);
      setName("");
      setQuestionData(null);
      setSubmitted(true);
    });

    return () => {
      socket.off("poll-started");
      socket.off("poll-results");
      socket.off("kicked");
    };
  }, [isKicked]);

  useEffect(() => {
    if (questionData && !submitted) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [questionData, submitted]);

  const handleSubmit = () => {
    if (selectedOption !== null && name && !isKicked) {
      socket.emit("submit-answer", {
        name,
        answer: selectedOption,
      });
      setSubmitted(true);
    }
  };

  const handleNameSubmit = () => {
    if (tempName.trim()) {
      sessionStorage.setItem("studentName", tempName);
      setName(tempName);
      socket.emit("join", tempName);
    }
  };

  if (isKicked) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#d32f2f" }}>
        <h2>🚫 You have been removed by the teacher.</h2>
        <p>You are no longer allowed to participate in this poll.</p>
      </div>
    );
  }

  if (!name) {
    return (
      <div className="teacher-panel-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div className="teacher-header-badge">✦ Intervue Poll</div>
        <div className="teacher-title">Let's <strong>Get Started</strong></div>
        <div className="teacher-subtitle" style={{ maxWidth: 600 }}>
          If you’re a student, you’ll be able to <strong>submit your answers</strong>, participate in live polls, and see how your responses compare with your classmates
        </div>
        <div style={{ width: '100%', maxWidth: 500, margin: '32px auto 0 auto' }}>
          <div className="teacher-label" style={{ marginBottom: 8 }}>Enter your Name</div>
          <input
            type="text"
            className="teacher-question-textarea"
            style={{ minHeight: 0, marginTop: 0, marginBottom: 0, fontSize: 18, background: '#f3f3f3' }}
            placeholder="Your Name"
            value={tempName}
            onChange={e => setTempName(e.target.value)}
          />
        </div>
        <button
          className="teacher-ask-btn"
          style={{ marginTop: 40, minWidth: 240 }}
          onClick={handleNameSubmit}
          disabled={!tempName.trim()}
        >
          Continue
        </button>
      </div>
    );
  }

  if (!questionData) return <p>Waiting for teacher to start poll...</p>;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: 700, margin: '80px auto 0 auto', background: '#fff', borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.04)', padding: '32px 24px 40px 24px', position: 'relative' }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 18 }}>Question</div>
        <div style={{ background: '#444', color: '#fff', fontSize: 20, fontWeight: 600, borderRadius: '8px 8px 0 0', padding: '18px 24px', marginBottom: 0 }}>{questionData.question}</div>
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {questionData.options.map((opt, idx) => (
            <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <button
                style={{
                  display: 'flex', alignItems: 'center', width: '100%', background: selectedOption === idx ? '#6c5ce7' : '#f3f3f3', color: selectedOption === idx ? '#fff' : '#222', border: 'none', borderRadius: 8, fontSize: 18, cursor: submitted ? 'not-allowed' : 'pointer', minHeight: 48, outline: 'none', margin: 0, padding: 0, transition: 'background 0.2s, color 0.2s'
                }}
                disabled={submitted}
                onClick={() => setSelectedOption(idx)}
              >
                <span style={{ background: selectedOption === idx ? '#fff' : '#6c5ce7', color: selectedOption === idx ? '#6c5ce7' : '#fff', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 16, margin: '0 18px 0 0' }}>{idx + 1}</span>
                <span style={{ flex: 1, textAlign: 'left', fontSize: 18, fontWeight: 500, padding: '12px 0' }}>{opt}</span>
              </button>
            </li>
          ))}
        </ul>
        {!submitted && (
          <button
            style={{ background: 'linear-gradient(90deg, #6c5ce7 0%, #5f6cff 100%)', color: '#fff', border: 'none', borderRadius: 30, padding: '14px 40px', fontSize: 18, fontWeight: 600, cursor: 'pointer', marginTop: 32, float: 'right', marginBottom: 0 }}
            onClick={handleSubmit}
            disabled={selectedOption === null}
          >
            Submit Answer
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentPanel;
