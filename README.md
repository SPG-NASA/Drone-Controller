# 🛸 Parrot AR.Drone 2.0 Node.js Control Suite

This is a modular system built to **control, maneuver, and interact with a Parrot AR.Drone 2.0** using Node.js and WebSockets. It supports keyboard and gamepad input, basic flight commands, and image capture—offering a solid foundation for extending drone interactivity.

> ⚠️ This project is in **early development**. Some features like smooth movement and image capture do **not** fully work yet.

---

## 📦 Features

- 🎮 **Web UI**: Send controller-like input directly to the drone via browser.
- 🖼️ **Electron Image Viewer**: Launches a full-screen display for captured images.
- 🛫 **Main Controller App**: CLI + real-time controller handling for drone commands (takeoff, land, move, etc.).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- [`ffmpeg`](https://ffmpeg.org/) installed and in system path (for image capture)
- [`npx`](https://docs.npmjs.com/cli/v7/commands/npx`)
- Electron (automatically used via `npx`)
- A Parrot AR.Drone 2.0 connected via Wi-Fi

### Installation

```bash
git clone https://github.com/SPG-NASA/Drone-Controller.git
cd Drone-Controller
npm install
```

### Credits
Thank you ChatGPT for the Readme :)