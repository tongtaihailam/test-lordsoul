const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


const router = express.Router();

const dressingOwned = new mongoose.Schema({
  id: Number,
  typeId: Number,
  camera: String,
  name: String,
  iconUrl: String,
  resourceId: String,
  details: String,
  forId: Number,
  price: Number,
  currency: Number
});

const DressingOwned = mongoose.model('DressingOwned', dressingOwned);
const User = mongoose.model('User');

router.get('/api/:version/decorations/:id', async (req, res) => {
  const userId = req.headers['userid'];
  const id = req.params.id;

  const dressesCategory = {
    "1": [8, 9, 10],
    "2": [2],
    "3": [11, 13, 14, 15],
    "4": [3],
    "5": [4],
    "6": [5],
    "7": [6]
  };

  const categories = dressesCategory[id];

  if (!categories) {
    return res.status(400).json({
      code: 0,
      message: 'Invalid category ID',
      data: null,
      other: null,
    });
  }

  const avatars = await DressingOwned.find({ forId: userId, typeId: { $in: categories } });

  res.status(200).json({
    code: 1,
    message: 'SUCCESS',
    data: avatars.map(avatar => ({
      id: avatar.id,
      typeId: avatar.typeId,
      camera: avatar.camera,
      name: avatar.name,
      iconUrl: avatar.iconUrl,
      resourceId: avatar.resourceId,
      details: avatar.details,
    })),
    other: null,
  });
});

router.put('/api/v1/decorations/using/:avatarId', async (req, res) => {
  const userId = req.headers['userid'];
  const avatarId = req.params.avatarId;

  const avatarCollections = [DressingOwned];
  let validAvatar = null;

  for (let collection of avatarCollections) {
    const avatars = await collection.find({ id: avatarId });

    for (let avatar of avatars) {
      if (String(avatar.forId) === String(userId)) {
        validAvatar = avatar;
        break;
      }
    }

    if (validAvatar) break;
  }

  if (!validAvatar) {
    return res.status(404).json({ code: 61879, message: 'Avatar is not owned by user or not found', data: null });
  }

  const user = await User.findOne({ userId });

  if (!user) {
    return res.status(404).json({ code: 404, message: 'User not found', data: null });
  }

  // Ensure the `dressing` field is an object and not an array or other type
  if (typeof user.dressing !== 'object' || Array.isArray(user.dressing)) {
    user.dressing = {};
  }

  // Update only the specific typeId in the dressing field (e.g., typeId 1 = hat, 2 = shirt)
  user.dressing[validAvatar.typeId] = {
    id: validAvatar.id,
    typeId: validAvatar.typeId,
    camera: validAvatar.camera,
    name: validAvatar.name,
    iconUrl: validAvatar.iconUrl,
    status: 1, // Mark as equipped
    sex: 0,
    tag: [],
    resourceId: validAvatar.resourceId,
    details: validAvatar.details
  };

  // Mark the `dressing` field as modified to ensure it saves properly
  user.markModified('dressing');

  // Save the updated user
  await user.save();

  res.status(200).json({
    code: 1,
    message: 'SUCCESS',
    data: user.dressing[validAvatar.typeId] // Return the updated decoration
  });
});
// GET: Load equipped decoration from user's dressing field
router.get('/api/v1/decorations/:userId/using', async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ code: 0, message: 'User data not found' });
    }

    if (!user.dressing) {
      console.log('No dressing field for user');
      return res.status(200).json({ code: 1, message: 'SUCCESS', data: [] });
    }

    // Find the dressing (decoration) using the user's dressing id
    const decoration = await DressingOwned.findOne({ id: user.dressing.id });
    if (!decoration) {
      console.log('Decoration not found for ID:', user.dressing.id);
      return res.status(404).json({ code: 0, message: 'Decoration not found' });
    }

    const response = {
      id: decoration.id,
      status: 1,
      resourceId: decoration.resourceId,
      price: decoration.price,
      iconUrl: decoration.iconUrl,
      typeId: decoration.typeId
    };

    res.json({ code: 1, message: 'SUCCESS', data: [response] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ code: 0, message: 'Server error' });
  }
});

router.get('/api/v1/decorations/using', async (req, res) => {
  const userId = parseInt(req.headers['userid']);  // Get userId from headers and parse it as an integer

  if (!userId) {
    return res.status(400).json({ code: 0, message: 'User ID is required in headers' });
  }

  try {
    // Find the user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ code: 0, message: 'User data not found' });
    }

    // Check if the user has a dressing field
    if (!user.dressing) {
      console.log('No dressing field for user');
      return res.status(200).json({ code: 1, message: 'SUCCESS', data: [] });
    }

    // Find the decoration (dressing) using the user's dressing id
    const decoration = await DressingOwned.findOne({ id: user.dressing.id });
    if (!decoration) {
      console.log('Decoration not found for ID:', user.dressing.id);
      return res.status(404).json({ code: 0, message: 'Decoration not found' });
    }

    // Prepare the response with decoration details
    const response = {
      id: decoration.id,
      status: 1,
      resourceId: decoration.resourceId,
      price: decoration.price,
      iconUrl: decoration.iconUrl,
      typeId: decoration.typeId
    };

    // Send the response with the decoration details
    res.json({ code: 1, message: 'SUCCESS', data: [response] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ code: 0, message: 'Server error' });
  }
});

router.delete('/api/v1/decorations/using/:avatarId', async (req, res) => {
  const userId = req.headers['userid'];  // Get userId from headers
  const avatarId = parseInt(req.params.avatarId);  // Get avatarId from URL params

  // Ensure that userId exists in the headers
  if (!userId) {
    console.log("Error: No userId in headers");
    return res.status(400).json({ code: 400, message: 'User ID is required in headers', data: null });
  }

  try {
    // Find the user by userId
    const user = await User.findOne({ userId });
    if (!user) {
      console.log("Error: User not found");
      return res.status(404).json({ code: 0, message: 'User data not found' });
    }

    // Log user and dressing field for debugging
    console.log('User found:', user);
    console.log('User dressing:', user.dressing);

    // Check if the avatarId exists in the user's dressing
    const itemKey = Object.keys(user.dressing).find(key => user.dressing[key].id === avatarId);

    if (!itemKey) {
      console.log('Error: Decoration not equipped or not found');
      return res.status(400).json({ code: 0, message: 'Decoration not equipped or not found' });
    }

    // Remove the decoration from the user's dressing field
    delete user.dressing[itemKey];  // Remove the item from the dressing

    console.log('Decoration unequipped:', user.dressing);

    // Save the updated user
    await user.save();

    // Respond with a success message
    res.status(200).json({
      code: 1,
      message: 'SUCCESS',
      data: {}
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ code: 0, message: 'Server error' });
  }
});

router.get('/api/:version/vip/decorations/users/1', (req, res) => {
    const response = {
  "code": 1,
  "message": "SUCCESS",
  "data": [],
  "other": null
    };

    res.json(response);
});

router.get('/api/:version/vip/decorations/users/3', (req, res) => {
    const response = {
  "code": 1,
  "message": "SUCCESS",
  "data": [],
  "other": null
    };

    res.json(response);
});

module.exports = router;