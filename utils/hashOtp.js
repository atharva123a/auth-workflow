const bcrypt = require('bcryptjs');

const hashOtp = async (otp) => {
    const salt = await bcrypt.genSalt(6);
    return await bcrypt.hash(otp, salt);
}

const compareOtp = async (candidateOtp, savedOtp) => {
    return await bcrypt.compare(candidateOtp, savedOtp);
}

module.exports = {hashOtp, compareOtp};