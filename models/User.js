require('dotenv').config();
const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// defining the blueprint for storing data:
const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please provide a first name!"],
        minLength: 1,
        maxLength: 25
    },
    lastName: {
        type: String,
        required: [true, "Please provide a last name!"],
        minLength: 1,
        maxLength: 25
    },
    email: {
        type: String,
        required: [true, "Please provide email!"],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide password"],
        minLength: 6,
    },
    // we hash and store the otp:
    otp: {
        type: String,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Date
    },
    passwordRestToken: {
        type: String
    },
    passwordTokenExpirationDate: {
        type: Date
    },
    allowReset : {
        type : Boolean,
        default : false
    }
})

// hash the password before saving it:
UserSchema.pre("save", async function () {
    // prevent hashing when saving a user:
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

// compare with hashed password!
UserSchema.methods.comparePassword = async function (candidatePassword) {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);