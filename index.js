const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const configRouter = require('./route/config');
const userRouter = require('./route/user');
const gamesRouter = require('./route/games');
const decorationRouter = require('./route/decoration');
const mailboxRouter = require('./route/mailbox');
const shopRouter = require('./route/shop');
const groupRouter = require('./route/group');
const clanRouter = require('./route/clan');
const friendRouter = require('./route/friend');
const emailRouter = require('./route/email');
const loggerRouter = require('./route/logger');
// const dispatchRouter = require('./route/dispatch');

const databaseConfig = require('./config/database');

const app = express();
const port = 3000;

mongoose.connect(databaseConfig.databaseUrl)
  .then(() => {
    console.log(`You are connected to ${databaseConfig.databaseType} `);
  })
  .catch((error) => {
    console.log('You have been not connected to MongoDb. Reason:', error);
  });

app.use(express.json());

app.use('/config', configRouter);
app.use('/user', userRouter);
app.use('/games', gamesRouter);
app.use('/decoration', decorationRouter);
app.use('/shop', shopRouter);
app.use('/mailbox', mailboxRouter);
app.use('/group', groupRouter);
app.use('/clan', clanRouter);
app.use('/friend', friendRouter);
app.use('/email', emailRouter);
app.use('logger', loggerRouter);
// app.use('/dispatch', dispatchRouter);

app.all('/', (req, res) => {
  res.status(200).send('BlockMan Online Dispatch');
});

app.listen(port, () => {
  const colors = ['\x1b[31m', '\x1b[33m', '\x1b[32m', '\x1b[36m', '\x1b[34m', '\x1b[35m', '\x1b[37m'];
const reset = '\x1b[0m';  // Reset color to default

// First message
const message1 = `Connected at localhost:${port}`;
let coloredMessage1 = '';

for (let i = 0; i < message1.length; i++) {
  coloredMessage1 += colors[i % colors.length] + message1[i];
}

console.log(coloredMessage1 + reset);

// Second message
const message2 = 'Dispatch have been Connected Successful!';
let coloredMessage2 = '';

for (let i = 0; i < message2.length; i++) {
  coloredMessage2 += colors[i % colors.length] + message2[i];
}

console.log(coloredMessage2 + reset);

  console.log("\x1b[31m All Files have been Successfuly Loaded");
  console.log("\x1b[31mAll credits to The Leakers!\x1b[0m");
});


app.use((req, res, next) => {
  const method = req.method;
  const url = req.url;

  // ANSI color codes
  const colors = {
    GET: '\x1b[36m',   // Cyan
    POST: '\x1b[31m',  // Red
    PUT: '\x1b[34m',   // Blue
  };

  const reset = '\x1b[0m'; // Reset color

  const color = colors[method] || '';

  console.log(`[API] ${color}${method}${reset} ${url}`);
  next();
});