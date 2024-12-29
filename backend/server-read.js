const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { DOMParser } = require('xmldom'); // Importar DOMParser de xmldom

const app = express();
const port = 3002;

// Enable CORS
app.use(cors());
app.use(express.urlencoded({ extended: true }));

ejemplo = {}


function readFromFile(filePath) {
  return new Promise((resolve, reject) => {
      const completePath = path.join(__dirname, filePath);
      fs.readFile(completePath, 'utf8', (err, data) => {
          if (err) {
              reject(err);
          } else {
              resolve(data);
          }
      });
  });
}

function formatFile(content) {
  const sections = content.split(/\[(.*?)\]/).filter(Boolean); // Split and remove empty values


  // Initialize a result object
  let parsedData = {};

  // Process each section
  for (let i = 0; i < sections.length; i++) {
      const sectionName = sections[i].trim(); // Get section name
      const sectionContent = sections[i + 1]?.trim(); // Get section content

      if (sectionName && sectionContent) {
      // Parse key-value pairs for each section
      const keyValuePairs = sectionContent.split(/\s+/).map(pair => pair.split('='));

      // Store the parsed data
      parsedData[sectionName] = keyValuePairs.reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
      }, {});

      // Skip next iteration as we've already processed the next part of the content
      i++;
      }
  }
  // This is the formatted data
  return parsedData;
}

function formatRequest(xmlString) {
  // Step 1: Parse the XML string into a DOM object
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "application/xml");

  // Step 2: Initialize the result object
  const result = {};

  // Step 3: Extract the <string> element and get all its child nodes
  const stringElement = xmlDoc.getElementsByTagName('string')[0];

  // Step 4: Extract the attributes and split the string by semicolons
  const content = stringElement.textContent.trim();
  const sections = content.split(';');

  // Temporary variable to store current section being processed
  let currentSection = null;

  // Step 5: Iterate over the sections
  for (const section of sections) {
    if (section.startsWith('[')) {
      // Handle section headers like [General], [ENTRADA], [DESCARGAS]
      currentSection = section.slice(1, section.length - 1);
      result[currentSection] = {};
    } else {
      // Handle key-value pairs within each section
      if (section.includes('=')) {
        const [key, value] = section.split('=').map(str => str.trim());
        if (currentSection) {
          result[currentSection][key] = value;
        } else {
          result[key] = value; // If no section, directly add to result
        }
      }
    }
  }

  return result;
}

const getConfiguracionIni = async () => {
  const url = "http://serviceairtech.com.ar/service1.asmx/getConfiguracionIni?BDCliente=TEST_473";
  const headers = {
    Host: "serviceairtech.com.ar", // Agrega el encabezado Host
  };

  try {
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const result = await response.text(); // Usa .text() para procesar la respuesta
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error; // Lanza el error para que pueda manejarse en el nivel superior
  }
};

// API route to scan the network
app.get('/read', async (req, res) => {
  try {
    console.warn('Scanning network...');
    const devices = await getConfiguracionIni(); // Get the list of devices
    this.ejemplo = formatRequest(devices);
    res.json(this.ejemplo); // Return the list of devices as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scan network.' });
  }
});

// API route to scan the network
app.get('/read-from-file', async (req, res) => {
  try {
    console.warn('Scanning network...');
    const fileToRead = 'files/H2O.ini';
    const devices = await readFromFile(fileToRead);
    const ejemplo = formatFile(devices);
    res.json(ejemplo); // Return the list of devices as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scan network.' });
  }
});

app.post("/proxy", async (req, res) => {
  try {
    console.warn(req.body)
    const response = await fetch("http://serviceairtech.com.ar/service1.asmx/setConfiguracionIni_datasource", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(req.body).toString(), // Convert the request body to a URL-encoded string
    });
    
    const result = await response.text(); // Use .text() for non-JSON responses
    
    console.warn(result);
    res.status(200).send(result);
  } catch (error) {
    console.warn(error);
    res.status(500).send(error.message);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Network Scanner API is running on http://localhost:${port}`);
});
