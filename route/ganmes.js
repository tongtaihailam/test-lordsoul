const express = require('express');
const path = require('path');
const router = express.Router();

const gamesJson = require('../config/games');
const announcement = require('../config/announcement');
const stopAnnouncementJson = require('../config/stop-announcement');

const app = express();

app.use('/static', express.static(path.join(__dirname, 'static')));

router.get('/api/v1/games/announcement/info', (req, res) => {
    res.status(200).json({ code: 1, message: 'SUCCESS', data: announcement });
});

router.get('/api/v1/games/stop/announcement/info', (req, res) => {
    res.status(200).json({ code: 1, message: 'SUCCESS', data: stopAnnouncementJson });
});

router.get('/api/v1/games', async (req, res) => {
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

router.get('/api/v1/games/recommendation/type/info', async (req, res) => {
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

router.get('/api/v1/games/recommendation/type', async (req, res) => {
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

// Made for v2

router.get('/api/v2/games/recommendation/type', (req, res) => {
  res.status(200).json([
    {
      "gameId": "g1003",
      "gameTitle": "Bed Wars",
      "gameCoverPic": "https://static-hatcoins.vercel.app/gamesimg/bedwar_cover.png",
      "visitorEnter": 1931,
      "praiseNumber": 472242,
      "gameTypes": ["SIM", "AVG"]
    },
    {
      "gameId": "g1004",
      "gameTitle": "Jail Break",
      "gameCoverPic": "https://static-hatcoins.vercel.app/gamesimg/jailbreak.png",
      "visitorEnter": 132,
      "praiseNumber": 46623,
      "gameTypes": ["RP", "ACT"]
    },
    {
      "gameId": "g1005",
      "gameTitle": "Build Battle",
      "gameCoverPic": "https://static-hatcoins.vercel.app/gamesimg/build-battle.png",
      "visitorEnter": 424,
      "praiseNumber": 13212,
      "gameTypes": ["ADV"]
    },
    {
      "gameId": "g1006",
      "gameTitle": "Lucky Block Skywars",
      "gameCoverPic": "https://static-hatcoins.vercel.app/gamesimg/skywar.png",
      "visitorEnter": 524,
      "praiseNumber": 27372,
      "gameTypes": ["ACT", "ADV"]
    }
  ]);
});

router.get('/api/v2/games/recommendation/type/info', async (req, res) => {
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

router.get('/api/v2/games/:gameId', async (req, res) => {
  res.status(200).json({
    code: 1,
    message: "SUCCESS",
    data: {
      gameId: "g1008",
      gameTitle: "Bed Wars",
      bannerPic: ["http://static.sandboxol.com/sandbox/games/images/g1008-1597204672185.png"],
      gameDetail: "This is a PVP game with 4 players in each team. Players need to protect their own beds from enemies while trying to destroy their beds. Once the enemies are all defeated you have your final victory.\nCollect silver, golds, emeralds and diamonds to buy better equipment and props, which will make your team stronger!",
      praiseNumber: 0.0,
      gameCoverPic: "http://staticgs.sandboxol.com/sandbox/games/images/g1008-1684547322902.png",
      gameCoverPicOne: "none",
      gameCoverPicFour: "none",
      loadingPic: "none",
      gameTypes: ["Action"],
      tags: [],
      isPublish: 1,
      visitorEnter: 0,
      version: 0,
      engineVersion: 0,
      warmUpResponse: {
        gameId: "g1008",
        gameTitle: "Bed Wars",
        gameCoverPic: "http://staticgs.sandboxol.com/sandbox/games/images/g1008-1684547322902.png",
        bannerPic: ["http://static.sandboxol.com/sandbox/games/images/g1008-1597204672185.png"],
        gameDetail: "This is a PVP game with 4 players in each team. Players need to protect their own beds from enemies while trying to destroy their beds. Once the enemies are all defeated you have your final victory.\nCollect silver, golds, emeralds and diamonds to buy better equipment and props, which will make your team stronger!",
        isPublish: 1,
        images: [
          "http://static.sandboxol.com/sandbox/games/images/g1008.图片2.1554886456475.png",
          "http://static.sandboxol.com/sandbox/games/images/g1008.图片1.1554886456434.png",
          "http://static.sandboxol.com/sandbox/games/images/g1008.图片3.1554886456989.png"
        ],
        featuredPlay: [
          {
            id: 24470,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.1.1554886607696.png",
            describe: "1. The iron forge can produce resources that you and your teammate can use."
          },
          {
            id: 24471,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.2.1554887054892.png",
            describe: "2. Only pickaxe, axe, and scissors can destroy enemies' beds. The team without bed cannot respawn."
          },
          {
            id: 24472,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.3.1554887176683.png",
            describe: "3. You can buy props with silvers, golds and emeralds in the store."
          },
          {
            id: 24473,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.4.1554887325064.png",
            describe: "4. Upgrading equipment at the store will cost diamonds."
          },
          {
            id: 24474,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.5.1554887396671.png",
            describe: "5. There are some advanced props and privilege in the Bcubes store."
          },
          {
            id: 24475,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.6.1554887472320.png",
            describe: "6. Sponge can absorb all water."
          },
          {
            id: 24476,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.7.1554887506888.png",
            describe: "7. Obsidian can only be destroyed by diamond pickaxes."
          },
          {
            id: 24477,
            picUrl: "http://static.sandboxol.com/sandbox/games/images/g1008.8.1554887532771.png",
            describe: "8. Eating the gold apple can help you restore HP and get extra HP for only a while."
          }
        ]
      },
      isShopOnline: 1,
      isRankOnline: 1,
      isNewEngine: 0,
      isUgcGame: 0,
      gameUgcType: "unknown",
      isOpenParty: 1,
      partyMaxMembers: 4,
      gamePayInfo: "none",
      isPay: 0,
      turntableStatus: 1,
      turntableRemainCount: 0,
      gameBannerVideoInfos: [
        {
          id: 1732,
          titles: {
            zh_TW: "点击加入 BedWars 的 Discord 服务器！",
            en_US: "Click to join BedWars’s Discord server",
            zh_CN: "点击加入 BedWars 的 Discord 服务器"
          },
          image: "http://staticgs.sandboxol.com/sandbox/games/images/g1008-1706688542955.png",
          url: "https://discord.gg/r7X8rmhRAY",
          version: 0,
          sort: 0,
          webview: true,
          fullScreen: false,
          test: false,
          inside: true
        },
        {
          id: 1713,
          titles: {},
          image: "http://staticgs.sandboxol.com/sandbox/games/images/g1008-1680592718962.png",
          url: "https://www.youtube.com/embed/AuZJzu8mjNs?si=MLuQh4B2yblM5Lov",
          version: 0,
          sort: 1,
          webview: true,
          fullScreen: false,
          test: false,
          inside: false
        }
      ],
      realPlayGameList: [
        {
          gameId: "g1008",
          gameName: "Bed Wars"
        }
      ],
      latestResVersions: "none",
      isHall: 1,
      isFastStart: 1,
      ugcTestFlag: 0,
      iosOnline: 1,
      ramUserWhiteList: "",
      startParams: "none",
      isVipPrivilegeGame: 0,
      isSvipPrivilegeGame: 0,
      vipPrivilegeDesc: "none",
      svipPrivilegeDesc: "none",
      engineType: 1,
      authorInfo: {
        teamId: 6823,
        userId: 288,
        nickName: "Test",
        headPic: "https://cdn.discordapp.com/avatars/1094920973611958343/e24b3edc386a967df1fee0e46ceea708.webp?size=2048",
        isTeam: 1,
        isAddFriend: 1
      },
      showEditTools: false,
      appreciate: false,
      newPlayer: true
    },
    other: "none"
  });
});

module.exports = router;
