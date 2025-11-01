const express = require('express');
const Responses = require("../Responses");
const path = require('path');
const mongoose = require('mongoose');
const { log, startupSequence } = require('../logger');
const logger = require('../logger');
const router = express.Router();
const AssetUtil = require("../AssetUtil");
const axios = require('axios');
const fs = require('fs');

const gameSchema = new mongoose.Schema({
    gameId: String,
    gameTitle: String,
    gameCoverPic: String,
    visitorEnter: Number,
    praiseNumber: Number,
    gameTypes: Array
});

const configSchema = new mongoose.Schema({
    id: Number,
    content: String,
    title: String,
    isShow: Boolean,
    isShowInGame: Boolean,
    updateTime: Number
});

const Game = mongoose.model('games', gameSchema);
const Config = mongoose.model('config', configSchema);
const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));

router.get('/api/v1/games/announcement/info', async (req, res) => {
        const announcementPath = path.join(__dirname, '..', 'static', 'files', 'announcement.json');
        const fileData = fs.readFileSync(announcementPath, 'utf-8');
        const announcement = JSON.parse(fileData);
    
        res.status(200).json({ code: 1, message: 'SUCCESS', data: announcement });
});

router.get('/api/v1/games/stop/announcement/info', async (req, res) => {
    const announcementPath = path.join(__dirname, '..', 'static', 'files', 'stop-announcement.json');
        const fileData = fs.readFileSync(announcementPath, 'utf-8');
        const announcement = JSON.parse(fileData);
    
        res.status(200).json({ code: 1, message: 'SUCCESS', data: announcement });
});

router.get('/api/:version/games/recommendation/type', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const language = "en";
    
    

    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);
    
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
                data: randomGames,
                other: null
            }
        });
});

router.get('/api/v1/games/playlist/recently', async (req, res) => {
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const language = "en";
    
    

    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);
    
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
                data: randomGames,
                other: null
            }
        });
});

router.get('/api/:version/games', async (req, res) => {
    let gamesJson = await Game.find({});
    const pageNo = parseInt(req.query.pageNo) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;
    try {
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
                data: gamesJson,
                other: null
            }
        });
    } catch (error) {
        console.error('Error searching for recommended games:', error);
        res.status(500).json({ message: 'Error searching for recommended games.' });
    }
});

router.get('/api/v1/games/update/list/:userId', async (req, res) => {
    return res.status(200).json({
        code: 4,
        message: "INNER ERROR",
        data: null
    });
});

router.get('/api/v1/games/ugc', async (req, res) => {
    const count = 5;
    const randomGames = await Game.aggregate([{ $sample: { size: count } }]);
    logger.warn("Community games needs implementing! Returning random games....");
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
                data: randomGames,
                other: null
            }
        });
});

router.get('/api/v1/games/ugc/status', async (req, res) => {
    logger.warn("Community games status needs implementing!");
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
                data: null,
                other: null
            }
        });
});

router.get('/api/v2/games/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    gameConfig = {};
    axios.get(`https://static.moonsveil.xyz/appconfigs/lang/games/en/${gameId}.json`)
      .then(response => {
        let gameConfig = response;
      })
      .catch(error => {
        logger.warn(`Axios failed to run to endpoint: /appconfigs/lang/games/en/${gameId}.json`);
    });
    const bannerUrl = `https://static.moonsveil.xyz/game-banners/${gameId}.png`
    return res.status(200).json({ 
        code: 1, 
        message: "SUCCESS", 
        data: {
                
            }
    });
});

router.get('/api/v1/games/app-engine/upgrade', async (req, res) => {
    const gameId = req.query.gameType;
    const engineVersion = req.query.engineVersion;
    
    return res.status(200).json({ code: 1, message: "SUCCESS", data: {
        downloadUrl: AssetUtil.getGameResUrl(gameId) }
    });
});

router.get('/api/v1/games/update/tip/info/app/:gameId', async (req, res) => {
    const gameId = req.params.gameId;
    
    return res.status(200).json({ code: 1, message: "SUCCESS", data: null });
});

module.exports = router;