const ProductService = require('../service/product-service');
const UserModel = require('../models/user');
const ApiError = require('../exceptions/api-error');

const isAdmin = (user) => {
  return user.roles.includes('Admin');
};

const ProductController = {
  getProducts: async (req, res, next) => {
    try {
      const { sex, typeOfClothing, cursor } = req.query;
      const products = await ProductService.getProducts(sex, typeOfClothing, cursor);
      return res.json(products);
    } catch (e) {
      next(e);
    }
  },
  getProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await ProductService.getProduct(id);
      return res.json(product);
    } catch (e) {
      next(e);
    }
  },
  newProduct: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!isAdmin(user)) {
        return next(ApiError.BadRequestForAdmin('create'));
      }
      const { title, images, price, sizes, description, sex, typeOfClothing } = req.body;
      const product = await ProductService.newProduct(
        title,
        images,
        price,
        sizes,
        description,
        sex,
        typeOfClothing,
      );
      return res.json(product);
    } catch (e) {
      next(e);
    }
  },
  deleteProduct: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user.roles.includes('Admin')) {
        return next(ApiError.BadRequestForAdmin('delete'));
      }
      const { id } = req.params;
      const productStatus = await ProductService.deleteProduct(id);
      return res.json(productStatus);
    } catch (e) {
      next(e);
    }
  },
  updateProduct: async (req, res, next) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user.roles.includes('Admin')) {
        return next(ApiError.BadRequestForAdmin('update'));
      }
      const { id, title, images, price, sizes, description, sex, typeOfClothing } = req.body;
      const product = await ProductService.updateProduct(
        id,
        title,
        images,
        price,
        sizes,
        description,
        sex,
        typeOfClothing,
      );
      return res.json(product);
    } catch (e) {
      next(e);
    }
  },
  toggleFavorite: async (req, res, next) => {
    try {
      const { id } = req.body;
      const product = await ProductService.toggleFavorite(id, req.user);
      return res.json(product);
    } catch (e) {
      next(e);
    }
  },
  addToCart: async (req, res, next) => {
    try {
      const { id } = req.body;
      const product = await ProductService.addToCart(id, req.user);
      return res.json(product);
    } catch (e) {
      next(e);
    }
  },
  deleteToCart: async (req, res, next) => {
    try {
      const { id } = req.body;
      const product = await ProductService.deleteToCart(id, req.user);
      return res.json(product);
    } catch (e) {
      next(e);
    }
  },
};

module.exports = ProductController;
