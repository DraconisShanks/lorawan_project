// frontend/src/App.js
import React, { useState, useEffect } from "react";
import Graph from "./Graph";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

const App = () => {
  const [activeTab, setActiveTab] = useState("voltage");
  const [labels, setLabels] = useState([]);
  const [voltageData, setVoltageData] = useState([]);
  const [currentData, setCurrentData] = useState([]);
  const [powerData, setPowerData] = useState([]); // New state for power data
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    socket.on("serialData", ({ voltage, current, time }) => {
      console.log("Received:", { voltage, current, time });

      setLabels((prev) => [...prev.slice(-19), time]);
      setVoltageData((prev) => [...prev.slice(-19), voltage]);
      setCurrentData((prev) => [...prev.slice(-19), current]);

      const power = voltage * current;
      setPowerData((prev) => [...prev.slice(-19), power]); // Calculate power and store

      // Update table data including power value
      setTableData((prev) =>
        [...prev, { voltage, current, power, time }].slice(-5)
      ); // Only keep the last 5 readings
    });

    return () => {
      socket.off("serialData");
    };
  }, []);

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
              : powerData // Display power data
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
                <th style={thStyle}>Power (W)</th> {/* Added Power column */}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, idx) => (
                <tr key={idx}>
                  <td style={tdStyle}>{row.time}</td>
                  <td style={tdStyle}>{row.voltage}</td>
                  <td style={tdStyle}>{row.current}</td>
                  <td style={tdStyle}>{row.power}</td>{" "}
                  {/* Display Power value */}
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
        {["voltage", "current", "power", "data", "download"].map((tab) => (
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
        ))}
      </nav>

      <main style={{ padding: "30px" }}>{renderContent()}</main>
    </div>
  );
};

export default App;
