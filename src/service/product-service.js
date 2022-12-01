const mongoose = require('mongoose');
const ProductModel = require('../models/product');
const UserModel = require('../models/user');

const ProductService = {
  getProducts: async (sex, typeOfClothing) => {
    if (sex && !typeOfClothing) {
      return await ProductModel.find({ sex });
    }
    if (!sex && typeOfClothing) {
      return await ProductModel.find({ typeOfClothing });
    }
    if (sex && typeOfClothing) {
      return await ProductModel.find({ sex, typeOfClothing });
    }
    return await ProductModel.find();
  },

  getProduct: async (id) => {
    return await ProductModel.findById(id);
  },

  newProduct: async (title, images, price, sizes, description, sex, typeOfClothing) => {
    const product = await ProductModel.create({
      title,
      images,
      price,
      sizes,
      description,
      sex,
      typeOfClothing,
    });
    return product;
  },
  deleteProduct: async (id) => {
    const product = await ProductModel.findById(id);
    try {
      await product.remove();
      return true;
    } catch (err) {
      return false;
    }
  },
  updateProduct: async (id, title, images, price, sizes, description, sex, typeOfClothing) => {
    const product = await ProductModel.findOneAndUpdate(
      {
        _id: id,
      },
      {
        $set: {
          title,
          images,
          price,
          sizes,
          description,
          sex,
          typeOfClothing,
        },
      },
      {
        new: true,
      },
    );
    return product;
  },
  toggleFavorite: async (id, user) => {
    let productCheck = await ProductModel.findById(id);
    const hasUser = productCheck.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      await UserModel.findByIdAndUpdate(
        user.id,
        {
          $pull: {
            favorites: mongoose.Types.ObjectId(id),
          },
        },
        {
          new: true,
        },
      );
      return await ProductModel.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: -1,
          },
        },
        {
          new: true,
        },
      );
    } else {
      await UserModel.findByIdAndUpdate(
        user.id,
        {
          $push: {
            favorites: mongoose.Types.ObjectId(id),
          },
        },
        {
          new: true,
        },
      );
      return await ProductModel.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id),
          },
          $inc: {
            favoriteCount: 1,
          },
        },
        {
          new: true,
        },
      );
    }
  },
  addToCart: async (id, user) => {
    await UserModel.findByIdAndUpdate(
      user.id,
      {
        $push: {
          cart: mongoose.Types.ObjectId(id),
        },
      },
      {
        new: true,
      },
    );

    return await ProductModel.findByIdAndUpdate(
      id,
      {
        $push: {
          addedBy: mongoose.Types.ObjectId(user.id),
        },
      },
      {
        new: true,
      },
    );
  },
  deleteToCart: async (id, user) => {
    await UserModel.findByIdAndUpdate(
      user.id,
      {
        $pull: {
          cart: mongoose.Types.ObjectId(id),
        },
      },
      {
        new: true,
      },
    );
    return await ProductModel.findByIdAndUpdate(
      id,
      {
        $pull: {
          addedBy: mongoose.Types.ObjectId(user.id),
        },
      },
      {
        new: true,
      },
    );
  },
};

module.exports = ProductService;
