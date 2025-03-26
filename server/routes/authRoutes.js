const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
require("dotenv").config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Helper function for error handling
const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  res.status(500).json({ 
    success: false, 
    message: `Error ${context}`,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Signup Route
// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Name, email, and password are required" 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: "Email already in use" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      name, 
      email, 
      password: hashedPassword,
      userType: 'customer' // Explicitly set userType
    });

    // Save user to database
    await newUser.save();

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      userId: newUser._id
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error registering user",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ 
      success: true, 
      token,
      username: user.name,
      userId: user._id,
      userType: user.userType || 'customer' // Default to 'user' if not specified
    });
  } catch (error) {
    handleError(res, error, "logging in");
  }
});

// Logout Route (Client-side token deletion)
router.post("/logout", (req, res) => {
  res.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

// Middleware to Verify JWT Token
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      success: false, 
      message: "Authorization token required" 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: "Invalid or expired token" 
    });
  }
};

// Protected Route Example
router.get("/profile", authenticateJWT, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    handleError(res, error, "fetching profile");
  }
});

module.exports = router;