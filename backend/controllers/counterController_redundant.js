const Counter = require("../models/Counter");

const updateCounter = async (req, res) => {
  console.log("in updateCounter handler");
  try {
    const result = await Counter.findOneAndUpdate(
      {},
      { $inc: { value: 1 } },
      { new: true, upsert: true }
    );

    res.json({ value: result.value });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  updateCounter,
};
