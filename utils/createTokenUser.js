// returns user token!
const createTokenUser = ({ user }) => {
    const { _id: userId, firstName, lastName } = user;
    let name = firstName + " " + lastName;
    return { userId, name };
};

module.exports = { createTokenUser };
