//Local Network Info
const express = require('express');
const cors = require('cors');
const os = require('os');

const app = express();
const port = 3001;

// Enable CORS
app.use(cors());

// Function to get the local machine's IP address and hostname
const getLocalInfo = () => {
  const interfaces = os.networkInterfaces();
  let ip = 'No disponible';
  
  // Buscamos la primera interfaz de red IPv4 que no sea interna
  Object.keys(interfaces).forEach((iface) => {
    interfaces[iface].forEach((details) => {
      if (details.family === 'IPv4' && !details.internal) {
        ip = details.address;
      }
    });
  });

  return {
    ip,
    hostname: os.hostname() // Obtiene el hostname del sistema
  };
};

const getPublicIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (!response.ok) {
      throw new Error('Failed to fetch public IP');
    }
    const data = await response.json();
    return {
      ip: data.ip,
      hostname: os.hostname(), // Mantén el hostname local
    };
  } catch (error) {
    console.error('Error fetching public IP:', error);
    return {
      ip: 'No disponible',
      hostname: os.hostname(),
    };
  }
};


// Endpoint to retrieve only IP and hostname
app.get('/local-info', async (req, res) => {
  const localInfo = await getPublicIP(); // Obtiene la IP y el hostname
  console.warn(localInfo);
  res.status(200).json(localInfo); // Devuelve solo la IP y el hostname
});

// Start the server
app.listen(port, () => {
  console.log(`Local Network Info API is running on http://localhost:${port}`);
});
