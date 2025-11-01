const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

const counterSchema = new mongoose.Schema({
    name: { type: String, default: 'clanId' },
    seq: { type: Number, default: 1 }
});

// Define the Clan schema
const ClanSchema = new mongoose.Schema({
  clanId: mongoose.Schema.Types.ObjectId,  // ObjectId for the clan
  name: String,
  details: String,
  tags: [String],
  level: Number,
  experience: Number,
  chiefId: String,  // UserId of the clan's chief
  chiefNickName: String,
  headPic: String,
  members: [{
    userId: String, 
    nickName: String,
    role: Number,  // Roles: 20 = Chief, 10 = Elder, 0 = Member
    sex: String,
    experience: Number,
    currency: Number,
    headPic: String,
  }]
}, { timestamps: true });

// Create the Clan model

// Create the Clan model
const Clan = mongoose.model('Clan', ClanSchema);
const User = mongoose.model('User');

module.exports = Clan;

// Role Definitions:
// Chief: 20
// Elder: 10
// Member: 0

router.get('/api/v1/clan/tribe/recommendation', async (req, res) => {
  const recommendedClans = await Clan.find({}, 'clanId name headPic level chiefId chiefNickName details members')
    .limit(10)
    .lean();

  if (!recommendedClans.length) {
    return res.status(200).json({ code: 1, message: 'SUCCESS', data: [] });
  }

  const formattedClans = recommendedClans.map(clan => ({
    clanId: clan.clanId,
    name: clan.name,
    headPic: clan.headPic,
    level: clan.level,
    chiefId: clan.chiefId,
    chiefNickName: clan.chiefNickName,
    detail: clan.details,
    currentCount: clan.members.length,
    maxCount: 40
  }));

  return res.status(200).json({ code: 1, message: 'SUCCESS', data: formattedClans });
});

const generateClanId = async () => {
    const counter = await ClanCounter.findOneAndUpdate(
        { name: 'clanId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );
    return counter.seq;
};

router.post('/clan/api/v1/clan/tribe', async (req, res) => {
    try {
        console.log('[CreateClan] Request received:', req.body);
        const { details, name, tags, level = 1, experience = 0 } = req.body;
        const userId = req.headers.userid;

        if (!userId) {
            console.warn('[CreateClan] Missing userId in headers');
            return res.status(400).json({ code: 0, message: 'userId not provided in headers' });
        }

        if (!name) {
            console.warn('[CreateClan] Missing required fields in body');
            return res.status(400).json({ code: 0, message: 'Required fields are missing' });
        }

        const user = await User.findOne({ userId });
        if (!user) {
            console.warn(`[CreateClan] User not found for userId: ${userId}`);
            return res.status(404).json({ code: 0, message: 'User not found' });
        }

        console.log(`[CreateClan] Found user: ${user.nickName} (userId: ${userId})`);

        const coinCost = 8000;
        const diamondCost = 60;
        let currencyType, price, amountNeeded;

        if (user.gold >= coinCost) {
            currencyType = 2;
            price = coinCost;
        } else if (user.diamonds >= diamondCost) {
            currencyType = 1;
            price = diamondCost;
        } else {
            amountNeeded = {
                goldNeeded: Math.max(coinCost - user.gold, 0),
                diamondNeeded: Math.max(diamondCost - user.diamonds, 0)
            };
            console.warn(`[CreateClan] Insufficient funds for userId: ${userId}`, amountNeeded);
            return res.status(200).json({ code: 5006, message: 'Insufficient gold or diamonds to create a clan', data: amountNeeded });
        }

        console.log(`[CreateClan] User will pay with ${currencyType === 1 ? 'diamonds' : 'gold'}: ${price}`);

        if (currencyType === 1) {
            user.diamonds -= price;
        } else {
            user.gold -= price;
        }

        const clanId = await generateClanId();
        console.log(`[CreateClan] Generated clanId: ${clanId}`);

        const newClan = new Clan({
            clanId,
            clanName: name,
            details,
            tags,
            level,
            experience,
            chiefId: userId,
            chiefNickName: user.nickName,
            headPic: user.picPath,
            members: [{
                userId: user.userId,
                headPic: user.picPath,
                nickName: user.nickName,
                role: 20,
                sex: user.sex,
                experience: user.experience,
                currency: currencyType
            }]
        });

        user.clanId = clanId;
        user.clanName = name;

        await Promise.all([
            newClan.save(),
            user.save()
        ]);

        console.log(`[CreateClan] Clan created successfully: ${name} (${clanId})`);

        res.json({
            code: 1,
            message: 'SUCCESS',
            data: {
                ClanId: clanId,
                ClanName: name,
                ClanDetails: details
            }
        });

    } catch (error) {
        console.error('[CreateClan] Error:', error);
        res.status(500).json({ code: 0, message: 'Internal server error' });
    }
});


// Assuming the clanId is an ObjectId


module.exports = router;