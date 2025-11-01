const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');

const router = express.Router();
const path = require('path');

const accountJson = require(path.resolve(__dirname, '../account/account.json'));
const detailsJson = require('../account/details');
const friendJson = require('../config/friend');
const signInData = require('../config/signin');

const userSchema = new mongoose.Schema({
  password: String,
  nickname: String,
  userId: String,
  birthday: String,
  clanId: Number,
  clanName: String,
  introduction: String,
  diamonds: Number,
  gold: Number,
  sex: Number,
  deviceId: mongoose.Schema.Types.Mixed,
  signature: String,
  email: String,
  picUrl: String,
  dressing: mongoose.Schema.Types.Mixed,
  vip: Number,
  test: mongoose.Schema.Types.Mixed,
  verifyCode: mongoose.Schema.Types.Mixed,
  verifyTime: mongoose.Schema.Types.Mixed,
  signInDays: mongoose.Schema.Types.Mixed,
  friendRequests: mongoose.Schema.Types.Mixed,
  friends: mongoose.Schema.Types.Mixed
  
});

const User = mongoose.model('User', userSchema);

router.post('/api/v1/app/set-password', async (req, res) => {
    const { password } = req.body;
    const userId = req.headers.userid;

    if (!userId) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }

    let user = await User.findOne({ userId });

    if (!user) {
        return res.status(404).json({ code: 108, message: 'User not found', data: null });
    }

    user.password = password;

    await user.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
});

router.post('/api/v1/app/renew', async (req, res) => {
    const userId = (Math.floor(Math.random() * 100000) + 600000).toString();

    const user = new User({ userId });

    await user.save();

    res.status(200).json({ code: 1, message: 'SUCCESS', data: { userId, accessToken: 'Not implemented' } });
});

router.post('/api/v1/user/register', async (req, res) => {
    const { nickName, sex } = req.body;
    const userId = req.headers.userid;

    if (!nickName) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }

    let user = await User.findOne({ userId: userId });

    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }

    const existingUser = await User.findOne({ nickname: nickName });
    if (existingUser) {
        return res.status(400).json({ code: 7, message: 'Nickname already exists, choose another nickname', data: null });
    }

    user.nickname = nickName;
    user.sex = sex;
    user.picUrl = '';
    user.clanId = '';
    user.clanName = '';
    user.birthday = '';
    user.diamonds = 1500;
    user.introduction = 'Thank you for playing Blockman go';
    user.deviceId = '';
    user.signature = '';
    user.email = '';
    user.dressing = '';
    user.friendRequests = '';
    user.friends = '';
    user.verifyTime = '';
    user.verifyCode = '';
    user.test = '';
    user.signInDays = '';
    user.gold = 1500;
    user.vip = 1;

    await user.save();

    const responseData = { 
        userId: userId,
        nickName: user.nickname,
        sex: user.sex, 
        picUrl: user.picUrl, 
        clanId: user.clanId,
        clanName: user.clanName,
        details: user.introduction,
        deviceId: user.deviceId,
        signature: user.signature,
        email: user.email,
        dressing: user.dressing,
        birthday: user.birthday,
        friendRequests: user.friendRequests,
        friends: user.friends,
        test: user.test,
        verifyCode: user.verifyCode,
        verifyTime: user.verifyTime,
        signInDays: user.signInDays,
        vip: user.vip, 
        expire: 0
    };

    res.status(200).json({ 
        code: 1, 
        message: 'SUCCESS', 
        data: responseData 
    });
});

router.post('/api/v1/user/ip', async (req, res) => {
  const userId = req.header('userid');
  const test = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!userId) {
    return res.status(400).json({ code: 0, message: 'Missing userId in headers' });
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ code: 0, message: 'User not found' });
    }

    user.test = test;
    await user.save();

    res.json({ code: 1, message: 'IP saved successfully', data: { userId, test } });
  } catch (err) {
    res.status(500).json({ code: 0, message: 'Server error', error: err.message });
  }
});


router.post('/api/v1/user/details/info', async (req, res) => {
    const userId = req.headers['userid'];

    if (!userId) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }

    let user = await User.findOne({ userId });

    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname || '',
        birthday: user.birthday || '',
        clanId: user.clanId || '',
        clanName: user.clanName || '',
        details: user.introduction || 'Welcome To Blockman GO! ',
        deviceUd: user.deviceId,
        signature: user.signature,
        email: user.email,
        diamonds: user.diamonds,
        golds: user.gold,
        dressing: user.dressing,
        friendRequests: user.friendRequests,
        test: user.test,
        verifyTime: user.verifyTime,
        verifyCode: user.verifyCode,
        signInDays: user.signInDays,
        friends: user.friends,
        picUrl: user.picUrl || '',
        hasPassword: true,
        stopToTime: null
    };

    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

