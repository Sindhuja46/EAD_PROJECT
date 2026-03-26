const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roll: { type: String, required: true },
  department: { type: String },
  event: { type: String, required: true },
  contact: { type: String },
}, { timestamps: true });

// Create compound unique index to prevent duplicate roll numbers for the same event
registrationSchema.index({ roll: 1, event: 1 }, { unique: true });

module.exports = mongoose.model("Registration", registrationSchema);