const jwt = require("jsonwebtoken");

const createJWT = ({ payload }, life) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: life,
  });

  return token;
};

const attachCookiesToResponse = ({ res, user, rememberMe }) => {
  // create token:
  const payload = user;
  let tokenLife;
  let cookieLife;

  if (rememberMe) {
    tokenLife = process.env.JWT_LIFE
    cookieLife = parseInt(process.env.long);
  }
  else {
    tokenLife = process.env.JWT_SHORT_LIFE;
    cookieLife = parseInt(process.env.short);
  }

  const token = createJWT({ payload }, tokenLife);
  // attach cookie:
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + cookieLife),
    secure: process.env.NODE_DEV === "production", // only https urls can access the cookies and modify them
    signed: true,
  });
};

const isTokenValid = ({ token }) => jwt.verify(token, process.env.JWT_SECRET);

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
};
