require('dotenv').config();
// for error handler to work!
require('express-async-errors')

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const morgan = require("morgan");

app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET));
app.use(morgan('tiny'));
// routes:
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

// middlewares:
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found')

// use the routes:
app.use('/api/v1/', authRoutes);
app.use("/api/v1/user", userRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const connectDB = require('./db/connect')
const port = process.env.PORT || 3000;

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(port, () =>
            console.log(`Server is listening on port ${port}...`)
        );
    } catch (error) {
        console.log(error);
    }
};

start();