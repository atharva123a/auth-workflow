const { StatusCodes } = require("http-status-codes");


const errorHandlerMiddleware = (err, req, res, next) => {
    console.log(err);
    // create a custom error object:
    const customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Something went wrong. Please try again later",
    };

    // handle duplicate email error:
    if (err && err.code === 11000) {
        customError.msg = `Duplicate value entered for the ${Object.keys(
            err.keyValue
        )} field. Please enter another value!`;
        customError.statusCode = Number(StatusCodes.BAD_REQUEST);
    }
    
    // handle validation error:
    if (err.name === "ValidationError") {
        // chain values together:
        customError.msg = `${Object.values(err.errors)
            .map((item) => item.message)
            .join(",")}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
    }

    return res.status(customError.statusCode).json({
        success : false,
        msg : customError.msg
    })
};

module.exports = errorHandlerMiddleware;
