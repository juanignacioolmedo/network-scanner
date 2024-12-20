const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3002;

// Enable CORS
app.use(cors());


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

// API route to scan the network
app.get('/scan', async (req, res) => {
  try {
    console.warn('Scanning network...');
    const fileToRead = 'files/H2O.ini'
    const devices = await readFromFile(fileToRead); // Get the list of devices
    let parsedData = formatFile(devices);
    console.warn(parsedData)
    res.json(parsedData); // Return the list of devices as a response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to scan network.' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Network Scanner API is running on http://localhost:${port}`);
});
