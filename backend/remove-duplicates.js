// Utility script to remove duplicate registrations
// This script will keep the earliest registration for each roll-event combination

const mongoose = require("mongoose");
require("dotenv").config();

const Registration = require("./models/Registration");

const MONGO_URI = process.env.MONGO_URI;

async function removeDuplicates() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Find all duplicates
    const duplicates = await Registration.aggregate([
      {
        $group: {
          _id: { roll: "$roll", event: "$event" },
          docs: { $push: { id: "$_id", createdAt: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    console.log(`Found ${duplicates.length} sets of duplicate registrations`);

    let removedCount = 0;

    for (const duplicate of duplicates) {
      // Sort by creation date and keep the first one (earliest)
      const sortedDocs = duplicate.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Remove all except the first one
      const toRemove = sortedDocs.slice(1);
      
      for (const doc of toRemove) {
        await Registration.findByIdAndDelete(doc.id);
        removedCount++;
        console.log(`Removed duplicate registration: Roll ${duplicate._id.roll}, Event ${duplicate._id.event}`);
      }
    }

    console.log(`\nSummary:`);
    console.log(`- Found ${duplicates.length} sets of duplicates`);
    console.log(`- Removed ${removedCount} duplicate registrations`);
    console.log(`- Kept the earliest registration for each roll-event combination`);

  } catch (error) {
    console.error("Error removing duplicates:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Run the cleanup
removeDuplicates();