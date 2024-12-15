import React, { useState } from 'react';

function App() {
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
      const response = await fetchWithTimeout('http://localhost:3001/scan', { method: 'GET' }, 10000); // 10 seconds timeout
      console.warn(response)
      // Check if the response is an array before setting state
      if (Array.isArray(response)) {
        setDevices(response);
      } else {
        setError('Error');
      }
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
      {!loading && !error && Array.isArray(devices) && devices.length > 0 && (
        <ul>
          {devices.map((device, index) => (
            <li key={index}>
              {device.ip} - {device.host || 'Unknown Host'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
