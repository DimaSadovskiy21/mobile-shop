const ProductModel = require('../models/product');

const ProductService = {
  getProducts: async () => {
    return await ProductModel.find();
  },

  getProduct: async (id) => {
    return await ProductModel.findById(id);
  },

  newProduct: async (title, images, price, sizes, description) => {
    const product = await ProductModel.create({
      title,
      images,
      price,
      sizes,
      description,
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
  updateProduct: async (id, title, images, price, sizes, description) => {
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
        },
      },
      {
        new: true,
      },
    );
    return product;
  },
};

module.exports = ProductService;
