import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // ESTE ES EL READ
import Scan from './Scan'; // ESTE ES EL SCAN
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <h4> SCAN</h4>
    <Scan />
    <h4> READ</h4>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
