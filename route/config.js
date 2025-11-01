const express = require('express');
const path = require('path');
const router = express.Router();
const bodyParser = require('body-parser'); // Require body-parser

router.use(bodyParser.json()); // Middleware to parse JSON requests

const updateJson = require('../config/update');
const blockmodsJson = require('../config/blockmods-v1');
const bannerJson = require('../config/blockymods-banner');
const clanJson = require('../config/blockymods-tribe-introduction');

router.get('/files/blockymods-check-version', (req, res) => {
    res.json(updateJson);
});

router.get('/api/v1/treasure/chest', (req, res) => {
    res.json(updateJson);
});

router.get('/files/blockmods-config', (req, res) => {
    res.json(blockmodsJson);
});

router.get('/files/blockymods-banner', (req, res) => {
    res.json(bannerJson);
});

router.get('/api/v1/first/punch/reward', (req, res) => {
    return res.status(200).json({
        code: 1,
        message: 'SUCCESS',
        data: {}
    });
});


router.get('/files/blockymods-tribe-introduction', (req, res) => {
    const introductionData = [
        {
            "image": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_default.png",
            "image_zh": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_default.png",
            "title": "Get exclusive avatars",
            "title_zh": "获取免费装扮"
        },
        {
            "image": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_one.png",
            "image_zh": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_one.png",
            "title": "Find friends who share the same interest",
            "title_zh": "寻找志同道合的朋友"
        },
        {
            "image": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_two.png",
            "image_zh": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_two_zh.png",
            "title": "Talk with your friends at any time",
            "title_zh": "随时与您的朋友交谈"
        },
        {
            "image": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_three.png",
            "image_zh": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_three.png",
            "title": "Fight for the honor of the clan",
            "title_zh": "为部落而战"
        },
        {
            "image": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_four.png",
            "image_zh": "http://static.sandboxol.com/sandbox/activity/banner/bg_banner_tribe_four.png",
            "title": "More games such as clan war will come soon",
            "title_zh": "部落战争游戏即将推出"
        }
    ];

    res.json({
        code: 1,
        message: "SUCCESS",
        data: introductionData
    });
});

module.exports = router;