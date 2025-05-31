const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (await User.findOne({ email })) return res.status(400).json({ error: 'Email already exists' });
    const user = await User.create({ name, email, password });
    res.json({ message: 'Signup successful' });
  } catch (e) { res.status(500).json({ error: 'Signup failed' }); }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ error: 'Invalid email or password' });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ error: 'Login failed' }); }
});

router.post('/forgot', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'No user with that email' });
    const token = Math.random().toString(36).substring(2, 15);
    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 3600000;
    await user.save();

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${process.env.FRONTEND_URL}/reset-password.html?token=${token}">here</a> to reset your password.</p>`
    });
    res.json({ message: 'Reset email sent' });
  } catch (e) { res.status(500).json({ error: 'Failed to send email' }); }
});

router.post('/reset', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (e) { res.status(500).json({ error: 'Reset failed' }); }
});

module.exports = router; 