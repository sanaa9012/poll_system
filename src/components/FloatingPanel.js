import React, { useState } from "react";
import socket from "../socket"; // Adjust the import based on your project structure

const FloatingPanel = ({ participants = [], onKick }) => {
  const [activeTab, setActiveTab] = useState("participants");

  const submittedCount = participants.filter((p) => p.submitted).length;

  return (
    <div
      style={{
        position: "fixed",
        top: 100,
        right: 80,
        width: 350,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 16px rgba(0,0,0,0.12)",
        zIndex: 1000,
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #eee" }}>
        <div
          onClick={() => setActiveTab("chat")}
          style={{
            flex: 1,
            padding: "16px 0",
            textAlign: "center",
            cursor: "pointer",
            fontWeight: activeTab === "chat" ? 600 : 400,
            borderBottom:
              activeTab === "chat" ? "2px solid #a084e8" : "none",
            color: activeTab === "chat" ? "#a084e8" : "#333",
          }}
        >
          Chat
        </div>
        <div
          onClick={() => setActiveTab("participants")}
          style={{
            flex: 1,
            padding: "16px 0",
            textAlign: "center",
            cursor: "pointer",
            fontWeight: activeTab === "participants" ? 600 : 400,
            borderBottom:
              activeTab === "participants" ? "2px solid #a084e8" : "none",
            color: activeTab === "participants" ? "#a084e8" : "#333",
          }}
        >
          Participants
        </div>
      </div>

      {/* Participants Tab */}
      {activeTab === "participants" && (
        <div style={{ padding: 20 }}>
          <div style={{ marginBottom: 10, fontSize: 14, color: "#555" }}>
            👥 <strong>Total:</strong> {participants.length} &nbsp;|&nbsp;
            ✅ <strong>Submitted:</strong> {submittedCount}
          </div>

          <table style={{ width: "100%", fontSize: 15 }}>
            <thead>
              <tr style={{ color: "#888", fontWeight: 500 }}>
                <td style={{ paddingBottom: 8 }}>Name</td>
                <td>Status</td>
                <td>Action</td>
              </tr>
            </thead>
            <tbody>
              {participants.map((p, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, padding: "6px 0" }}>{p.name}</td>
                  <td style={{ color: p.submitted ? "green" : "#888" }}>
                    {p.submitted ? "✅ Submitted" : "⏳ Waiting"}
                  </td>
                  <td>
                    <span
                      style={{
                        color: "#d32f2f",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                      onClick={() => {
                        socket.emit("kick", p.name);
                        onKick(p);
                    }}
                    >
                      Kick
                    </span>
                  </td>
                </tr>
              ))}
              {participants.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ paddingTop: 20, color: "#aaa" }}>
                    No participants yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <div style={{ padding: 20, color: "#aaa", textAlign: "center" }}>
          💬 Chat coming soon...
        </div>
      )}
    </div>
  );
};

export default FloatingPanel;
