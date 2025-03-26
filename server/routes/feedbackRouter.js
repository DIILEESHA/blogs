const express = require("express");
const router = express.Router();
const Feedback = require("../models/Feedback");
const authenticateJWT = require("../middleware/auth");
const mongoose = require("mongoose");

// Create feedback
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { rating, feedback, therapist, anonymous } = req.body;
    
    const newFeedback = new Feedback({
      userId: req.user._id,  // Changed from req.user.id to req.user._id
      name: anonymous ? "Anonymous" : req.user.name,
      rating,
      feedback,
      therapist
    });

    const savedFeedback = await newFeedback.save();
    res.status(201).json({
      success: true,
      data: savedFeedback,
      message: "Feedback created successfully"
    });
  } catch (error) {
    console.error("Feedback creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating feedback",
      error: error.message
    });
  }
});

// Get all feedbacks
router.get("/", async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: feedbacks,
      message: "Feedbacks retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching feedbacks",
      error: error.message
    });
  }
});

// Get user's feedbacks
router.get("/my-feedbacks", authenticateJWT, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: feedbacks,
      message: "User feedbacks retrieved successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching your feedbacks",
      error: error.message
    });
  }
});

// Update feedback
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format"
      });
    }

    // First find the feedback to verify ownership
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    // Check ownership - compare string representations
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this feedback"
      });
    }

    // Prepare update data
    const updateData = {
      rating: req.body.rating,
      feedback: req.body.feedback,
      therapist: req.body.therapist,
      name: req.body.anonymous ? "Anonymous" : req.user.name
    };

    // Perform the update
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );

    res.json({
      success: true,
      data: updatedFeedback,
      message: "Feedback updated successfully"
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback",
      error: error.message
    });
  }
});

// Delete feedback
// Delete feedback
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid feedback ID format"
      });
    }

    // Find the feedback first to verify ownership
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    // Check if user owns the feedback or is admin
    if (feedback.userId.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this feedback"
      });
    }

    // If checks pass, delete the feedback
    await Feedback.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully",
      deletedId: req.params.id
    });

  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting feedback",
      error: error.message
    });
  }
});
module.exports = router;