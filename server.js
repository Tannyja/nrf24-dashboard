import WebSocket, { WebSocketServer } from "ws";
import { SerialPort } from "serialport";
import { ReadlineParser } from "@serialport/parser-readline";
import promptSync from "prompt-sync";

const prompt = promptSync();

// ─────────────────────────────────────────────────────
// STEP 1: หา Serial Ports ทั้งหมดบนเครื่อง
// ─────────────────────────────────────────────────────
const ports = await SerialPort.list();

console.log("Available Serial Ports:");
ports.forEach((p, index) => {
  console.log(`${index + 1}) ${p.path}`);
});

// ถ้าไม่เจอพอร์ต
if (ports.length === 0) {
  console.log("❌ No serial ports found");
  process.exit(1);
}

// ─────────────────────────────────────────────────────
// STEP 2: ให้ผู้ใช้เลือกพอร์ต
// ─────────────────────────────────────────────────────
const choice = prompt("Select port number: ");
const selectedPort = ports[Number(choice) - 1].path;

console.log("✔ Using port:", selectedPort);

// ─────────────────────────────────────────────────────
// STEP 3: เปิด WebSocket server
// ─────────────────────────────────────────────────────
const wss = new WebSocketServer({ port: 8080 });
console.log("WS server running on ws://localhost:8080");

// ─────────────────────────────────────────────────────
// STEP 4: เปิด SerialPort ที่เลือก
// ─────────────────────────────────────────────────────
const port = new SerialPort({
  path: selectedPort,
  baudRate: 9600,
});

const parser = port.pipe(new ReadlineParser());

// ─────────────────────────────────────────────────────
// STEP 5: ส่งข้อมูลไป React Dashboard แบบ real-time
// ─────────────────────────────────────────────────────
parser.on("data", (line) => {
  try {
    const [temp, mq2, dist] = line.trim().split(",");
    const data = { temp, mq2, dist };

    console.log("SEND:", data);

    wss.clients.forEach((c) => c.send(JSON.stringify(data)));
  } catch (err) {
    console.log("Parse error:", err);
  }
});
