const { networkInterfaces } = require('os');
const fs = require('fs');
const path = require('path');

// Get the local IP address
function getLocalIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip over non-IPv4 and internal addresses
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }
  
  return results[0] || 'localhost';
}

// Update the .env file
function updateEnvFile() {
  const envPath = path.join(__dirname, '../.env');
  const localIP = getLocalIP();
  const port = process.env.PORT || '3000';
  
  // Read current .env file
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Check if we want to use localhost or IP
  const useLocalhost = process.argv.includes('--localhost');
  const baseUrl = useLocalhost ? 'localhost' : localIP;
  const newUrl = `http://${baseUrl}:${port}`;
  
  // Update or add NEXTAUTH_URL
  if (envContent.includes('NEXTAUTH_URL=')) {
    // Replace existing NEXTAUTH_URL
    envContent = envContent.replace(/NEXTAUTH_URL=.*/, `NEXTAUTH_URL=${newUrl}`);
  } else {
    // Add NEXTAUTH_URL
    envContent += `\nNEXTAUTH_URL=${newUrl}\n`;
  }
  
  // Write back to .env file
  fs.writeFileSync(envPath, envContent);
  
  console.log(`Updated NEXTAUTH_URL to: ${newUrl}`);
  
  if (useLocalhost) {
    console.log(`Access your app at: http://localhost:${port}`);
  } else {
    console.log(`Access your app at: ${newUrl}`);
    console.log(`Or locally at: http://localhost:${port}`);
  }
}

updateEnvFile();
