const mongoose = require('mongoose');
const ProductModel = require('../models/product');
const UserModel = require('../models/user');
const uuid = require('uuid');

const ProductService = {
  getProducts: async (sex, typeOfClothing, cursor) => {
    const limit = 10;
    let hasNextPage = false;
    let products;
    let cursorQuery = {};

    if (sex && !typeOfClothing) {
      products = await ProductModel.find({ sex })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }
    if (sex && typeOfClothing) {
      products = await ProductModel.find({ sex, typeOfClothing })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }
    if (sex && typeOfClothing && cursor) {
      products = await ProductModel.find({ sex, typeOfClothing, _id: { $lt: cursor } })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }
    if (sex && !typeOfClothing && cursor) {
      products = await ProductModel.find({ sex, _id: { $lt: cursor } })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }
    if (!sex && typeOfClothing) {
      products = await ProductModel.find({ typeOfClothing })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }
    if (!sex && typeOfClothing && cursor) {
      products = await ProductModel.find({ typeOfClothing, _id: { $lt: cursor } })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }

    if (!sex && !typeOfClothing && cursor) {
      products = await ProductModel.find({ _id: { $lt: cursor } })
        .sort({ _id: -1 })
        .limit(limit + 1);
    }

    if (!sex && !typeOfClothing && !cursor) {
      products = await ProductModel.find()
        .sort({ _id: -1 })
        .limit(limit + 1);
    }

    if (products.length > limit) {
      hasNextPage = true;
      products = products.slice(0, -1);
    }

    const newCursor = products[products.length - 1]._id;

    return {
      products,
      cursor: newCursor,
      hasNextPage,
    };
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
    let product = await ProductModel.findById(id);
    return await UserModel.findByIdAndUpdate(
      user.id,
      {
        $push: {
          cart: {
            id: uuid.v4(),
            title: product.title,
            images: product.images,
            price: product.price,
            sizes: product.sizes,
          },
        },
      },
      {
        new: true,
      },
    );
  },
  deleteToCart: async (id, user) => {
    return await UserModel.findByIdAndUpdate(
      user.id,
      {
        $pull: {
          cart: { id },
        },
      },
      {
        new: true,
      },
    );
  },
};

module.exports = ProductService;
