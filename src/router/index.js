const Router = require('express').Router;
const userController = require('../controllers/user-controller');
const router = new Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth-middleware');
const ProductController = require('../controllers/product-controller');

router.post(
  '/signUp',
  body('email').isEmail(),
  body('password').isLength({ min: 3, max: 32 }),
  userController.signUp,
);
router.post('/signIn', userController.signIn);
router.post(
  '/refreshPassword',
  body('password').isLength({ min: 3, max: 32 }),
  userController.refreshPassword,
);
router.post('/logout', userController.logout);
router.get('/activate/:link', userController.activate);
router.get('/refresh', userController.refresh);
router.get('/users', authMiddleware, userController.getUsers);
router.get('/me', authMiddleware, userController.me);
router.get('/favorites', authMiddleware, userController.favorites);
router.get('/cart', authMiddleware, userController.cart);
router.get('/products', ProductController.getProducts);
router.get('/product/:id', ProductController.getProduct);
router.post('/newProduct', authMiddleware, ProductController.newProduct);
router.delete('/deleteProduct/:id', authMiddleware, ProductController.deleteProduct);
router.patch('/updateProduct', authMiddleware, ProductController.updateProduct);
router.post('/toggleFavorite', authMiddleware, ProductController.toggleFavorite);
router.post('/addToCart', authMiddleware, ProductController.addToCart);
router.post('/deleteToCart', authMiddleware, ProductController.deleteToCart);
module.exports = router;
