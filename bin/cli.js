#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 简单日志输出
const writeLog = (level, message, data = null) => {
  console.error(`[${level}] ${message}`);
};

// Get server script path
const serverPath = path.resolve(__dirname, '../src/server-final.js');

// Check if server file exists
if (!fs.existsSync(serverPath)) {
  const errorMsg = `Server file not found: ${serverPath}`;
  writeLog('ERROR', errorMsg);
  process.exit(1);
}

writeLog('INFO', `Starting MCP Project Standards server from: ${serverPath}`);
writeLog('INFO', `Current working directory: ${process.cwd()}`);
writeLog('INFO', `CLI script directory: ${__dirname}`);

let server = null;

// Function to start server
function startServer() {
  // Create environment object
  // Determine CONFIG_DIR: use env var if set, otherwise use .setting with TOOL_PREFIX if available
  let configDir = process.env.CONFIG_DIR;
  if (!configDir) {
    const toolPrefix = process.env.TOOL_PREFIX || '';
    if (toolPrefix) {
      configDir = `./.setting.${toolPrefix}`;
    } else {
      configDir = './.setting';
    }
  }
  
  const env = {
    ...process.env,
    // Set CONFIG_DIR based on logic above
    CONFIG_DIR: configDir,
    // API Debug environment variables
    API_DEBUG_ALLOWED_METHODS: process.env.API_DEBUG_ALLOWED_METHODS || 'GET',
    API_DEBUG_LOGIN_URL: process.env.API_DEBUG_LOGIN_URL || '/api/login',
    API_DEBUG_LOGIN_METHOD: process.env.API_DEBUG_LOGIN_METHOD || 'POST',
    API_DEBUG_LOGIN_BODY: process.env.API_DEBUG_LOGIN_BODY || '{"username":"","password":""}',
    API_DEBUG_LOGIN_DESCRIPTION: process.env.API_DEBUG_LOGIN_DESCRIPTION || 'Save returned token to common headers in debug tool, field name Authorization, field value Bearer token',
    // Tool prefix for naming/identification
    TOOL_PREFIX: process.env.TOOL_PREFIX || '',
    // Project name for display/metadata
    PROJECT_NAME: process.env.PROJECT_NAME || ''
  };

  // Convert allowed methods to uppercase if specified
  if (env.API_DEBUG_ALLOWED_METHODS) {
    env.API_DEBUG_ALLOWED_METHODS = env.API_DEBUG_ALLOWED_METHODS.toUpperCase();
  }

  writeLog('INFO', 'Starting MCP Project Standards server');

  server = spawn('node', [serverPath], {
    stdio: ['inherit', 'inherit', 'inherit'],
    env: env
  });

  writeLog('INFO', `MCP Project Standards server process started with PID: ${server.pid}`);

  // Add signal handling debug info
  writeLog('INFO', 'Signal handlers registered for SIGINT and SIGTERM');
  writeLog('INFO', 'Press Ctrl+C to gracefully shutdown the server');
}

// Start the server
startServer();

// Handle process exit
server.on('close', (code) => {
  writeLog('INFO', `MCP Project Standards server exited with code: ${code}`);
  // Clear any pending shutdown timeout
  if (global.shutdownTimeout) {
    clearTimeout(global.shutdownTimeout);
  }
  
  // Check if this is a restart request
  if (code === 0) {
    writeLog('INFO', 'Server requested restart, restarting...');
    setTimeout(() => {
      startServer();
    }, 2000); // Wait 2 seconds before restart
  } else {
    // Exit CLI process when server exits with error
    setTimeout(() => {
      writeLog('INFO', 'CLI process exiting after server shutdown');
      process.exit(code);
    }, 1000);
  }
});

// Handle server error
server.on('error', (err) => {
  writeLog('ERROR', 'Server process error:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle errors
server.on('error', (err) => {
  writeLog('ERROR', 'Failed to start MCP Project Standards server:', {
    error: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Handle signals
process.on('SIGINT', () => {
  writeLog('INFO', 'Received SIGINT, shutting down server...');
  gracefulShutdown('SIGINT');
});

process.on('SIGTERM', () => {
  writeLog('INFO', 'Received SIGTERM, shutting down server...');
  gracefulShutdown('SIGTERM');
});

// Handle Windows specific signals
process.on('SIGBREAK', () => {
  writeLog('INFO', 'Received SIGBREAK, shutting down server...');
  gracefulShutdown('SIGTERM');
});

// Handle restart signal from server
process.on('SIGUSR1', () => {
  writeLog('INFO', 'Received restart signal from server...');
  restartServer();
});

// Handle process exit
process.on('exit', (code) => {
  writeLog('INFO', `CLI process exiting with code: ${code}`);
});

// Graceful shutdown function
function gracefulShutdown(signal) {
  // Set a timeout to force exit if server doesn't respond
  global.shutdownTimeout = setTimeout(() => {
    writeLog('WARN', 'Server shutdown timeout, forcing exit...');
    try {
      if (server) {
        server.kill('SIGKILL');
      }
    } catch (err) {
      writeLog('ERROR', 'Failed to force kill server:', {
        error: err.message
      });
    }
    process.exit(1);
  }, 10000); // 10 seconds timeout
  
  // Try graceful shutdown
  try {
    if (server) {
      server.kill(signal);
      writeLog('INFO', `Sent ${signal} signal to server process ${server.pid}`);
    } else {
      writeLog('WARN', 'No server process to shutdown');
      process.exit(0);
    }
  } catch (err) {
    writeLog('ERROR', `Failed to send ${signal} signal to server:`, {
      error: err.message
    });
    if (global.shutdownTimeout) {
      clearTimeout(global.shutdownTimeout);
    }
    process.exit(1);
  }
}

// Restart server function
function restartServer() {
  writeLog('INFO', 'Restarting MCP server...');
  if (server) {
    try {
      server.kill('SIGTERM');
      setTimeout(() => {
        if (server && !server.killed) {
          writeLog('WARN', 'Server not responding to SIGTERM, forcing kill...');
          server.kill('SIGKILL');
        }
        startServer();
      }, 3000); // Wait 3 seconds for graceful shutdown
    } catch (err) {
      writeLog('ERROR', 'Failed to stop server for restart:', { error: err.message });
      startServer();
    }
  } else {
    startServer();
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  writeLog('ERROR', 'Uncaught exception in CLI:', {
    error: err.message,
    stack: err.stack
  });
  server.kill('SIGTERM');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  writeLog('ERROR', 'Unhandled Promise rejection in CLI:', {
    reason: reason.toString(),
    promise: promise.toString()
  });
  server.kill('SIGTERM');
  process.exit(1);
});
