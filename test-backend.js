// Simple test script to verify backend functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testBackend() {
  console.log('Testing backend functionality...\n');
  
  try {
    // Test if server is running
    console.log('1. Testing server status...');
    const serverResponse = await fetch(`${BASE_URL}/`);
    console.log('✓ Server is running:', await serverResponse.text());
    
    // Test admin login
    console.log('\n2. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      console.log('✓ Admin login successful');
      
      // Test fetching registrations
      console.log('\n3. Testing registration fetch...');
      const regResponse = await fetch(`${BASE_URL}/api/getAll`);
      
      if (regResponse.ok) {
        const registrations = await regResponse.json();
        console.log('✓ Successfully fetched registrations:', registrations.length, 'found');
      } else {
        console.log('✗ Failed to fetch registrations:', regResponse.status);
      }
    } else {
      console.log('✗ Admin login failed:', loginResponse.status);
    }
    
  } catch (error) {
    console.error('✗ Test failed:', error.message);
  }
}

// Run only if this script is executed directly
if (require.main === module) {
  testBackend();
}