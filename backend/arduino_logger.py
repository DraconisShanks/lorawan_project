import serial
import csv
import time

# --- Setup Serial Connection ---
ser = serial.Serial('COM17', 115200, timeout=1)
time.sleep(2)  # Let Arduino boot

filename = "voltage_current_data.csv"
with open(filename, mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(["Timestamp", "Voltage (V)", "Current (A)"])  # Headers

    print("Recording started... Press Ctrl+C to stop.")

    try:
        while True:
            line = ser.readline().decode().strip()
            print("Raw:", line)
            # Example: +RCV=2,8, 5,0.079,-41,47
            if line.startswith("+RCV="):
                parts = line.split(",")
                if len(parts) >= 5:
                    try:
                        voltage = float(parts[2].strip())   # 5
                        current = float(parts[3].strip())   # 0.079
                        timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                        print(f"{timestamp} | V={voltage} | I={current}")
                        writer.writerow([timestamp, voltage, current])
                    except Exception as e:
                        print("Parse error:", e)
    except KeyboardInterrupt:
        print("\nStopped by user.")
    finally:
        ser.close()
