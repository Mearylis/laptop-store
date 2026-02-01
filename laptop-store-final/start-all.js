const { exec } = require('child_process');
const os = require('os');
const path = require('path');

console.log('🚀 Starting Laptop Store Project...');

const isWindows = os.platform() === 'win32';

if (isWindows) {
    // Open Backend in new window
    console.log('Starting Backend...');
    exec('start "Laptop Store Backend" cmd /k "cd backend && npm run dev"', { windowsHide: false });

    // Open Frontend in new window
    console.log('Starting Frontend...');
    exec('start "Laptop Store Frontend" cmd /k "cd frontend && npm start"', { windowsHide: false });

    console.log('\n✅ Servers launched in new windows!');
    console.log('Backend: http://localhost:5000');
    console.log('Frontend: http://localhost:3000');
} else {
    console.log('This script is optimized for Windows. On Mac/Linux, please run backend and frontend manually.');
}
