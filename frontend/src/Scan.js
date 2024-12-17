import React, { useState } from 'react';

const portToConnect = '3001';

function Scan() {
  const [networkInfo, setNetworkInfo] = useState({ ip: '', hostname: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false); // Estado para verificar si se ha buscado

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
    setSearched(true); // Marca que se ha hecho una búsqueda
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
      <button onClick={fetchNetworkInfo} disabled={loading}>
        {loading ? 'Cargando...' : 'Obtener informacion de red'}
      </button>

      {loading && <p>Cargando informacion de red...</p>}
      {error && <p className="error">Error: {error}</p>}
      
      {/* Muestra el mensaje solo si se ha buscado y no hay información */}
      {searched && networkInfo.ip === '' && !loading && !error && <p>No se encontro ninguna informacion</p>}

      {!loading && !error && networkInfo.ip && (
        <div className="result-container">
          <p>IP: {networkInfo.ip}</p>
          <p>Hostname: {networkInfo.hostname}</p>
        </div>
      )}
    </div>
  );
}

export default Scan;
