const mongoose = require('mongoose');
const ProductModel = require('../models/product');

const ProductService = {
  getProducts: async () => {
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
};

module.exports = ProductService;
