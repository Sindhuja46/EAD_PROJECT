// Test participant registration functionality
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testParticipantRegistration() {
  console.log('Testing Participant Registration...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const serverResponse = await fetch(`${BASE_URL}/`);
    if (serverResponse.ok) {
      console.log('✓ Server is running');
    } else {
      console.log('✗ Server is not responding');
      return;
    }
    
    // Test 2: Test participant registration
    console.log('\n2. Testing participant registration...');
    const testData = {
      name: 'Test Student',
      roll: 'TEST' + Date.now(), // Unique roll number
      department: 'Computer Science',
      event: 'Coding Contest',
      contact: '9876543210'
    };
    
    console.log('Sending registration data:', testData);
    
    const response = await fetch(`${BASE_URL}/api/public/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    console.log('Response status:', response.status);
    const responseData = await response.json();
    console.log('Response data:', responseData);
    
    if (response.ok) {
      console.log('✓ Participant registration successful!');
      
      // Test 3: Try duplicate registration
      console.log('\n3. Testing duplicate registration prevention...');
      const duplicateResponse = await fetch(`${BASE_URL}/api/public/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      if (!duplicateResponse.ok) {
        const duplicateError = await duplicateResponse.json();
        console.log(' Duplicate registration prevented:', duplicateError.error);
      } else {
        console.log(' Duplicate registration was allowed (should be blocked)');
      }
      
    } else {
      console.log(' Participant registration failed:', responseData.error || responseData.message);
    }
    
  } catch (error) {
    console.error(' Test failed:', error.message);
    console.log('\n Make sure the backend server is running:');
    console.log('   cd backend && npm start');
  }
}

// Run the test
testParticipantRegistration();