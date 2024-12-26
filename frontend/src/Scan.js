import React, { useState } from 'react';

const portToConnect = '3001';

function Scan() {
  const [networkInfo, setNetworkInfo] = useState({ ip: '', hostname: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const fetchWithTimeout = (url, options, timeout) => {
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    return fetch(url, { ...options, signal })
      .then((response) => {
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

  const fetchNetworkInfo = async () => {
    setSearched(true);
    setLoading(true);
    setError(null);
    try {
      const response = await fetchWithTimeout(
        `http://localhost:${portToConnect}/local-info`,
        { method: 'GET' },
        10000
      );
      setNetworkInfo(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch network information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scan-container">
      <div className="buttons-container">
        <button
          className="scan-button"
          onClick={fetchNetworkInfo}
          disabled={loading}
        >
          {loading ? 'Cargando...' : '🔍 Obtener información de red'}
        </button>
      </div>
      {loading && <p>Cargando información de red...</p>}
      {error && <p className="error">Error: {error}</p>}
      {searched && networkInfo.ip === '' && !loading && !error && (
        <p>No se encontró ninguna información</p>
      )}
      {!loading && !error && networkInfo.ip && (
        <div className="result-container">
          <p>
            <strong>IP:</strong> {networkInfo.ip}
          </p>
          <p>
            <strong>Hostname:</strong> {networkInfo.hostname}
          </p>
        </div>
      )}
    </div>
  );
}

export default Scan;
