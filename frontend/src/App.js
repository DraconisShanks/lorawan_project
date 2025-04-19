import React, { useState, useEffect } from "react";
import Graph from "./Graph";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [activeTab, setActiveTab] = useState("voltage");

  const [labels, setLabels] = useState([]);
  const [voltageData, setVoltageData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [powerData, setPowerData] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [relayState, setRelayState] = useState(0); // 0 = OFF, 1 = ON

  useEffect(() => {
    socket.on("serialData", ({ voltage, current, time }) => {
      console.log("Received:", { voltage, current, time });

      setLabels((prev) => [...prev.slice(-19), time]);
      setVoltageData((prev) => [...prev.slice(-19), voltage]);
      setCurrentData((prev) => [...prev.slice(-19), current]);

      const power = voltage * current;
      setPowerData((prev) => [...prev.slice(-19), power]);

      setTableData((prev) =>
        [...prev, { voltage, current, power, time }].slice(-5)
      );
    });

    socket.on("relayState", (state) => {
      console.log("Relay State:", state);
      setRelayState(state);
    });

    return () => {
      socket.off("serialData");
      socket.off("relayState");
    };
  }, []);

  const toggleRelay = () => {
    const newState = relayState === 1 ? 0 : 1;
    socket.emit("setRelay", newState);
    setRelayState(newState); // Optimistically update
  };

  const renderContent = () => {
    if (
      activeTab === "voltage" ||
      activeTab === "current" ||
      activeTab === "power"
    ) {
      return (
        <Graph
          type={activeTab}
          labels={labels}
          data={
            activeTab === "voltage"
              ? voltageData
              : activeTab === "current"
              ? currentData
              : powerData
          }
        />
      );
    } else if (activeTab === "data") {
      return (
        <div style={{ padding: "20px" }}>
          <h2>Last 5 Readings</h2>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Time</th>
                <th style={thStyle}>Voltage (V)</th>
                <th style={thStyle}>Current (A)</th>
                <th style={thStyle}>Power (W)</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{row.time}</td>
                  <td style={tdStyle}>{row.voltage}</td>
                  <td style={tdStyle}>{row.current}</td>
                  <td style={tdStyle}>{row.power}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (activeTab === "download") {
      return (
        <div style={{ textAlign: "center" }}>
          <h2>Download CSV Data</h2>
          <button
            onClick={() => {
              window.location.href = "http://localhost:5000/download-csv";
            }}
            style={{
              padding: "10px 20px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "20px",
            }}
          >
            Download CSV
          </button>
        </div>
      );
    } else if (activeTab === "relay") {
      return (
        <div style={{ textAlign: "center", paddingTop: "40px" }}>
          <h2>Relay Control</h2>
          <button
            onClick={toggleRelay}
            style={{
              padding: "20px 40px",
              fontSize: "18px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: relayState === 1 ? "#28a745" : "#dc3545",
              color: "#fff",
              cursor: "pointer",
              boxShadow: `0 0 20px ${relayState === 1 ? "#28a745" : "#dc3545"}`,
              transition: "all 0.3s ease",
            }}
          >
            Relay is {relayState === 1 ? "ON" : "OFF"}
          </button>
        </div>
      );
    }
    return null;
  };

  const thStyle = {
    padding: "10px",
    backgroundColor: "#eee",
    border: "1px solid #ccc",
  };

  const tdStyle = {
    padding: "8px",
    border: "1px solid #ccc",
    textAlign: "center",
  };

  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          background: "#333",
          padding: "15px 0",
        }}
      >
        {["voltage", "current", "power", "data", "download", "relay"].map(
          (tab) => (
            <span
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                color: "#fff",
                cursor: "pointer",
                fontWeight: activeTab === tab ? "bold" : "normal",
                textDecoration: activeTab === tab ? "underline" : "none",
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
          )
        )}
      </nav>

      <main style={{ padding: "30px" }}>{renderContent()}</main>
    </div>
  );
};

export default App;
