// server/routes/therapistRouter.js
const express = require("express");
const router = express.Router();
const Therapist = require("../models/Therapist");

// Get all therapists// server/routes/therapistRouter.js
router.get("/", async (req, res) => {
    try {
      const therapists = await Therapist.find().lean(); // Add .lean() for better performance
      // Transform data before sending
      const transformed = therapists.map(t => ({
        id: t._id,
        name: t.name,
        specialization: t.specialization
      }));
      res.json(transformed);
    } catch (error) {
      res.status(500).json({ message: "Error fetching therapists", error: error.message });
    }
  });
module.exports = router;