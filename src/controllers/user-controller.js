const UserService = require('../service/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');

const getUserData = (response, userData) => {
  response.cookie('refreshToken', userData.refreshToken, {
    maxAge: 30 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  });
  return response.json(userData);
};

const UserController = {
  signUp: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('validation error', errors.array()));
      }
      const { username, email, password, secretWord, avatar, roles } = req.body;
      const userData = await UserService.signUp(
        username,
        email,
        password,
        secretWord,
        avatar,
        roles,
      );
      getUserData(res, userData);
    } catch (e) {
      next(e);
    }
  },

  signIn: async (req, res, next) => {
    try {
      const { email, username, password } = req.body;
      const userData = await UserService.signIn(email, username, password);
      getUserData(res, userData);
    } catch (e) {
      next(e);
    }
  },

  refreshPassword: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(ApiError.BadRequest('validation error', errors.array()));
      }
      const { email, username, password, secretWord } = req.body;
      const userData = await UserService.refreshPassword(email, username, password, secretWord);
      getUserData(res, userData);
    } catch (e) {
      next(e);
    }
  },

  logout: async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      const token = await UserService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return res.json(token);
    } catch (e) {
      next(e);
    }
  },

  activate: async (req, res, next) => {
    try {
      const activationLink = req.params.link;
      await UserService.activate(activationLink);
      return res.redirect(process.env.CLIENT_URL);
    } catch (e) {
      next(e);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const { refreshToken } = req.cookies;
      const userData = await UserService.refresh(refreshToken);
      getUserData(res, userData);
    } catch (e) {
      next(e);
    }
  },

  getUsers: async (req, res, next) => {
    try {
      const users = await UserService.getAllUsers();
      return res.json(users);
    } catch (e) {
      next(e);
    }
  },
  me: async (req, res, next) => {
    try {
      const { id } = req.user;
      const me = await UserService.me(id);
      return res.json(me);
    } catch {
      next(e);
    }
  },
};

module.exports = UserController;
