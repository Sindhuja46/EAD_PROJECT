const express = require("express");
const router = express.Router();
const Registration = require("../models/Registration");
const ExcelJS = require("exceljs");

// ✅ PUBLIC ROUTE – Participant registration (no authentication required)
router.post("/register", async (req, res) => {
  try {
    const { name, roll, event, department, contact } = req.body;
    
    console.log("Received registration data:", req.body); // Debug log
    
    // Validate required fields
    if (!name || !roll || !event) {
      return res.status(400).json({ 
        error: "Name, roll number, and event are required fields." 
      });
    }
    
    // Check if already registered for this event with this roll number
    const existingReg = await Registration.findOne({ roll, event });
    if (existingReg) {
      return res.status(400).json({ 
        error: `Already registered for ${event} with roll number ${roll}. Each student can register only once per event.` 
      });
    }

    const reg = new Registration(req.body);
    await reg.save();
    console.log("Registration saved successfully:", reg); // Debug log
    res.status(201).json({ message: "Registered successfully", reg });
  } catch (err) {
    console.error("Registration error:", err); // Debug log
    if (err.code === 11000) {
      res.status(400).json({ 
        error: "Duplicate registration detected. You are already registered for this event." 
      });
    } else {
      res.status(500).json({ error: err.message });
    }
  }
});

// ✅ ADMIN ROUTES (protected - require authentication)

// Create (Admin only)
router.post("/register", async (req, res) => {
  try {
    const { roll, event, name } = req.body;
    
    // Check if this roll number is already registered for this specific event
    const existingRegistration = await Registration.findOne({ roll, event });
    
    if (existingRegistration) {
      return res.status(409).json({ 
        error: `Roll number ${roll} is already registered for event "${event}". The same student cannot register twice for the same event.`,
        code: "DUPLICATE_REGISTRATION"
      });
    }
    
    const reg = new Registration(req.body);
    await reg.save();
    res.status(201).json({ message: "Registered successfully", reg });
  } catch (err) {
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      const duplicateField = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        error: `This roll number is already registered for this event.`,
        code: "DUPLICATE_REGISTRATION"
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Read all
router.get("/getAll", async (req, res) => {
  try {
    const all = await Registration.find().sort({ createdAt: -1 });
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update by ID
router.put("/update/:id", async (req, res) => {
  try {
    const { roll, event } = req.body;
    
    // Check if updating would create a duplicate (excluding the current record)
    if (roll && event) {
      const existingRegistration = await Registration.findOne({ 
        roll, 
        event, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingRegistration) {
        return res.status(409).json({ 
          error: `Roll number ${roll} is already registered for event "${event}". Cannot update to create duplicate registration.`,
          code: "DUPLICATE_REGISTRATION"
        });
      }
    }
    
    const updated = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Updated", updated });
  } catch (err) {
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({ 
        error: `This roll number is already registered for this event.`,
        code: "DUPLICATE_REGISTRATION"
      });
    }
    res.status(500).json({ error: err.message });
  }
});

// Delete by ID
router.delete("/delete/:id", async (req, res) => {
  try {
    const deleted = await Registration.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export all to Excel (using ExcelJS)
router.get("/export", async (req, res) => {
  try {
    const data = await Registration.find().lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registrations");

    if (data.length === 0) {
      worksheet.addRow(["No data available"]);
    } else {
      // Extract column headers dynamically
      const headers = Object.keys(data[0]).filter(k => k !== "__v");
      worksheet.addRow(headers.map(h => h === "_id" ? "id" : h));

      // Add rows
      data.forEach(item => {
        const row = headers.map(h => h === "_id" ? item[h].toString() : item[h]);
        worksheet.addRow(row);
      });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Registrations.xlsx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get registration statistics
router.get("/stats", async (req, res) => {
  try {
    const totalRegistrations = await Registration.countDocuments();
    
    // Get event-wise count
    const eventStats = await Registration.aggregate([
      {
        $group: {
          _id: "$event",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Check for potential duplicates (same roll in different events)
    const rollStats = await Registration.aggregate([
      {
        $group: {
          _id: "$roll",
          events: { $addToSet: "$event" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    res.json({
      totalRegistrations,
      eventStats,
      studentsInMultipleEvents: rollStats.length,
      rollStats: rollStats.slice(0, 10) // Show first 10 for preview
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
