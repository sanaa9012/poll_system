import React, { useEffect, useState } from "react";
import socket from "../socket";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import FloatingPanel from "./FloatingPanel";

ChartJS.register(ArcElement, Tooltip, Legend);

const TIMER_OPTIONS = [60, 90, 120];

const TeacherPanel = () => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correct, setCorrect] = useState([false, false]);
  const [pollSent, setPollSent] = useState(false);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState(null);
  const [timer, setTimer] = useState(TIMER_OPTIONS[0]);
  const [showPanel, setShowPanel] = useState(true);

  // 🔁 Set up listeners
  useEffect(() => {
    socket.on("student-status", (studentList) => {
      console.log("📥 student-status received:", studentList);
      setStudents(studentList);
    });

    socket.on("poll-results", (answers) => {
      console.log("📥 poll-results received:", answers);
      const countMap = {};
      Object.values(answers).forEach((ans) => {
        countMap[ans] = (countMap[ans] || 0) + 1;
      });
      setResults(countMap);
    });

    return () => {
      socket.off("student-status");
      socket.off("poll-results");
    };
  }, []);

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCorrectChange = (index, value) => {
    const newCorrect = [...correct];
    newCorrect[index] = value;
    setCorrect(newCorrect);
  };

  const addOption = () => {
    setOptions([...options, ""]);
    setCorrect([...correct, false]);
  };

  const handleSubmit = () => {
    const filteredOptions = options.filter((opt) => opt.trim() !== "");
    if (question.trim() && filteredOptions.length >= 2) {
      socket.emit("new-question", {
        question,
        options: filteredOptions,
        correct: correct.slice(0, filteredOptions.length),
        timer,
      });
      setPollSent(true);
      setResults(null);
    }
  };

  const endPollNow = () => {
    socket.emit("end-poll");
  };

  const handleKick = (student) => {
    // Implement actual kick logic with socket if needed
    alert(`Kicked out ${student.name}`);
  };

  const submittedCount = students.filter((s) => s.submitted).length;

  const pieData = results
    ? {
        labels: options.map((opt, idx) => opt),
        datasets: [
          {
            label: "Votes",
            data: options.map((_, idx) => results[idx] || 0),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
              "#FF9F40",
            ],
            borderWidth: 1,
          },
        ],
      }
    : null;

  return (
    <div
      className="teacher-panel-container"
      style={{ position: "relative", minHeight: 600 }}
    >
      <div className="teacher-header-badge">✦ Intervue Poll</div>

      {!pollSent ? (
        <>
          <div className="teacher-title">
            Let's <strong>Get Started</strong>
          </div>
          <div className="teacher-subtitle">
            you'll have the ability to create and manage polls, ask questions,
            and monitor your students' responses in real-time.
          </div>

          <div className="teacher-label">Enter your question</div>
          <div className="teacher-question-row">
            <textarea
              className="teacher-question-textarea"
              maxLength={100}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question here..."
            />
            <select
              className="teacher-timer-dropdown"
              value={timer}
              onChange={(e) => setTimer(Number(e.target.value))}
            >
              {TIMER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt} seconds
                </option>
              ))}
            </select>
          </div>
          <div className="teacher-char-count">{question.length}/100</div>

          <div className="teacher-options-header">
            <span className="teacher-label">Edit Options</span>
            <span className="teacher-label">Is it Correct?</span>
          </div>
          <div className="teacher-options-list">
            {options.map((opt, idx) => (
              <div className="teacher-option-row" key={idx}>
                <span className="teacher-option-number">{idx + 1}</span>
                <input
                  className="teacher-option-input"
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  maxLength={60}
                />
                <div className="teacher-option-correct">
                  <label>
                    <input
                      className="teacher-radio"
                      type="radio"
                      name={`correct-${idx}`}
                      checked={!!correct[idx]}
                      onChange={() => handleCorrectChange(idx, true)}
                    />
                    Yes
                  </label>
                  <label>
                    <input
                      className="teacher-radio"
                      type="radio"
                      name={`correct-${idx}`}
                      checked={!correct[idx]}
                      onChange={() => handleCorrectChange(idx, false)}
                    />
                    No
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button className="teacher-add-option-btn" onClick={addOption}>
            + Add More option
          </button>

          <div className="teacher-bottom-bar">
            <button
              className="teacher-ask-btn"
              onClick={handleSubmit}
              disabled={
                !question.trim() ||
                options.filter((opt) => opt.trim()).length < 2
              }
            >
              Ask Question
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className="teacher-title"></h2>
          <button className="teacher-add-option-btn" onClick={endPollNow}>
            End Poll Now
          </button>
        </>
      )}

      <hr />
      

      {results && (
        <div style={{ maxWidth: 600, margin: "40px auto 0 auto" }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
              padding: 32,
              position: "relative",
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 22,
                marginBottom: 24,
              }}
            >
              Question
            </div>
            <div
              style={{
                background:
                  "linear-gradient(90deg, #444 60%, #6E6E6E 100%)",
                color: "#fff",
                fontWeight: 600,
                fontSize: 18,
                borderRadius: 6,
                padding: "14px 24px",
                marginBottom: 24,
              }}
            >
              {question}
            </div>
            {options.map((option, idx) => {
              const count = results[idx] || 0;
              const totalVotes = Object.values(results).reduce(
                (sum, val) => sum + val,
                0
              );
              const percentage =
                totalVotes > 0 ? ((count / totalVotes) * 100).toFixed(0) : 0;
              return (
                <div key={idx} style={{ marginBottom: 18 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "#a084e8",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 16,
                        marginRight: 12,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div style={{ fontWeight: 500, fontSize: 16 }}>{option}</div>
                  </div>
                  <div
                    style={{
                      background: "#f3f3f3",
                      borderRadius: 12,
                      overflow: "hidden",
                      height: 32,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        background: "#a084e8",
                        height: "100%",
                        width: `${percentage}%`,
                        transition: "width 0.3s ease",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: 12,
                        top: 0,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 15,
                      }}
                    >
                      {count}

                    
                    </div>
                  </div>
                </div>
                
              );
              
            })}
          </div>
          {/* <h3>👥 Students: {students.length}</h3>
      <p>
        ✅ Submitted: {submittedCount} / {students.length}
      </p>
      <ul>
        {students.map((student, idx) => (
          <li key={idx}>
            {student.name} — {student.submitted ? "✅ Submitted" : "⏳ Waiting"}
          </li>
        ))}
      </ul> */}
        </div>
      )}

      {/* Floating Panel for Participants/Chat */}
      {showPanel && (
        <FloatingPanel participants={students} onKick={handleKick} />
      )}
    </div>
  );
};

export default TeacherPanel;
