import React, { useState } from 'react';

const portToConnect = '3001';

function Scan() {
  const [networkInfo, setNetworkInfo] = useState({ ip: '', hostname: '' });
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

  // Function to fetch network information when the button is clicked
  const fetchNetworkInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout('http://localhost:' + portToConnect + '/local-info', { method: 'GET' }, 10000); // 10 seconds timeout
      setNetworkInfo(response); // Update state with the fetched IP and hostname
    } catch (err) {
      setError(err.message || 'Failed to fetch network information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Network Information</h1>

      {/* Button to trigger the fetch */}
      <button onClick={fetchNetworkInfo} disabled={loading}>
        {loading ? 'Fetching...' : 'Get Network Info'}
      </button>

      {/* Show loading, error, or results */}
      {loading && <p>Loading network info...</p>}
      {error && <p>Error: {error}</p>}
      {networkInfo.ip === '' && !loading && !error && <p>No network info found</p>}

      {/* Display IP and hostname if available */}
      {!loading && !error && networkInfo.ip && (
        <div>
          <p>IP: {networkInfo.ip}</p>
          <p>Hostname: {networkInfo.hostname}</p>
        </div>
      )}
    </div>
  );
}

export default Scan;
