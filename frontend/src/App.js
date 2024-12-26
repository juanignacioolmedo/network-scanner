import React, { useState } from 'react';
import './App.css';

function App() {
  const [serverIpAddress, setServerIpAddress] = useState('');
  const [showFileContent, setShowFileContent] = useState(false);
  const [urlDeDescarga, setUrlDescarga] = useState('');
  const [dataSource, setDataSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanIpAddress, setScanIpAddress] = useState('');
  const [isFileRead, setIsFileRead] = useState(false);

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

  const fetchDevices = async () => {
    setServerIpAddress('');
    setUrlDescarga('');
    setDataSource('');
    setShowFileContent(false);
    setLoading(true);

    try {
      const parsedData = await fetchWithTimeout(
        'http://localhost:3002/read',
        { method: 'GET' },
        10000
      );
      setScanIpAddress(parsedData['DESCARGAS']['IP_SERVER']);
      setServerIpAddress(parsedData['DESCARGAS']['IP_SERVER']);
      setUrlDescarga(parsedData['DESCARGAS']['URL_DESCARGA']);
      setDataSource(parsedData['ENTRADA']['DATASOURCE']);
      setShowFileContent(true);
      setIsFileRead(true);
    } catch (err) {
      alert(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const scanDevices = async () => {
    try {
      const parsedData = await fetchWithTimeout(
        'http://localhost:3001/local-info',
        { method: 'GET' },
        10000
      );
      console.warn(parsedData); // Muestra el valor en la consola
      return parsedData; // Devuelve el valor
    } catch (err) {
      alert(err.message || 'Failed to fetch devices');
      throw err; // Propaga el error si ocurre
    } finally {
      setLoading(false);
    }
  };
  

  const compareIps = async () => {
    const scanDevicesRes = await scanDevices();
    console.warn(scanDevicesRes);
    const ipServer = scanDevicesRes['ip'];
    console.warn(scanIpAddress, dataSource, ipServer);
    if (!scanIpAddress || !dataSource || !isFileRead || !ipServer) {
      alert('Primero debe obtener la información de la red y leer el archivo.');
      return;
    }
    if (ipServer === dataSource) {
      alert('¡Todo está bien! Las IPs coinciden.');
    } else {
      alert('Las IPs no coinciden.');
    }
  };

  return (
    <div className="app-container">
      <div className="buttons-container">
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="read-button"
        >
          {loading ? 'Cargando...' : '📂 Leer archivo'}
        </button>
        <button
          onClick={compareIps}
          disabled={!showFileContent || !isFileRead}
          className="read-button"
        >
          ✅ Comparar IPs
        </button>
      </div>
      <div className="results-container">
        {showFileContent && (
          <div className="result-container">
            <div>
              <strong>IP del servidor:</strong> {serverIpAddress}
            </div>
            <div>
              <strong>URL de descarga:</strong> {urlDeDescarga}
            </div>
            <div>
              <strong>Datasource:</strong> {dataSource}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

