const dgram = require('dgram');
const readline = require('readline');
const { exec } = require('child_process');
const sharedState = require('./input_bridge');
const { captureImage } = require('./capture_picture');

const DRONE_IP = '192.168.1.1';
const DRONE_PORT = 5556;

const client = dgram.createSocket('udp4');
let seq = 1;
let isConnected = false;

function floatToIntBits(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatBE(value, 0);
  return buffer.readInt32LE(0);
}

function move(pitch = 0, roll = 0, yaw = 0, gaz = 0, duration = 100) {
  const flag = 1; // Start - roll, pitch, gaz, yaw
  const cmd = `PCMD=${seq++},${flag},${floatToIntBits(pitch)},${floatToIntBits(roll)},${floatToIntBits(yaw)},${floatToIntBits(gaz)}`;
  sendAT(cmd);

  setTimeout(() => {
    stop();
  }, duration);
}

function sendAT(command, params = '') {
  if (!isConnected) {
    console.log('❌ Drone is not connected.');
    return;
  }
}

// Send AT command
function sendAT(command, params = '') {
  if (!isConnected) {
    console.log('❌ Drone is not connected.');
    return;
  }
  const msg = Buffer.from(`AT*${command}\r`);
  client.send(msg, 0, msg.length, DRONE_PORT, DRONE_IP, (err) => {
    if (err) console.error('❌ Error sending command:', err);
  });
}

// Watchdog to keep the drone alive
let watchdogInterval;
function startWatchdog() {
  watchdogInterval = setInterval(() => {
    sendAT(`COMWDG=${seq++}`);
  }, 100);
}

// Stop watchdog
function stopWatchdog() {
  clearInterval(watchdogInterval);
}

// Check drone connection (via ping)
function checkConnection() {
  return new Promise((resolve) => {
    exec(`ping ${DRONE_IP}`, (error) => {
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

// Takeoff
function takeoff() {
  console.log('🛫 Takeoff...');
  sendAT(`REF=${seq++},290718208`);
  //sendAT("REF", "290718208");
}

// Land
function land() {
  console.log('🛬 Landing...');
  sendAT(`REF=${seq++},290717696`);
}

function emergency() {
  console.log('🛑 Shutting down');
  sendAT(`REF=${seq++},290717952`);
}

function shutdown() {
  console.log('\n🔌 Shutting down...');
  land();
  stopWatchdog();
  client.close();
  setTimeout(() => process.exit(), 500);
}

function stop() {
  const flag = 1;
  const cmd = `PCMD=${seq++},${flag},${floatToIntBits(0)},${floatToIntBits(0)},${floatToIntBits(0)},${floatToIntBits(0)}`;
  sendAT(cmd);
}

process.on('SIGINT', shutdown);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

(async () => {
  const connected = await checkConnection();
  if (!connected) {
    console.log('❌ Exiting. Connect to the drone Wi-Fi and try again.');
    process.exit(1);
  }
  startWatchdog();

  console.log('🕹️ Type "t" to takeoff, "l" to land, or Ctrl+C to exit.');
  rl.on('line', (input) => {
    switch (input) {
      case 't': takeoff(); break;
      case 'l': land(); break;
      case 'n': emergency(); break;
      case 'w': move(0.2, 0, 0, 0, 100); break; // Forward
      case 's': move(-0.2, 0, 0, 0, 100); break; // Backward
      case 'a': move(0, -0.2, 0, 0, 100); break; // Left
      case 'd': move(0, 0.2, 0, 0, 100); break; // Right
      case 'u': move(0, 0, 0.2, 0, 100); break; // Up       // This went around the own axis (yaw) to the left
      case 'j': move(0, 0, -0.2, 0, 100); break; // Down     // 3 is the good battery
      case 'q': move(0, 0, 0, 0.2, 100); break; // Rotate left
      case 'e': move(0, 0, 0, -0.2, 100); break; // Rotate right
      case 'x': stop(); break; // Stop movement
      case 'p': captureImage().catch(err => console.error('Error capturing image:', err.message)); break;
      default: console.log('❓ Unknown command. Use "t" (takeoff) or "l" (land).');
    }
  });
})();

let currentRoll = 0;
let currentPitch = 0;
let currentYaw = 0;
let currentGaz = 0;

setInterval(() => {
  if (isConnected) {
    const flag = 1;
    const pitch = currentPitch + sharedState.pitch; // Forward and Backward
    const roll = currentRoll + sharedState.roll;    // Left and Right
    const yaw = currentYaw + sharedState.yaw;       // Rotation Left and Right
    const gaz = currentGaz + sharedState.gaz;       // Altitude

    const cmd = `PCMD=${seq++},${flag},${floatToIntBits(pitch)},${floatToIntBits(roll)},${floatToIntBits(gaz)},${floatToIntBits(yaw)}`;
    
    sendAT(cmd);
  }
}, 100);