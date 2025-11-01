const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const uuser = mongoose.model('User');


router.get('/api/v1/friends/recommendation', async (req, res) => {
    const currentUser = req.headers.userid;
    const currentUserData = uuser.findOne({ currentUser });
    const users = await uuser.find({ userId: { $ne: currentUser } }).select('userId sex nickname');

    // Transform the nickname field to nickName in the response
    const formattedUsers = users.map(user => ({
      userId: user.userId,
      sex: user.sex,
      nickName: user.nickname,
    }));
    res.status(200).json({ code: 1, message: 'SUCCESS', data: formattedUsers });
});

router.get('/api/v1/friends/info/:nickName', async (req, res) => {
    const nickName = req.params.nickName;
    const users = await uuser.find({
            nickname: { $regex: new RegExp(nickName, 'i') } 
        }).select('userId nickname sex -_id');
        const searchResults = users.map(user => ({
            userId: user.userId,
            nickName: user.nickname,
            sex: user.sex
        }));
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    
        if (pageNo !== 0) {
            return res.status(200).json({
                code: 1,
                message: 'SUCCESS',
                data: {
                    pageNo,
                    pageSize,
                    totalPage: 0,
                    totalSize: 0,
                    data: []
                }
            });
        }

        res.status(200).json({
            code: 1,
            message: 'SUCCESS',
            data: {
                pageNo,
                pageSize,
                totalPage: 0,
                totalSize: 0,
                data: searchResults,
                other: null
            }
        });
});


// POST add friend request
router.post('/api/v1/friends', async (req, res) => {
  const userId = req.headers.userid;
  const friendId = req.body.friendId;

  if (!userId || !friendId) return res.status(400).json({ code: 0, message: 'Missing userId or friendId' });

  try {
    const friend = await uuser.findOne({ userId: friendId });
    if (!friend) return res.status(404).json({ code: 0, message: 'Friend user not found' });

    friend.friendRequests = [...(friend.friendRequests || []), userId];
    await friend.save();

    res.json({
      code: 1,
      message: 'SUCCESS',
      data: { friendId, message: 'Friend request sent successfully' }
    });
  } catch (err) {
    console.error('Add friend error:', err);
    res.status(500).json({ code: 0, message: 'Internal Server Error' });
  }
});

router.get('/api/v1/friends/requests', async (req, res) => {
  const userId = req.headers.userid;
  const pageNo = parseInt(req.query.pageNo || 0);
  const pageSize = parseInt(req.query.pageSize || 10);

  if (!userId) return res.status(400).json({ code: 0, message: 'userId not provided in headers' });

  try {
    const user = await uuser.findOne({ userId });
    if (!user) return res.status(404).json({ code: 0, message: 'User not found' });

    const requests = user.friendRequests || [];
    const totalSize = requests.length;
    const totalPage = Math.ceil(totalSize / pageSize);

    const pagedRequests = requests.slice(pageNo * pageSize, (pageNo + 1) * pageSize);
    const responseData = await Promise.all(pagedRequests.map(async friendId => {
      const friend = await uuser.findOne({ userId: friendId });
      if (!friend) return null;
      return {
        userId: friend.userId,
        nickName: friend.nickname || '',
        msg: 'Friend request from ' + userId,
        sex: friend.sex || ''
      };
    }));

    res.json({
      code: 1,
      message: 'SUCCESS',
      data: {
        pageNo,
        pageSize,
        totalPage,
        totalSize,
        data: responseData.filter(Boolean)
      }
    });
  } catch (err) {
    console.error('Friend requests error:', err);
    res.status(500).json({ code: 0, message: 'Internal Server Error' });
  }
});

router.get('/api/v1/friends/info/:userId', async (req, res) => {
  try {
    const friend = await uuser.findOne({ userId: req.params.userId });
    if (!friend) return res.status(404).json({ code: 0, message: 'User not found' });

    res.json({
      code: 1,
      message: 'SUCCESS',
      data: {
        data: [{ nickName: friend.nickName, userId: friend.userId }]
      }
    });
  } catch (err) {
    console.error('Get friend info error:', err);
    res.status(500).json({ code: 0, message: 'Internal Server Error' });
  }
});

router.get('/api/v1/friends/:userId', async (req, res) => {
  try {
    const user = await uuser.findOne({ userId: req.params.userId });
    if (!user) return res.status(404).json({ code: 0, message: 'User data not found' });

    const inviterIds = (user.ClanInvites || []).map(invite => invite.inviterId);

    res.json({
      code: 1,
      message: 'SUCCESS',
      data: {
        inviterIds,
        nickName: user.nickname,
        userId: user.userId,
        sex: user.sex,
        picUrl: user.picUrl,
        clanId: user.clanId,
        clanName: user.clanName
      }
    });
  } catch (err) {
    console.error('Show party error:', err);
    res.status(500).json({ code: 0, message: 'Internal Server Error' });
  }
});

router.get('/api/v1/friends', async (req, res) => {
   userId = req.headers.userid;
  if (!userId) return res.status(400).json({ code: 0, message: 'userId not provided in headers' });

  try {
    const user = await uuser.findOne({ userId });
    if (!user) return res.status(404).json({ code: 0, message: 'User not found' });

    const friendList = (user.friends || []).map(friend => ({
      userId: friend.userId,
      nickName: friend.nickname,
      picUrl: friend.picUrl,
      friend: true
    }));

    res.json({
      code: 1,
      message: 'SUCCESS',
      data: {
        pageNo: 0,
        pageSize: 500,
        totalPage: 1,
        totalSize: friendList.length,
        data: friendList
      }
    });
  } catch (err) {
    console.error('Get friends list error:', err);
    res.status(500).json({ code: 0, message: 'Internal Server Error' });
  }
});


router.put('/api/v1/friends/:friendId/agreement', async (req, res) => {
  const userId = req.headers.userid;
  const friendId = req.params.friendId;

  if (!userId) {
    return res.status(400).json({ code: 0, message: 'userId not provided in headers' });
  }

  if (!friendId) {
    return res.status(400).json({ code: 0, message: 'Friend ID not provided' });
  }

  try {
    const User = mongoose.model('User');

    // Find the user and their friend
    const user = await User.findOne({ userId });
    const friend = await User.findOne({ userId: friendId });

    if (!user) {
      return res.status(404).json({ code: 0, message: 'User not found' });
    }

    if (!friend) {
      return res.status(404).json({ code: 0, message: 'Friend data not found' });
    }

    // Ensure the user has an empty friends array if it doesn't exist
    if (!user.friends) user.friends = [];

    // Check if the friend is already in the list
    const alreadyAdded = user.friends.some(f => f.userId === friendId);
    if (alreadyAdded) {
      return res.status(400).json({ code: 0, message: 'Friend already exists in the user\'s friends list' });
    }

    // Add friend info to the user's friends list
    const friendInfo = {
      userId: friend.userId,
      nickname: friend.nickname || ''
    };

    user.friends.push(friendInfo);

    // Remove the friend request from the user's friendRequests
    if (user.friendRequests) {
      user.friendRequests = user.friendRequests.filter(req => req !== friendId);
    }

    // Save the updated user data
    await user.save();

    res.status(200).json({ code: 1, message: 'Friend added successfully' });

  } catch (err) {
    console.error('Friend agreement error:', err);
    res.status(500).json({ code: 0, message: 'Internal Server Error' });
  }
});

module.exports = router;