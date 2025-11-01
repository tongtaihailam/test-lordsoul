const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');

const router = express.Router();
const path = require('path');

const user = mongoose.model('User');

function generateRandomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save email and generate verification code
router.post('/user/api/v1/emails/emails', async (req, res) => {
  const user = mongoose.model('User');
  const email = req.query.email;
  const userId = req.headers['userid'];

  console.log('[Email Save] Incoming request');
  console.log('Email:', email);
  console.log('UserId from headers:', userId);

  if (!email || !userId) {
    console.log('[Email Save] Missing email or userId');
    return res.status(400).json({ code: 0, message: 'Missing email or userId' });
  }

  try {
    const foundUser = await user.findOne({ userId });
    console.log('[Email Save] User found:', foundUser);

    if (!foundUser) {
      console.log('[Email Save] User not found in database');
      return res.status(404).json({ code: 0, message: 'User not found' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    foundUser.email = email;
    foundUser.verifyCode = code;
    foundUser.verifyTime = Date.now();

    await foundUser.save();
    console.log('[Email Save] Email and code saved to user');

    return res.json({
      code: 1,
      message: 'SUCCESS',
      data: null,
      toastMessage: `Verification code: ${code}`
    });
  } catch (e) {
    console.error('[Email Save] Server error:', e);
    return res.status(500).json({ code: 0, message: 'Server error' });
  }
});

// Bind email with verification code
router.post('/user/api/v1/users/bind/email', async (req, res) => {
  const { email, verifyCode } = req.body;
  const userId = req.headers['userid'];

  if (!email || !verifyCode) {
    return res.status(400).json({ code: 0, message: 'Email or verify code not provided' });
  }

  if (!userId) {
    return res.status(400).json({ code: 0, message: 'userId not provided in headers' });
  }

  try {
    const foundUser = await user.findOne({ userId });

    if (!foundUser) {
      return res.status(404).json({ code: 0, message: 'User data not found' });
    }

    if (foundUser.verifyCode !== verifyCode) {
      return res.status(400).json({ code: 0, message: 'Invalid verify code' });
    }

    const currentTime = Date.now();
    if (!foundUser.verifyTime || currentTime - foundUser.verifyTime > 300000) {
      foundUser.verifyCode = undefined;
      foundUser.verifyTime = undefined;
      await foundUser.save();
      return res.status(400).json({ code: 0, message: 'Verify code has expired' });
    }

    foundUser.email = email;
    foundUser.verifyCode = undefined;
    foundUser.verifyTime = undefined;

    await foundUser.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 0, message: 'Server error' });
  }
});

// Delete email
router.delete('/user/api/v1/users/:userId/emails', async (req, res) => {
  const { userId } = req.params;

  try {
    const foundUser = await user.findOne({ userId });

    if (!foundUser) {
      return res.status(400).json({ code: 0, message: 'User data not found' });
    }

    if (!foundUser.email) {
      return res.status(400).json({ code: 0, message: 'Email not found in user data' });
    }

    foundUser.email = undefined;
    await foundUser.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 0, message: 'Server error' });
  }
});


module.exports = router;