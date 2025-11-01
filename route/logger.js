// logger.js
module.exports = (req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
};