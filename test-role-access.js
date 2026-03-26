// Comprehensive test for role-based access
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testRoleBasedAccess() {
  console.log('🧪 Testing Role-Based Access System\n');
  
  try {
    // Test 1: Server Status
    console.log('1. Testing server status...');
    const serverResponse = await fetch(`${BASE_URL}/`);
    console.log('✓ Server is running:', await serverResponse.text());
    
    // Test 2: Public Participant Registration (should work without login)
    console.log('\n2. Testing public participant registration...');
    const participantData = {
      name: 'Test Student',
      roll: 'TEST123',
      department: 'Computer Science',
      event: 'Coding Contest',
      contact: '1234567890'
    };
    
    const participantResponse = await fetch(`${BASE_URL}/api/public/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participantData)
    });
    
    if (participantResponse.ok) {
      console.log('✓ Participant registration successful (no login required)');
    } else {
      const error = await participantResponse.json();
      console.log('⚠️ Participant registration failed:', error.error || error.message);
    }
    
    // Test 3: Try duplicate registration (should fail)
    console.log('\n3. Testing duplicate registration prevention...');
    const duplicateResponse = await fetch(`${BASE_URL}/api/public/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participantData)
    });
    
    if (!duplicateResponse.ok) {
      const error = await duplicateResponse.json();
      console.log('✓ Duplicate registration prevented:', error.error);
    } else {
      console.log('✗ Duplicate registration was allowed (should be prevented)');
    }
    
    // Test 4: Try accessing admin routes without login (should fail)
    console.log('\n4. Testing protected admin routes without login...');
    const adminResponse = await fetch(`${BASE_URL}/api/getAll`);
    
    if (!adminResponse.ok) {
      console.log('✓ Admin routes are protected (unauthorized access denied)');
    } else {
      console.log('✗ Admin routes are not protected (security issue!)');
    }
    
    // Test 5: Admin login
    console.log('\n5. Testing admin login...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    if (loginResponse.ok) {
      console.log('✓ Admin login successful');
      
      // Test 6: Access admin routes after login (should work)
      console.log('\n6. Testing admin routes after login...');
      const adminDataResponse = await fetch(`${BASE_URL}/api/getAll`);
      
      if (adminDataResponse.ok) {
        const data = await adminDataResponse.json();
        console.log('✓ Admin can access protected routes, found', data.length, 'registrations');
      } else {
        console.log('✗ Admin cannot access routes even after login');
      }
    } else {
      console.log('✗ Admin login failed');
    }
    
    // Test 7: Different event registration (should work)
    console.log('\n7. Testing registration for different event...');
    const differentEventData = {
      ...participantData,
      event: 'Quiz Competition' // Different event
    };
    
    const differentEventResponse = await fetch(`${BASE_URL}/api/public/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(differentEventData)
    });
    
    if (differentEventResponse.ok) {
      console.log('✓ Same student can register for different events');
    } else {
      const error = await differentEventResponse.json();
      console.log('⚠️ Different event registration failed:', error.error);
    }
    
    console.log('\n🎉 Role-based access testing completed!');
    console.log('\n📋 Access Summary:');
    console.log('👥 Participants: Can only register via /api/public/register');
    console.log('👨‍💼 Admins: Must login to access full dashboard at /api/*');
    console.log('🔒 Duplicate Prevention: Active for same roll + event combination');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run only if this script is executed directly
if (require.main === module) {
  testRoleBasedAccess();
}

module.exports = { testRoleBasedAccess };