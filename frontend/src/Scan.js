import React, { useState } from 'react';

const portToConnect = '3001'
function Scan() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle timeout for the fetch request
  const fetchWithTimeout = (url, options, timeout) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, { ...options, signal })
      .then(response => {
        clearTimeout(timeoutId);
        return response.json();
      })
      .catch((err) => {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Request timed out');
        }
        throw err;
      });
  };

  // Function to fetch devices when the button is clicked
  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout('http://localhost:' + portToConnect + '/scan', { method: 'GET' }, 10000); // 10 seconds timeout
      const result = response.scanResult;

      // Check if the response is an array before setting state
      setDevices(result)
    } catch (err) {
      setError(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Network Device Scanner</h1>

      {/* Button to trigger the network scan */}
      <button onClick={fetchDevices} disabled={loading}>
        {loading ? 'Scanning...' : 'Scan Network'}
      </button>

      {/* Show loading, error, or results */}
      {loading && <p>Loading devices...</p>}
      {error && <p>Error: {error}</p>}
      {devices.length === 0 && !loading && !error && <p>No devices found</p>}

      {/* Display list of devices if available */}
      {!loading && !error &&  devices.length > 0 && (
        <ul>
          {devices.map((device, index) => (
            <li key={index}>
              {device.ip} ({device.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Scan;
