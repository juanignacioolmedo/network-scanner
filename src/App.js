import React, { useState } from 'react';
import './App.css';

function App() {
  const [dataSource, setDataSource] = useState('');
  const [db, setDB] = useState('');
  const [serverIpAddress, setServerIpAddress] = useState('');
  const [showFileContent, setShowFileContent] = useState(false);
  const [urlDeDescarga, setUrlDescarga] = useState('');
  const [loading, setLoading] = useState(false);
  const [scanIpAddress, setScanIpAddress] = useState('');
  const [isFileRead, setIsFileRead] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [extraDataSource, setExtraDataSource] = useState('');


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

   // Función para obtener la IP privada
   const fetchPrivateIP = async () => {
    setLoading(true);
    try {
      const response = await fetchWithTimeout(
        'http://localhost:3002/local-info', // API que obtiene la IP privada
        { method: 'GET' },
        10000
      );
      setExtraDataSource(response.ip); // Usar la IP privada en vez de el datasource
    } catch (err) {
      alert(err.message || 'Failed to fetch private IP');
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener dispositivos
  const fetchDevices = async () => {
    cleanValues();
    try {
      const parsedData = await fetchWithTimeout(
        'http://localhost:3002/read', 
        { method: 'GET' },
        10000
      );
      // Procesa los datos obtenidos
      setScanIpAddress(parsedData['DESCARGAS']['IP_SERVER']); // IP pública
      setDB(parsedData['ENTRADA']['BD_WEB']);  // Nombre de la base de datos
      processParsedData(parsedData);
      await fetchPrivateIP(); // Ahora también obtiene la IP privada
    } catch (err) {
      alert(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };

  const processParsedData = (parsedData) => {
    setServerIpAddress(parsedData['DESCARGAS']['IP_SERVER']);
    setUrlDescarga(parsedData['DESCARGAS']['URL_DESCARGA']);
    setDataSource(parsedData['ENTRADA']['DATASOURCE']);
    setDB(parsedData['ENTRADA']['BD_WEB']);
    setShowFileContent(true);
    setIsFileRead(true);
  };

  const fetchDevicesFromFile = async () => {
    cleanValues();  
    setLoading(true); // Asegúrate de marcar que la carga está en progreso
    try {
      const parsedData = await fetchWithTimeout(
        'http://localhost:3002/read-from-file',
        { method: 'GET' },
        10000
      );      
      processParsedData(parsedData);
      console.warn(parsedData)// Log de los datos obtenidos para revisión

       // Actualiza el estado con los valores obtenidos
      setScanIpAddress(parsedData['DESCARGAS']['IP_SERVER']);  // IP pública
      setDB(parsedData['ENTRADA']['BD_WEB']);  // Nombre de la base de datos

      // Llama a la función que obtiene la IP privada
      await fetchPrivateIP(); 
    } catch (err) {
      alert(err.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };
  

  const scanDevices = async () => {
    try {
      const parsedData = await fetchWithTimeout(
        'http://localhost:3002/local-info',
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
    const ipServer = scanDevicesRes['ip'];
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

  const cleanValues = () => {
    setServerIpAddress('');
    setUrlDescarga('');
    setDataSource('');
    setShowFileContent(false);
    setLoading(true);
    setDB('');
  };

  const handlePostRequest = async () => {
    const params = new URLSearchParams();
    params.append("BDCliente", db);  // Usar `db` para enviar la base de datos
    params.append("datasource", extraDataSource); // Usar `extraDataSource` para enviar la IP
  
    const url = "http://localhost:3002/proxy";
  
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.text();
      console.log('Respuesta del servidor:', data);
      alert('Datos enviados con éxito.');
    } catch (error) {
      console.error('Error al enviar datos:', error);
      alert('Error al enviar los datos.');
    } finally {
      setModalVisible(false);
    }
  };
  

  return (
    <div className="app-container">
      <div className="buttons-container">
        <button
          onClick={fetchDevicesFromFile}
          disabled={loading}
          className="read-button"
        >
          {loading ? 'Cargando...' : '📂 Leer archivo'}
        </button>
        <button
          onClick={fetchDevices}
          disabled={loading}
          className="read-button"
        >
          {loading ? 'Cargando...' : '📂 Leer desde web'}
        </button>
        <button
          onClick={compareIps}
          disabled={!showFileContent || !isFileRead}
          className="read-button"
        >
          ✅ Comparar IPs
        </button>
        <button
          onClick={() => setModalVisible(true)}
          disabled={!showFileContent || !isFileRead}
          className="read-button"
        >
          Actualizar Configuración del servidor
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
            <div>
              <strong>DB:</strong> {db}
            </div>
          </div>
        )}
      </div>
      {modalVisible && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Actualizar Configuración</h2>      
      <div>
        <label>
          Datasource:
          <input
            type="text"
            className="input-modal"
            name="datasource"
            value={extraDataSource}  // Ahora `extraDataSource` contiene la IP privada
            readOnly
          />
        </label>
      </div>
      <div>
        <label>
          DB:
          <input
            type="text"
            className="input-modal"
            name="db"
            value={db}  // Usamos el valor de `extraDB` que se obtiene de la base de datos
            readOnly
          />
        </label>
      </div>
      <div>
        <button onClick={handlePostRequest}>Enviar</button>
        <button onClick={() => setModalVisible(false)}>Cerrar</button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default App;