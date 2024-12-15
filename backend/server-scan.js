const express = require('express');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Function to prettify nmap scan output
const prettifyNmapResult = (output) => {
  // Regular expressions to parse nmap output
  const hostsRegex = /Nmap scan report for (\d+\.\d+\.\d+\.\d+)/g;
  const result = [];
  
  let match;
  
  // Match each IP address
  while ((match = hostsRegex.exec(output)) !== null) {
    result.push({
      ip: match[1],
      status: 'up' // In this case, we'll mark all hosts as "up"
    });
  }
  
  return result;
};

// Function to run the nmap command
const runNmapScan = (subnet, callback) => {
  exec(`nmap -sn ${subnet}`, (error, stdout, stderr) => {
    if (error) {
      callback(error, null);
      return;
    }
    if (stderr) {
      callback(stderr, null);
      return;
    }
    // Prettify the nmap output before sending it
    const prettifiedResult = prettifyNmapResult(stdout);
    callback(null, prettifiedResult);
  });
};

// Define an endpoint to trigger the nmap scan
app.get('/scan', (req, res) => {
  const subnet = req.query.subnet || '192.168.1.0/24';  // Default subnet is 192.168.1.0/24
  
  // Run the nmap scan
  runNmapScan(subnet, (error, result) => {
    if (error) {
      res.status(500).json({ error: `Error executing nmap: ${error}` });
    } else {
      console.warn(result);
      res.status(200).json({
        scanResult: result,
      });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Network Scanner API is running on http://localhost:${port}`);
});
