require('dotenv').config();

const { StatusCodes } = require('http-status-codes');

const CustomError = require('../errors');

const User = require("../models/User");

const crypto = require('crypto');

const otpGenerator = require('otp-generator')

const { attachCookiesToResponse, createTokenUser, sendMail, hashOtp, compareOtp, sendResetMail, hashString } = require("../utils");

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new CustomError.BadRequestError(`Email already exists!`);
    }

    const protocol = req.protocol;
    const host = req.get("host");
    let origin = `${protocol}://${host}`

    const user = await User.create({ firstName, lastName, email, password });

    let name = user.firstName + " " + user.lastName;

    let otp = otpGenerator.generate(5, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });


    // send otp via mail!:
    await sendMail(name, user.email, otp);

    user.otp = await hashOtp(otp);

    await user.save();

    res.status(StatusCodes.CREATED).json({ success: true, msg: "Please check you email!" });

}

const verifyEmail = async (req, res) => {
    const { otp, email } = req.body;

    if (!otp || !email) {
        throw new CustomError.BadRequestError('Please provide otp and email!')
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new CustomError.UnauthenticatedError('Invalid credentials!');
    }

    if(user.isVerified){
        res.status(StatusCodes.OK).json({msg : "Your email has already been verified!"});
        return;
    }

    let match = await compareOtp(otp, user.otp);

    if (!match) {
        throw new CustomError.UnauthenticatedError('Invalid Otp!');
    }

    user.isVerified = true;
    user.verified = Date.now();
    user.otp = "";

    await user.save();

    res.status(StatusCodes.OK).json({ success: true, msg: "Email verified successfully!" });
}

const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
        throw new CustomError.BadRequestError("Please enter email and password");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    const match = await user.comparePassword(password);
    if (!match) {
        throw new CustomError.UnauthenticatedError("Invalid Credentials");
    }

    // only allow verified users to login:
    if (!user.isVerified) {
        throw new CustomError.UnauthenticatedError('Please verify your email!');
    }

    // attack cookie along with the jwt token:
    const tokenUser = createTokenUser({ user });

    attachCookiesToResponse({ res, user: tokenUser, rememberMe });
    res.status(StatusCodes.OK).json({ user: tokenUser });
}

// cookie expires:
const logoutUser = async (req, res) => {
    const token = "";
    res.cookie("token", token, {
        expires: new Date(Date.now()),
    });

    res.send("Logged out user!");
};


const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new CustomError.BadRequestError("Please provide email!");
    }

    const user = await User.findOne({ email });

    if (user && user.isVerified) {
        const protocol = req.protocol;
        const host = req.get("host");
        let origin = `${protocol}://${host}/api/v1`
        const passwordToken = crypto.randomBytes(70).toString("hex");
       
        let expires = 1000 * 60 * 60; // 1 hour
        const passwordTokenExpirationDate = new Date(Date.now() + expires);

        let name = user.firstName + " " + user.lastName;
        await sendResetMail(name, user.email, origin, passwordToken);

        user.passwordRestToken = await hashString(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate

        await user.save();
    }

    res.status(StatusCodes.OK).json({ success: true, msg: "Check your registered email for password reset link!" });
}

const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
        throw new CustomError.BadRequestError(`Please provide email and new password!`)
    }

    const user = await User.findOne({ email });

    // update password of the user that exists
    // if user doesn't exist don't tell the person trying to reset the password
    if (user) {
        if (user.allowReset) {
            user.password = newPassword;
            user.passwordTokenExpirationDate = new Date;
            user.passwordRestToken = "";
            user.allowReset = false;
            await user.save();
        }
        else {
            res.status(StatusCodes.BAD_REQUEST).json({
                success: false,
                message: "Your password reset time has expired. Please try again!"
            })
            return;
        }
    }

    res.status(StatusCodes.OK).json({ success: true, msg: "Password updated successfully!!" });

}

module.exports = { registerUser, loginUser, logoutUser, verifyEmail, forgotPassword, resetPassword };
