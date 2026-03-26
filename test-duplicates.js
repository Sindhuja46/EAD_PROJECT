// Test script for duplicate prevention functionality
require("dotenv").config();

const API_BASE = "http://localhost:5000/api";

async function testDuplicatePrevention() {
  console.log("🧪 Testing Duplicate Prevention Functionality\n");

  // Helper function to make API calls
  async function makeRequest(endpoint, method = "GET", body = null) {
    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };
    if (body) options.body = JSON.stringify(body);
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, options);
      const data = await response.json();
      return { success: response.ok, status: response.status, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Test login first
  console.log("1. 🔐 Testing admin login...");
  const loginResult = await makeRequest("/admin/login", "POST", {
    username: "admin",
    password: "admin123"
  });
  
  if (!loginResult.success) {
    console.log("❌ Login failed. Make sure server is running.");
    return;
  }
  console.log("✅ Login successful\n");

  // Test Case 1: Register a new student for Event1
  console.log("2. 📝 Test Case 1: Register student for Event1...");
  const registration1 = await makeRequest("/register", "POST", {
    name: "Test Student A",
    roll: "TEST001",
    department: "Computer Science",
    event: "Event1",
    contact: "1234567890"
  });
  
  if (registration1.success) {
    console.log("✅ Successfully registered student for Event1");
  } else {
    console.log("❌ Failed to register:", registration1.data.error);
  }

  // Test Case 2: Try to register same student for Event1 again (should fail)
  console.log("\n3. ⚠️  Test Case 2: Try duplicate registration for same event...");
  const registration2 = await makeRequest("/register", "POST", {
    name: "Test Student A",
    roll: "TEST001",
    department: "Computer Science",
    event: "Event1",
    contact: "1234567890"
  });
  
  if (!registration2.success && registration2.data.code === "DUPLICATE_REGISTRATION") {
    console.log("✅ Correctly prevented duplicate registration for same event");
    console.log("   Message:", registration2.data.error);
  } else {
    console.log("❌ Should have prevented duplicate registration");
  }

  // Test Case 3: Register same student for Event2 (should succeed)
  console.log("\n4. ✅ Test Case 3: Register same student for different event...");
  const registration3 = await makeRequest("/register", "POST", {
    name: "Test Student A",
    roll: "TEST001",
    department: "Computer Science",
    event: "Event2",
    contact: "1234567890"
  });
  
  if (registration3.success) {
    console.log("✅ Successfully registered same student for different event");
  } else {
    console.log("❌ Should have allowed registration for different event:", registration3.data.error);
  }

  // Test Case 4: Check statistics
  console.log("\n5. 📊 Test Case 4: Check registration statistics...");
  const stats = await makeRequest("/stats");
  
  if (stats.success) {
    console.log("✅ Statistics retrieved successfully");
    console.log("   Total registrations:", stats.data.totalRegistrations);
    console.log("   Events:", stats.data.eventStats.map(e => `${e._id}: ${e.count}`).join(", "));
    console.log("   Students in multiple events:", stats.data.studentsInMultipleEvents);
  } else {
    console.log("❌ Failed to get statistics");
  }

  // Cleanup: Delete test registrations
  console.log("\n6. 🧹 Cleaning up test data...");
  const allRegs = await makeRequest("/getAll");
  if (allRegs.success) {
    const testRegs = allRegs.data.filter(reg => reg.roll === "TEST001");
    for (const reg of testRegs) {
      await makeRequest(`/delete/${reg._id}`, "DELETE");
    }
    console.log(`✅ Cleaned up ${testRegs.length} test registrations`);
  }

  console.log("\n🎉 Duplicate prevention testing completed!");
}

// Only run if this file is executed directly
if (require.main === module) {
  testDuplicatePrevention().catch(console.error);
}

module.exports = testDuplicatePrevention;