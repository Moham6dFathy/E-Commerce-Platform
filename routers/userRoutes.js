const express = require('express');

//controllers
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.login);
router.post('/forgotpassword', authController.forgotPassword);
router.patch('/resetpassword/:resetToken', authController.resetPassword);
router.get('/refreshtoken', authController.refreshToken);

router.use(authController.protect);

router.get('/logout', authController.logout);

router
  .route('/')
  .get(authController.restrictTo('admin'), userController.getAllUsers)
  .post(authController.restrictTo('admin'), userController.createNewUser)
  .delete(authController.restrictTo('admin'), userController.deleteAllUsers);

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
