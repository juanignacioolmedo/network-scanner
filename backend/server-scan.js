const express = require('express');
const nmap = require('node-nmap');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());
nmap.nmapLocation = 'nmap'; //default

// Function to scan the network using Nmap
function scanNetwork() {
  return new Promise((resolve, reject) => {
    const scan = new nmap.QuickScan('127.0.0.1 google.com');// Adjust the IP range accordingly

    scan.on('complete', function(data) {
      const devices = [];
      data.forEach((host) => {
        // Extract relevant information from the Nmap scan results
        if (host.status === 'up') {
          devices.push({
            ip: host.ip,
            hostnames: host.hostnames,
            services: host.services,
          });
        }
      });
      resolve(devices);
    });

    scan.on('error', function(error) {
      console.error('Nmap Error:', error);
      reject('Failed to scan network using Nmap');
    });

    // Run the Nmap scan
    scan.startScan();
  });
}

// API route to scan the network
app.get('/scan', async (req, res) => {
  try {
    console.warn('Scanning network...');
    const devices = await scanNetwork(); // Get the list of devices
    res.json(devices); // Return the list of devices as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scan network.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Network Scanner API is running on http://localhost:${port}`);
});
