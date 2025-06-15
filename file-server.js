const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3030;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('public'));
app.use(express.json());

// Create WebSocket server
const server = app.listen(PORT, () => {
  console.log(`File server running on http://localhost:${PORT}`);
});

const wss = new WebSocket.Server({ server });

// Store connected clients
const clients = new Set();

// Handle WebSocket connections
wss.on('connection', (ws) => {
  clients.add(ws);
  console.log('Client connected');

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'status',
    status: 'connected'
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      if (data.command === 'listFiles') {
        const directoryPath = data.path || '.';
        readDirectory(directoryPath, ws);
      } else if (data.command === 'readFile') {
        const filePath = data.path;
        if (filePath) {
          readFileContent(filePath, ws);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        error: error.message
      }));
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

// Read directory contents
function readDirectory(directoryPath, ws) {
  try {
    const files = fs.readdirSync(directoryPath, { withFileTypes: true });
    const fileTree = files.map(file => {
      const filePath = path.join(directoryPath, file.name);
      const isDirectory = file.isDirectory();
      
      return {
        name: file.name,
        path: filePath.replace(/\\/g, '/'),
        isDirectory,
        children: isDirectory ? [] : undefined,
        content: !isDirectory ? null : undefined, // Don't load content initially
        language: !isDirectory ? getLanguage(file.name) : undefined
      };
    });

    ws.send(JSON.stringify({
      type: 'fileList',
      path: directoryPath,
      files: fileTree
    }));
  } catch (error) {
    console.error('Error reading directory:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: `Failed to read directory: ${error.message}`
    }));
  }
}

// Read file content
function readFileContent(filePath, ws) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }

    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) {
      readDirectory(filePath, ws);
      return;
    }

    // Check file size before reading
    const MAX_FILE_SIZE = 1024 * 1024; // 1MB
    if (stats.size > MAX_FILE_SIZE) {
      ws.send(JSON.stringify({
        type: 'fileContent',
        path: filePath,
        content: '[File too large to display]',
        language: getLanguage(filePath)
      }));
      return;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    ws.send(JSON.stringify({
      type: 'fileContent',
      path: filePath,
      content,
      language: getLanguage(filePath)
    }));
  } catch (error) {
    console.error('Error reading file:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: `Failed to read file: ${error.message}`
    }));
  }
}

// Get language from file extension
function getLanguage(fileName) {
  const extension = path.extname(fileName).toLowerCase();
  
  const languageMap = {
    '.js': 'javascript',
    '.jsx': 'javascript',
    '.ts': 'javascript',
    '.tsx': 'javascript',
    '.py': 'python',
    '.java': 'java',
    '.cs': 'csharp',
    '.go': 'go',
    '.rs': 'rust',
    '.cpp': 'cpp',
    '.c': 'cpp',
    '.h': 'cpp',
    '.hpp': 'cpp'
  };
  
  return languageMap[extension] || 'plaintext';
} 