const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator"); // Add this line
const Voter = require("../models/Voter");
const sendEmail = require("../utils/email"); // Implement email sending logic
const Vote = require("../models/Vote") // Import the Vote model
const auth = require("../middleware/auth");


// Get current voter info
router.get("/me", auth, async (req, res) => {
  try {
    // The auth middleware already sets req.voter
    const voter = req.voter
    console.log("Voter ID:", voter._id)
    // Check if there's a vote record
    const vote = await Vote.findOne({ voter: voter._id })

    // Return voter info with vote status
    res.json({
      id: voter._id,
      name: voter.name,
      admissionNumber: voter.admissionNumber,
      email: voter.email,
      hasVoted: voter.hasVoted,
      voteRecord: vote ? true : false,
    })
  } catch (err) {
    console.error("Error fetching voter info:", err)
    res.status(500).json({ message: "Server error" })
  }
})


// Register endpoint updates
router.post("/register", async (req, res) => {

  const {
    email,
    admissionNumber,
    name,
    course,
    phone,
    password,
    confirmPassword,
  } = req.body;
  console.log("Clicked register:", req.body);
  // Validate inputs
  if (!email || !admissionNumber || !name || !course || !phone || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }
  if (!validator.isMobilePhone(phone)) {
    return res.status(400).json({
      message: "Invalid phone number format",
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  try {
    // Check for existing user by email or admission number
    const existingVoter = await Voter.findOne({
      $or: [{ admissionNumber }, { email }],
    });

    if (existingVoter) {
      return res.status(400).json({ message: "Voter already exists" });
    }

    const voter = new Voter({
      email, // Add email to the voter object
      admissionNumber,
      name,
      course,
      phone,
      password,
    });

    await voter.save();

    // Send confirmation email
    // await sendEmail({
    //   to: email,
    //   subject: "Registration Successful",
    //   html: `<p>Welcome ${name}! Your MMU voting account has been created.</p>`,
    // });

    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({
      message: "Registration failed",
      error: err.message,
    });
  }
});
// Bulk register endpoint
router.post("/registerBulk", async (req, res) => {
  const students = req.body; // expect an array
  

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ message: "Provide an array of students" });
  }

  const results = [];
  for (const data of students) {
    const {
      email,
      admissionNumber,
      name,
      course,
      phone,
      password,
      confirmPassword,
    } = data;

    // Validate required fields
    if (!email || !admissionNumber || !name || !course || !phone || !password) {
      results.push({ admissionNumber, status: "failed", reason: "Missing fields" });
      continue;
    }
    if (!validator.isEmail(email)) {
      results.push({ admissionNumber, status: "failed", reason: "Invalid email" });
      continue;
    }
    if (!validator.isMobilePhone(phone)) {
      results.push({ admissionNumber, status: "failed", reason: "Invalid phone" });
      continue;
    }
    if (password !== confirmPassword) {
      results.push({ admissionNumber, status: "failed", reason: "Passwords mismatch" });
      continue;
    }

    // Check duplicates
    const exists = await Voter.findOne({
      $or: [{ admissionNumber }, { email }],
    });
    if (exists) {
      results.push({ admissionNumber, status: "failed", reason: "Already exists" });
      continue;
    }

    // Create
    try {
      const voter = new Voter({
        email,
        admissionNumber,
        name,
        course,
        phone,
        password,
      });
      await voter.save();
      // Optionally send email here
      results.push({ admissionNumber, status: "success" });
    } catch (err) {
      results.push({ admissionNumber, status: "failed", reason: err.message });
    }
  }

  res.json({ results });
});

// Login
router.post("/login", async (req, res) => {
  const { admissionNumber, password } = req.body;

  // Validate input
  if (!admissionNumber || !password) {
    return res.status(400).json({ message: "Please provide admission number and password" });
  }

  try {
    // Find voter by admission number
    const voter = await Voter.findOne({ admissionNumber });
    
    // Check if voter exists
    if (!voter) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, voter.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: voter._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    // Send response with token
    res.json({ 
      message: "Login successful",
      token,
      voter: {
        id: voter._id,
        name: voter.name,
        admissionNumber: voter.admissionNumber,
        email: voter.email
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ 
      message: "Login failed",
      error: err.message 
    });
  }
});
// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { admissionNumber, phone } = req.body;

  try {
    const voter = await Voter.findOne({ admissionNumber, phone });
    if (!voter) {
      return res.status(404).json({ message: "Voter not found" });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    voter.resetToken = hashedToken;
    voter.resetExpires = Date.now() + 3600000; // 1 hour
    await voter.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    await sendEmail({
      to: voter.email,
      subject: "Password Reset Request - MMU Voting System",
      html: `
        <p>You requested a password reset for your MMU Voting account.</p>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json({ message: "Password reset instructions sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// reset Password
router.post("/reset-password", async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const voter = await Voter.findOne({
      resetToken: hashedToken,
      resetExpires: { $gt: Date.now() },
    });

    if (!voter) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    voter.password = newPassword;
    voter.resetToken = undefined;
    voter.resetExpires = undefined;
    await voter.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
