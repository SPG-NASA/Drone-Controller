const WebSocket = require('ws');
const express = require('express');
const path = require('path');

const sharedState = {
  roll: 0,
  pitch: 0,
  yaw: 0,
  gaz: 0,
  buttons: [],
};

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = app.listen(8080, () => {
  console.log("🌐 Input bridge running at http://localhost:8080");
});

const wss = new WebSocket.Server({ server });

wss.on('connection', ws => {
  console.log("✅ WebSocket client connected");

  ws.on('message', msg => {
    try {
      const data = JSON.parse(msg);
      sharedState.roll  = (data.leftStick?.x || 0) * 0.3;
      sharedState.pitch = -(data.leftStick?.y || 0) * 0.3;
      sharedState.yaw   = (data.rightStick?.x || 0) * 0.3;
      sharedState.gaz   = -(data.rightStick?.y || 0) * 0.3;
      sharedState.buttons = data.buttons || [];

    } catch (error) {
      console.error("❌ Parse error:", error);
    }
  });
});

module.exports = sharedState;
