const UserModel = require('../models/user');
const bcrypt = require('bcrypt');
const uuid = require('uuid');
const TokenService = require('./token-service');
const UserDto = require('../dtos/user-dto');
const mailService = require('./mail.service');
const ApiError = require('../exceptions/api-error');
const ProductModel = require('../models/product');

const getUserDto = async (user) => {
  const userDto = UserDto(user);
  const tokens = TokenService.generateTokens({ ...userDto });
  await TokenService.saveToken(userDto.id, tokens.refreshToken);

  return {
    ...tokens,
    user: userDto,
  };
};

const UserService = {
  signUp: async (username, email, password, secretWord, avatar, roles = []) => {
    const candidate = await UserModel.findOne({ email });
    if (candidate) {
      throw ApiError.BadRequest(`User with this email: ${email} already exists.`);
    }

    const hashed = await bcrypt.hash(password, 10);
    const hashedSecret = await bcrypt.hash(secretWord, 10);
    const activationLink = uuid.v4();

    const user = await UserModel.create({
      username,
      email,
      password: hashed,
      secretWord: hashedSecret,
      avatar,
      roles,
      activationLink,
    });
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`,
    );
    return getUserDto(user);
  },

  activate: async (activationLink) => {
    const user = await UserModel.findOne({ activationLink });
    if (!user) {
      throw ApiError.BadRequest('Incorrect activation link.');
    }
    user.isActivated = true;
    await user.save();
  },

  signIn: async (email, username, password) => {
    const user = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      throw ApiError.BadRequest('User not found.');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw ApiError.BadRequest('Invalid password.');
    }
    return getUserDto(user);
  },

  refreshPassword: async (email, username, password, secretWord) => {
    const user = await UserModel.findOne({
      $or: [{ email }, { username }],
    });
    if (!user) {
      throw ApiError.BadRequest('User not found.');
    }
    const valid = await bcrypt.compare(secretWord, user.secretWord);
    if (!valid) {
      throw ApiError.BadRequest('Invalid secret word.');
    }
    const hashed = await bcrypt.hash(password, 10);
    await UserModel.findOneAndUpdate(
      {
        _id: user._id,
      },
      {
        $set: {
          password: hashed,
        },
      },
      {
        new: true,
      },
    );
    return getUserDto(user);
  },

  logout: async (refreshToken) => {
    const token = await TokenService.removeToken(refreshToken);
    return token;
  },

  refresh: async (refreshToken) => {
    if (!refreshToken) {
      throw ApiError.UnauthorizedError();
    }
    const userData = TokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await TokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorizedError();
    }

    const user = await UserModel.findById(userData.id);
    return getUserDto(user);
  },

  getAllUsers: async () => {
    return await UserModel.find();
  },

  me: async (id) => {
    return await UserModel.findById(id);
  },

  favorites: async (user) => {
    return await ProductModel.find({ favoritedBy: user.id }).sort({ _id: -1 });
  },
};

module.exports = UserService;