router.get('/api/v1/user/player/info', async (req, res) => {
    const userId = req.headers['userid'];

    if (!userId) {
        return res.status(400).json({
            code: 6,
            message: 'Bad request: Missing required parameters',
            data: null
        });
    }

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({
                code: 7,
                message: 'User not found',
                data: null
            });
        }

        const userInfo = {
            userId: user.userId,
            sex: user.sex || 2,
            nickName: user.nickname || '',
            birthday: user.birthday || '',
            clanId: user.clanId || '',
            clanName: user.clanName || '',
            details: user.introduction || "Welcome",
            signature: user.signature,
            email: user.email,
            friends: user.friend,
            friendRequests: user.friendRequests,
            verifyCode: user.verifyCode,
            verifyTime: user.verifyTime,
            test: user.test,
            signInDays: user.signInDays,
            dressing: user.dressing,
            picUrl: user.picUrl || ''
        };

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: userInfo
        });
    } catch (error) {
        res.status(500).json({
            code: 5,
            message: 'Internal Server Error',
            data: null
        });
    }
});

router.post('/api/v1/app/login', async (req, res) => {
    const { uid, password } = req.body;

    if (!uid || !password) {
        return res.status(400).json({ code: 6, message: 'Bad request : Params error please fill them', data: null });
    }

    let user = await User.findOne({ userId: uid });

    if (!user) {
        return res.status(200).json({
            code: 102,
            message: 'User ID or username not found.',
            data: null
        });
    }

    if (user.password !== password) {
        return res.status(200).json({
            code: 108,
            message: 'Incorrect password.',
            data: null
        });
    }

    res.status(200).json({
        code: 1,
        data: {
            userId: user.userId,
            accessToken: 'Not implemented',
            telephone: '',
            email: ''
        },
        message: 'SUCCESS'
    });
});

router.post('/api/v1/user/password/modify', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.headers['userid']; 

    if (!newPassword || newPassword.trim() === '') {
        return res.status(400).json({ 
            code: 1, 
            message: 'New password cannot be empty', 
            data: null 
        });
    }

    try {
        const user = await User.findOne({ userId });

        if (!user) {
            return res.status(404).json({ 
                code: 1, 
                message: 'User not found', 
                data: null 
            });
        }

        if (user.password !== oldPassword) {
            return res.status(200).json({
                code: 108, 
                message: 'Incorrect old password', 
                data: null
            });
        }

        user.password = newPassword;
        await user.save();

       
        return res.status(200).json({ 
            code: 1, 
            message: 'SUCCESS', 
            data: {
                userId: user.userId,
                nickName: user.nickname,
                diamonds: user.diamonds,
                gold: user.gold,
                picUrl: user.picUrl || '',
                vip: user.vip
            } 
        });
    } catch (err) {
        return res.status(500).json({
            code: 1, 
            message: 'Server error', 
            data: null
        });
    }
});

router.put('/api/v1/user/info', async (req, res) => {
    const userId = req.headers.userid;
    const details = req.body.details;
    
    const user = await User.findOne({ userId });
    
    if (!user) {
            return res.status(404).json({ 
                code: 1, 
                message: 'User not found', 
                data: null 
            });
    }
    
    user.introduction = details;
    await user.save();
    
    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        details: user.introduction,
        diamonds: user.diamonds,
        golds: user.gold,
        picUrl: user.picUrl || '',
        email: user.email || '',
        friendRequests: user.friendRequests,
        friends: user.friends,
        verifyTime: user.verifyTime,
        test: user.test,
        verifyCode: user.verifyCode,
        signInDays: user.signInDays,
        dressing: user.dressing || '',
        hasPassword: true,
        stopToTime: null
    };

    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});

function generateDeviceId() {
  return crypto.randomBytes(16).toString('hex'); // 32-char hex string
}

// Route: Update deviceId and signature
router.put('/api/v1/user/device/id', async (req, res) => {
  const userId = req.headers['userid'];
  const { deviceId, signature } = req.body;

  if (!userId) {
    return res.status(400).json({ code: 0, message: 'userId not provided in headers' });
  }

  if (!deviceId || !signature) {
    return res.status(400).json({ code: 0, message: 'deviceId or signature not provided in body' });
  }

  try {
    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ code: 0, message: 'User data not found' });
    }

    user.deviceId = deviceId;
    user.signature = signature;
    await user.save();

    return res.status(200).json({ code: 1, message: 'SUCCESS', data: null });
  } catch (error) {
    return res.status(500).json({ code: 0, message: 'Server error' });
  }
});

