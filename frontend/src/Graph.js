// frontend/src/Graph.js
import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from "chart.js/auto";

const Graph = ({ type, labels, data }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label:
          type === "voltage"
            ? "Voltage (V)"
            : type === "current"
            ? "Current (A)"
            : "Power (W)",
        data,
        borderColor:
          type === "voltage" ? "blue" : type === "current" ? "green" : "purple", // Color for power graph
        backgroundColor:
          type === "voltage"
            ? "rgba(0, 0, 255, 0.2)"
            : type === "current"
            ? "rgba(0, 255, 0, 0.2)"
            : "rgba(128, 0, 128, 0.2)", // Background color for power graph
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

export default Graph;
