import { useState, useEffect } from "react";
import { Typography, Card, Switch, Button } from "@material-tailwind/react";
import Chart from "react-apexcharts";

export function Home() {
  const [sensor, setSensor] = useState({ temp: 0, mq2: 0, dist: 0 });
  const [simulate, setSimulate] = useState(false);

  const [tempHistory, setTempHistory] = useState([]);
  const [mq2History, setMq2History] = useState([]);
  const [distHistory, setDistHistory] = useState([]);

  // ======================================
  // CONNECT SERIAL PORT (แก้ให้รองรับค่าจากตัวแม่)
  // ======================================
  const connectSerial = async () => {
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      let buffer = "";

      const loop = async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          if (!value) continue;

          buffer += value;
          let lines = buffer.split("\n");
          buffer = lines.pop(); // เก็บบรรทัดที่ยังไม่ครบ

          lines.forEach((line) => {
            line = line.trim();

            // =========================
            // TEMP
            // =========================
            if (line.startsWith("Temp")) {
              const num = parseFloat(line.replace(/[^0-9.\-]/g, ""));
              if (!isNaN(num)) {
                setSensor((p) => ({ ...p, temp: num }));
              }
            }

            // =========================
            // MQ2
            // =========================
            if (line.startsWith("MQ2")) {
              const num = parseFloat(line.replace(/[^0-9.\-]/g, ""));
              if (!isNaN(num)) {
                setSensor((p) => ({ ...p, mq2: num }));
              }
            }

            // =========================
            // DIST
            // =========================
            if (line.startsWith("Dist")) {
              const num = parseFloat(line.replace(/[^0-9.\-]/g, ""));
              if (!isNaN(num)) {
                setSensor((p) => ({ ...p, dist: num }));
              }
            }
          });
        }
      };

      loop();
    } catch (err) {
      alert("Cannot open serial port");
      console.error(err);
    }
  };

  // ======================================
  // SIMULATE MODE
  // ======================================
  useEffect(() => {
    if (!simulate) return;

    const t = setInterval(() => {
      setSensor({
        temp: Math.floor(Math.random() * 40),
        mq2: Number((Math.random() * 5).toFixed(2)),
        dist: Math.floor(Math.random() * 200),
      });
    }, 600);

    return () => clearInterval(t);
  }, [simulate]);

  // ======================================
  // UPDATE HISTORY
  // ======================================
  useEffect(() => {
    setTempHistory((p) => [...p.slice(-20), sensor.temp]);
    setMq2History((p) => [...p.slice(-20), sensor.mq2]);
    setDistHistory((p) => [...p.slice(-20), sensor.dist]);
  }, [sensor]);

  // ======================================
  // SHARP LINE CHART
  // ======================================
  const sharp = (color, name, data, unit) => ({
    series: [{ name, data }],
    options: {
      chart: {
        type: "line",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "linear",
          speed: 200,
          dynamicAnimation: { speed: 200 },
        },
      },

      stroke: {
        curve: "straight",
        width: 4,
        colors: [color],
      },

      colors: [color],
      markers: { size: 0 },
      fill: { opacity: 1 },

      grid: {
        borderColor: "#d2d6dc",
        strokeDashArray: 4,
      },

      xaxis: {
        labels: { show: false },
        axisTicks: { show: false },
        axisBorder: { show: false },
      },

      yaxis: {
        decimalsInFloat: 1,
        labels: {
          style: { colors: "#6b7280" },
          formatter: (v) => v + " " + unit,
        },
      },

      tooltip: {
        theme: "dark",
        y: { formatter: (v) => v + " " + unit },
      },
    },
  });

  return (
    <div className="mt-8 px-4 md:px-10">

      {/* HEADER */}
      <div className="flex items-center gap-4 mb-10">
        <Button
          className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow"
          onClick={connectSerial}
        >
          🔌 Connect Serial
        </Button>

        <Switch
          color="green"
          checked={simulate}
          onChange={() => setSimulate(!simulate)}
        />

        <Typography>Simulation Mode</Typography>
      </div>

      {/* SENSOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <Card className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl shadow">
          <Typography variant="h6">Temperature</Typography>
          <Typography variant="h2" className="mt-2 font-bold">{sensor.temp} °C</Typography>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-amber-500 to-orange-700 text-white rounded-xl shadow">
          <Typography variant="h6">MQ-2 Gas</Typography>
          <Typography variant="h2" className="mt-2 font-bold">{sensor.mq2} V</Typography>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-xl shadow">
          <Typography variant="h6">Distance</Typography>
          <Typography variant="h2" className="mt-2 font-bold">{sensor.dist} cm</Typography>
        </Card>

      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        <Card className="p-6 shadow rounded-xl">
          <Typography className="text-blue-600 font-semibold mb-3">Temperature (°C)</Typography>
          <Chart type="line" height={260} {...sharp("#1e40af", "Temp", tempHistory, "°C")} />
        </Card>

        <Card className="p-6 shadow rounded-xl">
          <Typography className="text-amber-600 font-semibold mb-3">MQ-2 Gas (V)</Typography>
          <Chart type="line" height={260} {...sharp("#b45309", "MQ2", mq2History, "V")} />
        </Card>

        <Card className="p-6 shadow rounded-xl">
          <Typography className="text-green-700 font-semibold mb-3">Distance (cm)</Typography>
          <Chart type="line" height={260} {...sharp("#166534", "Dist", distHistory, "cm")} />
        </Card>

      </div>
    </div>
  );
}

export default Home;