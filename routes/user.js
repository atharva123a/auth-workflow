const express = require("express");

const router = express.Router();

const User = require("../models/User");

const { hashString } = require("../utils");

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

router.get('/reset-password', async (req, res) => {
    // normally this would be handled inside the client
    // however for demonstration we verify the token with the email and update allowReset!
    const { token, email } = req.query;

    const user = await User.findOne({ email });
    let currentTime = new Date();

    if (user) {
        if (user.passwordRestToken == hashString(token) && currentTime < user.passwordTokenExpirationDate) {
            user.allowReset = true;
            await user.save();
        }
        else {
            user.allowReset = false;
            res.send("The link has expired! Please try to reset your password again!");
            return;
        }
    }

    res.send('You have verified your email! You may now proceed to reset your password!');
    return;
})

module.exports = router;