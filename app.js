const express = require('express');
const morgan = require('morgan');

// Error Handler
const globalErrorhandler = require('./controllers/errorController');

// routers
const userRouter = require('./routers/userRoute');
const productRouter = require('./routers/productRoute');
const categoryRouter = require('./routers/categoryRoute');
const cartRoute = require('./routers/cartRoute');
const orderRoute = require('./routers/orderRoute');
const reviewRoute = require('./routers/reviewRoute');

const app = express();

app.use(express.json());

// Morgan
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/cart', cartRoute);
app.use('/api/v1/orders', orderRoute);
app.use('/api/v1/reviews', reviewRoute);

app.use(globalErrorhandler);

module.exports = app;
