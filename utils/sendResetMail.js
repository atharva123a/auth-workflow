const sgMail = require('@sendgrid/mail')

const sendResetMail = async (name, email, origin, passwordToken) => {

    // set up our api!
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const resetLink = `${origin}/user/reset-password?token=${passwordToken}&email=${email}`;

    const message = `<p>Please click on the following link to reset your password : <a href="${resetLink}">Reset Password</a></p>`;
    const msg = {
        //   using env files only because this will be pushed to github!
        to: email,
        from: process.env.from,
        subject: "Reset Account Password",
        html : `<h4>Hello, ${name}</h4>
        ${message}`
    };

    try {
        await sgMail.send(msg);
        console.log("Email sent!!");
    } catch (error) {
        console.log(error);
        console.log('error!');
    }
};

module.exports = sendResetMail;