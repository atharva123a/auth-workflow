const express = require('express');

const router = express.Router();

const { loginUser, registerUser, logoutUser, verifyEmail, forgotPassword, resetPassword } = require('../controllers/auth');

router.route("/login").post(loginUser);
router.route('/register').post(registerUser);
router.route('/verify-email').post(verifyEmail)
router.route("/logout").post(logoutUser);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

module.exports = router;