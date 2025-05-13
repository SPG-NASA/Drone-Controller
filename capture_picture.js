const net = require('net');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const DRONE_IP = '192.168.1.1';
const DRONE_VIDEO_PORT = 5555;

const SIMULATE = false;

function simulateCapture(filename = 'drone_picture.jpg') {
    return new Promise((resolve, reject) => {
        const outputPath = path.join(__dirname, filename);
        const fakeImagePath = path.join(__dirname, 'test_image.png');

        fs.copyFile(fakeImagePath, outputPath, (err) => {
            if (err) {
                console.error('❌ Error copying fake image:', err.message);
                reject(err);
            } else {
                console.log(`🎨 Simulated picture saved as ${outputPath}`);
                resolve(outputPath);
            }
        });
    });
}

function captureImageFromDrone(filename = 'drone_picture.jpg') {
    return new Promise((resolve, reject) => {
        console.log('Connecting to drone camera...');

        const socket = net.connect(DRONE_VIDEO_PORT, DRONE_IP, () => {
            console.log('Connected to drone video stream.');
        });

        socket.on('error', (err) => {
            console.error('Socket error:', err.message);
            reject(new Error('Failed to connect to drone video stream.'));
        });

        const outputPath = path.join(__dirname, filename);

        const ffmpeg = spawn('ffmpeg', [
            '-i', 'pipe:0',
            '-frames:v', '1',
            '-f', 'image2',
            outputPath,
        ]);

        ffmpeg.stderr.on('data', (data) => {
            console.log("Error. Data:", data);
        });

        ffmpeg.on('close', (code) => {
            if (code == 0) {
                console.log(`Saved picture as ${outputPath}`);
                resolve(outputPath);
            } else {
                reject(new Error('FFmpeg failed.'));
            }
            socket.end();
        });

        socket.pipe(ffmpeg.stdin);

        setTimeout(() => {
            console.log('Timeout! No frame received.');
            ffmpeg.kill();
            socket.destroy();
            reject(new Error('Timeout while capturing image.'));
        }, 5000);
    });
}

function captureImage(filename = 'drone_picture.jpg') {
    const captureFn = SIMULATE ? simulateCapture : captureImageFromDrone;

    return captureFn(filename)
        .then((savedPath) => {
            console.log('Launching image viewer...');
            const viewerPath = path.join(__dirname, 'image_viewer.js');
            const electron = spawn('npx', ['electron', viewerPath], {
                stdio: 'inherit',
                shell: true,
            });

            electron.on('error', (err) => {
                console.error('Error launching image viewer:', err.stack);
            });

            return savedPath;
        });
}

module.exports = {
    captureImage
}