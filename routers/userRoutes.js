const express = require('express');

//controllers
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

//Middlewares
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo')


const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:resetToken', authController.resetPassword);
router.get('/refreshtoken', authController.refreshToken);

router.use(protect);

router.get('/logout', authController.logout);

router
  .route('/')
  .get(restrictTo('admin'), userController.getAllUsers)
  .post(restrictTo('admin'), userController.createNewUser)
  .delete(restrictTo('admin'), userController.deleteAllUsers);

router.get('/me', userController.currentUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.patch('/changePassword', authController.changePassword);
router.get('/verify-email/:token', authController.verifyEmail);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
