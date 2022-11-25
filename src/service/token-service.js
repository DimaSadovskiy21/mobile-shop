require('dotenv').config();
const jwt = require('jsonwebtoken');
const TokenModel = require('../models/token');
const TokenService = {
  generateTokens: (payload) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '30m' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
    return {
      accessToken,
      refreshToken,
    };
  },

  validateAccessToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    } catch (e) {
      return null;
    }
  },

  validateRefreshToken: (token) => {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch (e) {
      return null;
    }
  },

  saveToken: async (userId, refreshToken) => {
    const tokenData = await TokenModel.findOne({ user: userId });
    if (tokenData) {
      tokenData.refreshToken = refreshToken;
      return tokenData.save();
    }
    return await TokenModel.create({ user: userId, refreshToken });
  },

  removeToken: async (refreshToken) => {
    return await TokenModel.deleteOne({ refreshToken });
  },
  findToken: async (refreshToken) => {
    return await TokenModel.findOne({ refreshToken });
  },
};

module.exports = TokenService;
