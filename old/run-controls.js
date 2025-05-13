const dgram = require('dgram');
const express = require('express');
const { exec } = require('child_process');
const cors = require("cors");
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

const DRONE_IP = '192.168.1.1';
const DRONE_PORT = 5556;
const TELEMETRY_PORT = 5554;	
const client = dgram.createSocket('udp4');

let isConnected = false;
let telemetryData = { battery: 0, altitude: 0, speed: 0, signal: 0 };

const telemetrySocket = dgram.createSocket('udp4');

telemetrySocket.on('message', (msg, rinfo) => {
    const data = msg.toString();
    console.log("📡 Telemetry Received:", data);
    
    const match = data.match(/BAT=(\d+) ALT=([\d.]+) SPD=([\d.]+) SIG=(\d+)/);
    if (match) {
        telemetryData = {
            battery: parseInt(match[1]),
            altitude: parseFloat(match[2]),
            speed: parseFloat(match[3]),
            signal: parseInt(match[4]),
        };
    }
});

telemetrySocket.bind(TELEMETRY_PORT);

function sendAT(command, params = '') {
    if (!isConnected) {
        console.log('❌ Drone is not connected.');
        return;
    }
    const msg = Buffer.from(`AT*${command}=${params}\r`);
    client.send(msg, 0, msg.length, DRONE_PORT, DRONE_IP, (err) => {
        if (err) console.error('❌ Error sending command:', err);
    });
}

async function checkConnection() {
    return new Promise((resolve) => {
        exec(`ping -c 1 ${DRONE_IP}`, (error) => {
            if (error) {
                console.log('❌ Drone not reachable.', error);
                isConnected = false;
                resolve(false);
            } else {
                console.log('✅ Drone is connected!');
                isConnected = true;
                resolve(true);
            }
        });
    });
}

app.get('/telemetry', (req, res) => {
    res.json(telemetryData);
});

app.post('/takeoff', (req, res) => {
    console.log('🛫 Takeoff...');
    sendAT('REF', '290718208');
    res.json({ status: 'Taking off' });
});

app.post('/land', (req, res) => {
    console.log('🛬 Landing...');
    sendAT('REF', '290717696');
    res.json({ status: 'Landing' });
});

app.post('/emergency', (req, res) => {
    console.log('🛑 Emergency stop');
    sendAT('REF', '290717952');
    res.json({ status: 'Emergency stop' });
});

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    await checkConnection();
});