const jwt = require("jsonwebtoken");

/**
 * Generates JWT access and refresh tokens for a given user.
 * @param {object} user - The user object, typically from the database.
 * @returns {{accessToken: string, refreshToken: string}} An object containing the access and refresh tokens.
 */
const generateTokens = (user) => {
  const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
  });
  const refreshToken = jwt.sign({ id: user._id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });
  return { accessToken, refreshToken };
};

module.exports = { generateTokens };
