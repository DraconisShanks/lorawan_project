// backend/index.js
const express = require("express");
const http = require("http");
const { SerialPort } = require("serialport");
const { ReadlineParser } = require("@serialport/parser-readline");
const socketIO = require("socket.io");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });
app.use(cors());

const portName = "COM17"; // Change to your COM port
const serial = new SerialPort({ path: portName, baudRate: 115200 });
const parser = serial.pipe(new ReadlineParser({ delimiter: "\n" }));

const logFilePath = path.join(__dirname, "data_log.csv");

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, "Timestamp,Voltage (V),Current (A)\n");
}

parser.on("data", (data) => {
  const trimmed = data.trim();
  console.log("Serial Data:", trimmed);

  // Parsing from: +RCV=2,8, 5,0.079,-41,47
  const match = trimmed.match(/\+RCV=\d+,\d+,\s*(-?\d+),([\d.]+),/);
  if (match) {
    const voltage = parseFloat(match[1]);
    const current = parseFloat(match[2]);
    const timestamp = new Date().toISOString();

    console.log("Parsed -> Voltage:", voltage, "Current:", current);

    io.emit("serialData", {
      voltage,
      current,
      time: new Date().toLocaleTimeString(),
    });

    fs.appendFile(logFilePath, `${timestamp},${voltage},${current}\n`, (err) => {
      if (err) console.error("CSV Log Error:", err);
    });
  } else {
    console.log("Invalid format, skipping:", trimmed);
  }
});

server.listen(5000, () => console.log("Server running on http://localhost:5000"));

app.get("/download-csv", (req, res) => {
  res.download(logFilePath, "data_log.csv", (err) => {
    if (err) {
      console.error("Download error:", err);
      res.status(500).send("Download failed.");
    }
  });
});
