const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const router = express.Router(); 

const shopDressingSchema = new mongoose.Schema({
  id: Number,
  typeId: Number,
  camera: String,
  name: String,
  iconUrl: String,
  resourceId: String,
  details: String,
  price: Number,
  currency: Number,
  sex: { type: Number, default: 0 }
});

const ShopDressing = mongoose.model('ShopDressing', shopDressingSchema);

const User = mongoose.model('User');

const DressingOwned = mongoose.model('DressingOwned');

router.put('/api/v1/shop/decorations/buy', async (req, res) => {
    const userId = req.headers['userid'];
    const decorationIds = req.query.decorationId;
    
    let decorationInfo = null;

    decorationInfo = await ShopDressing.findOne({ id: decorationIds });

    if (!decorationInfo) {
        return res.status(200).json({ code: 5002, message: 'Decoration not found with the provided decorationIds', data: null });
    }

    const userInfo = await User.findOne({ userId });

    if (decorationInfo.sex !== 0 && decorationInfo.sex !== userInfo.sex) {
        return res.status(200).json({
            code: 5003,
            message: `This decoration is not available for your gender`,
            data: null
        });
    }

    const existingAvatar = await DressingOwned.findOne({ forId: userId, resourceId: decorationInfo.resourceId });
    if (existingAvatar) {
        return res.status(200).json({ code: 5008, message: 'Item already exists', data: null });
    }

    let amountNeeded;
    if (decorationInfo.currency === 1) {
        amountNeeded = decorationInfo.price - userInfo.diamonds;
        if (amountNeeded > 0) {
            return res.status(200).json({ code: 5006, message: 'Insufficient diamonds to buy', data: { amountNeeded } });
        }
        userInfo.diamonds -= decorationInfo.price;
    } else {
        amountNeeded = decorationInfo.price - userInfo.gold;
        if (amountNeeded > 0) {
            return res.status(200).json({ code: 5006, message: 'Insufficient gold to buy', data: { amountNeeded } });
        }
        userInfo.gold -= decorationInfo.price;
    }

    await userInfo.save();

    const avatarData = {
        id: decorationInfo.id,
        typeId: decorationInfo.typeId,
        name: decorationInfo.name,
        iconUrl: decorationInfo.iconUrl,
        camera: decorationInfo.camera,
        resourceId: decorationInfo.resourceId,
        details: decorationInfo.details,
        price: decorationInfo.price,
        currency: decorationInfo.currency,
        forId: userId
    };

    const avatarInstance = new DressingOwned(avatarData);
    await avatarInstance.save();

    res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {
            diamondsNeed: 0,
            goldsNeed: 0,
            clothVoucherNeed: 0,
            decorationPurchaseStatus: {
                [decorationIds]: true
            },
            suitPurchaseStatus: null,
            needShowAds: false
        },
        other: null
    });
});

router.get('/api/v1/shop/decorations/:typeId', async (req, res) => {
  const userId = req.headers['userid'];
  const { typeId } = req.params;

  const dressesCategory = {
    "1": [8, 9, 10],
    "2": [2],
    "3": [11, 13, 14, 15],
    "4": [3],
    "5": [4],
    "6": [5],
    "7": [6]
  };

  const categories = dressesCategory[typeId];

  if (!categories) {
    return res.status(400).json({ code: 0, message: 'Invalid category ID', data: null });
  }

  const avatars = await ShopDressing.find({ typeId: { $in: categories } });

  avatars.sort((a, b) => {
    if (a.camera === 'top' && b.camera === 'bottom') return -1;
    if (a.camera === 'bottom' && b.camera === 'top') return 1;
    if (a.name.includes('shoes') && !b.name.includes('shoes')) return 1;
    if (!a.name.includes('shoes') && b.name.includes('shoes')) return -1;
    return 0;
  });

  const userInfo = await User.findOne({ userId });

  const purchasedDecorations = await DressingOwned.find({ forId: userId });
  const purchasedMap = new Map(purchasedDecorations.map(p => [p.resourceId, 1]));

  const responseData = avatars.map(avatar => {
    if (avatar.sex !== 0 && avatar.sex !== userInfo.sex) {
      return null;
    }

    return {
      id: avatar.id,
      typeId: avatar.typeId,
      camera: avatar.camera,
      name: avatar.name,
      iconUrl: avatar.iconUrl,
      resourceId: avatar.resourceId,
      details: avatar.details,
      price: avatar.price,
      currency: avatar.currency,
      gender: avatar.sex,
      hasPurchase: purchasedMap.has(avatar.resourceId) ? 1 : 0
    };
  }).filter(avatar => avatar !== null);

  res.json({ code: 1, message: 'SUCCESS', data: responseData });
});

module.exports = router;