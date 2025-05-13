const serverUrl = 'http://localhost:3000';

async function checkStatus() {
    try {
        let response = await fetch(`${serverUrl}/status`);
        let data = await response.json();
        document.getElementById('status').textContent = data.connected ? "✅ Drone Connected" : "❌ Drone Disconnected";
    } catch (error) {
        document.getElementById('status').textContent = "⚠️ Error checking status";
    }
}

async function updateDroneInfo() {
    try {
        let response = await fetch(`${serverUrl}/telemetry`);
        let data = await response.json();
        document.getElementById("battery").textContent = data.battery + "%";
        document.getElementById("signal").textContent = data.signal;
        document.getElementById("altitude").textContent = data.altitude + " m";
        document.getElementById("speed").textContent = data.speed + " m/s";
    } catch (error) {
        console.error("Failed to fetch telemetry data:", error);
    }
}

setInterval(updateDroneInfo, 2000);

async function sendCommand(endpoint) {
    try {
        let response = await fetch(`${serverUrl}/${endpoint}`, { method: 'POST' });
        let data = await response.json();
        alert(data.status);
    } catch (error) {
        alert("⚠️ Failed to send command");
    }
}

function takeoff() { sendCommand('takeoff'); }
function land() { sendCommand('land'); }
function emergency() { sendCommand('emergency'); }
function move(direction) { sendCommand(`move/${direction}`); }

checkStatus();
updateDroneInfo();