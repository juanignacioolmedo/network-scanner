import React, { useState } from 'react';

function App() {
  const [serverIpAddress, setServerIpAddress] = useState('');
  const [showFileContent, setShowFileContent] = useState(false);
  const [urlDeDescarga, setUrlDescarga] = useState('');
  const [dataSource, setDataSource] = useState('');

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
    try {
      const parsedData = await fetchWithTimeout('http://localhost:3002/scan', { method: 'GET' }, 10000); // 10 seconds timeout
      setShowFileContent(true);
      setServerIpAddress(parsedData["DESCARGAS"]["IP_SERVER"]);
      setUrlDescarga(parsedData["DESCARGAS"]["URL_DESCARGA"]);
      setDataSource(parsedData["ENTRADA"]["DATASOURCE"]);
    } catch (err) {
      alert(err.message || 'Failed to fetch devices');
    } 
  };

  // Conditional rendering
  if(showFileContent) {
    return (
      <div>
        <div>
          <div>{serverIpAddress}</div>
          <div>{urlDeDescarga}</div>
          <div>{dataSource}</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={fetchDevices}>Leer archivo de texto</button>
    </div>
  );
  
    
  
}

export default App;
