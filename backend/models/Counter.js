const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema(
  {
    count: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists
// Prevents accidental creation of multiple counters.
// If a second counter is accidentally inserted, MongoDB throws an error instead of creating it.
counterSchema.index({}, { unique: true, background: false });

module.exports = mongoose.model("Counter", counterSchema);
