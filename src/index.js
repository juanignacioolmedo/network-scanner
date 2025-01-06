import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // ESTE ES EL READ
import Scan from './Scan'; // ESTE ES EL SCAN

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <div className="main-container">
      <div className="section-container scan-section">
        <h1 className="header-title header-title-scan">SCAN</h1>
        <Scan />
      </div>
      <div className="section-container read-section">
        <h1 className="header-title header-title-read">READ</h1>
        <App />
      </div>
    </div>
  </React.StrictMode>
);
