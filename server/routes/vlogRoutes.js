const express = require("express");
const router = express.Router();
const Vlog = require("../models/Vlog");
const authenticateJWT = require("../middleware/auth");

router.patch("/:id/status", authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only admins can change vlog status" });
    }

    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const vlog = await Vlog.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    res.status(200).json(vlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating vlog status" });
  }
});

// Update GET /api/vlogs to only show approved vlogs
router.get("/", async (req, res) => {
  try {
    const vlogs = await Vlog.find({ status: 'approved' }).populate("author", "username");
    res.status(200).json(vlogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching vlogs" });
  }
});

// Add endpoint to get pending vlogs (for admin)
router.get("/pending", authenticateJWT, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.userType !== 'admin') {
      return res.status(403).json({ message: "Only admins can view pending vlogs" });
    }

    const vlogs = await Vlog.find({ status: 'pending' }).populate("author", "username");
    res.status(200).json(vlogs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching pending vlogs" });
  }
});

// Get a single vlog by ID
router.get("/:id", async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id).populate("author", "username");
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }
    res.status(200).json(vlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching vlog" });
  }
});

// Create a new vlog
router.post("/", authenticateJWT, async (req, res) => {
  try {
    const { title, coverImage, content } = req.body;
    const newVlog = new Vlog({
      title,
      coverImage,
      content,
      author: req.user._id,
    });

    await newVlog.save();
    res.status(201).json(newVlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating vlog" });
  }
});

// Edit a vlog by ID
router.put("/:id", authenticateJWT, async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id);
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    // Check if the logged-in user is the author
    if (vlog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to edit this vlog" });
    }

    // Update vlog content
    const { title, coverImage, content } = req.body;
    vlog.title = title || vlog.title;
    vlog.coverImage = coverImage || vlog.coverImage;
    vlog.content = content || vlog.content;

    const updatedVlog = await vlog.save();
    res.status(200).json(updatedVlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating vlog" });
  }
});

// Delete a vlog by ID
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id);
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    // Check if the logged-in user is the author
    if (vlog.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not authorized to delete this vlog" });
    }

    await Vlog.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Vlog deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error deleting vlog",
      error: error.message
    });
  }
});


router.post("/:id/like", authenticateJWT, async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id);
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    const userId = req.user._id;
    const likeIndex = vlog.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Add like if not already liked
      vlog.likes.push(userId);
    } else {
      // Remove like if already liked
      vlog.likes.splice(likeIndex, 1);
    }

    await vlog.save();
    res.status(200).json(vlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating likes" });
  }
});

// Add comment to vlog
router.post("/:id/comment", authenticateJWT, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const vlog = await Vlog.findById(req.params.id);
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    const newComment = {
      text,
      user: req.user._id,
      username: req.user.username, // Store username for easy display
    };

    vlog.comments.push(newComment);
    await vlog.save();

    res.status(201).json(vlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error adding comment" });
  }
});

// Delete comment from vlog
router.delete("/:id/comment/:commentId", authenticateJWT, async (req, res) => {
  try {
    const vlog = await Vlog.findById(req.params.id);
    if (!vlog) {
      return res.status(404).json({ message: "Vlog not found" });
    }

    const commentIndex = vlog.comments.findIndex(
      (comment) => comment._id.toString() === req.params.commentId
    );

    if (commentIndex === -1) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const comment = vlog.comments[commentIndex];

    // Check if user is the comment author or vlog author
    if (
      comment.user.toString() !== req.user._id.toString() &&
      vlog.author.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    vlog.comments.splice(commentIndex, 1);
    await vlog.save();

    res.status(200).json(vlog);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

module.exports = router;