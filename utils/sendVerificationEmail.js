const sgMail = require('@sendgrid/mail')

const sendMail = async (name, email, otp) => {

    // set up our api!
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
        //   using env files only because this will be pushed to github!
        to: email,
        from: process.env.from,
        subject: "Please verify email!",
        text: `Hi, there ${name}! This is your otp : ${otp}`,
    };

    try {
        await sgMail.send(msg);
        console.log("Email sent!!");
    } catch (error) {
        console.log(error);
        console.log('error!');
    }
};

module.exports = sendMail;