// Route: Generate random deviceId
router.get('/api/v1/generate/deviceid', (req, res) => {
  const newDeviceId = generateDeviceId();
  res.json({ code: 1, message: 'SUCCESS', deviceId: newDeviceId });
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/api/v1/user/file', upload.single('file'), async (req, res) => {
  const { fileName, fileType, clanFile } = req.query;
  const userId = req.headers['userid'];
  const isClanFile = clanFile === 'true';

  if (!fileName || !fileType) {
    return res.status(400).send('File name and type must be provided.');
  }

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
  if (!allowedTypes.includes(fileType.toLowerCase())) {
    return res.status(400).send(`Unsupported file type: ${fileType}.`);
  }

  try {
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ code: 0, message: 'User not found' });
    }

    // Convert to base64 if you want to store the image directly in MongoDB (optional)
    const base64Image = req.file.buffer.toString('base64');
    const fileDataUrl = `data:image/${fileType};base64,${base64Image}`;

    if (isClanFile) {
      user.headPath = fileDataUrl;
    } else {
      user.picUrl = fileDataUrl;
    }

    await user.save();

    return res.status(200).json({
      code: 1,
      message: 'SUCCESS',
      data: {
        file: fileDataUrl
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ code: 0, message: 'Server error' });
  }
});

router.put('/api/v1/user/nickName', async (req, res) => {
    const userId = req.headers.userid;
    const nickName = req.body.nickName;

    const user = await User.findOne({ userId });
    if (!user) {
        return res.status(404).json({ code: 1, message: 'User not found', data: null });
    }
    
    user.nickname = nickName;
    await user.save();

    const userInfo = {
        userId: user.userId,
        sex: user.sex || 2,
        nickName: user.nickname,
        birthday: user.birthday || '',
        diamonds: user.diamonds,
        golds: user.gold,
        picUrl: user.picUrl || '',
        email: user.email || '',
        friendRequests: user.friendRequests,
        friends: user.friends,
        verifyCode: user.verifyCode,
        verifyTime: user.verifyTime,
        signInDays: user.signInDays,
        dressing: user.dressing || '',
        hasPassword: true,
        stopToTime: null
    };

    res.status(200).json({ code: 1, message: 'SUCCESS', data: userInfo });
});


router.get('/activity/api/v1/signIn', (req, res) => {
  const userId = req.get('userId');
  if (!userId) {
    return res.status(400).json({ code: 0, message: 'Missing userId' });
  }

  return res.json({
    code: 1,
    message: 'SUCCESS',
    data: {
      userId,
      getSignInActivity: signInData
    }
  });
});

// POST /api/v1/signIn
router.post('/activity/api/v1/signIn', (req, res) => {
  const userId = req.get('userId');
  const { signInId } = req.body;

  if (!userId) {
    return res.status(400).json({ code: 0, message: 'Missing userId' });
  }

  const rewardEntry = signInData.find(entry => entry.signInId === signInId);
  if (!rewardEntry) {
    return res.status(404).json({ code: 0, message: 'Sign-in ID not found' });
  }

  return res.json({
    code: 1,
    message: 'Signed in successfully',
    data: {
      userId,
      signInId,
      rewards: rewardEntry.signInRewards
    }
  });
});


router.put('/api/v1/user/nickName', async (req, res) => {
  const userId = req.headers.userid;
  const user = await User.findOne({ userId });
  const newNickname = req.query.newName;

  if (!newNickname) {
    return Responses.invalidParameter();
  }

  const isNicknameExists = await User.findOne({ nickname: newNickname });

  if (isNicknameExists) {
    return res.status(200).json({
      code: 1003,
      message: "Nickname is already in use",
      data: null
    });
  }

  if (user.nickname === newNickname) {
    return res.status(200).json({
      code: 3,
      message: "Invalid parameter",
      data: null
    });
  }

  let result = 0;

  if (user.isFreeNickname) {
    user.isFreeNickname = false;
    await user.save();
  } else {
    if (user.diamonds < 50) {
      result = 1;
    } else {
      user.diamonds -= 50;
      await user.save();
    }
  }

  if (result === 1) {
    return res.status(200).json({
      code: 5006,
      message: 'Not enough diamonds or gold',
      data: null
    });
  }

  user.nickname = newNickname;
  await user.save();

  const userInfo = {
    userId: user.userId,
    sex: user.sex || 2,
    nickName: user.nickname,
    birthday: user.birthday || '',
    details: user.introduction,
    diamonds: user.diamonds,
    golds: user.gold,
    picUrl: user.picUrl || '',
    email: user.email || '',
    hasPassword: true,
    stopToTime: null
  };

  res.status(200).json({
    code: 1,
    message: 'SUCCESS',
    data: userInfo
  });
});

router.get('/api/v1/user/nickName/free', async (req, res) => {
  const userId = req.headers.userid;
  const user = await User.findOne({ userId });

  const response = {
    currencyType: 1,
    quantity: 50,
    free: user.isFreeNickname
  };

  res.status(200).json({
    code: 1,
    message: 'SUCCESS',
    data: response
  });
});

module.exports = router;
