const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const pathToSwaggerUi = require('swagger-ui-dist').absolutePath();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Error Handler
const globalErrorhandler = require('./controllers/errorController');
const AppError = require('./utils/AppError');

// routers
const userRouter = require('./routers/userRoutes');
const productRouter = require('./routers/productRoutes');
const categoryRouter = require('./routers/categoryRoutes');
const cartRouter = require('./routers/cartRoutes');
const orderRouter = require('./routers/orderRoutes');
const reviewRouter = require('./routers/reviewRoutes');
const paymentRouter = require('./routers/paymentRoutes');
const wishlistRouter = require('./routers/wishlistRoutes');
const fs = require('fs');
const path = require('path');

// Controller
const paymentController = require('./controllers/paymentController');

const app = express();

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' } // 'a' means append mode
);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Webhook Checkout
app.post(
  '/api/v1/payments/webhook-checkout',
  express.raw({ type: 'application/json' }),
  paymentController.webhookCheckout
);

//Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Setup Swagger
app.use(express.static(pathToSwaggerUi));

// GLOBAL MIDDLEWARES
app.use(cors());

app.options('*', cors());

// Morgan
if (process.env.NODE_ENV === 'development') {
  // Middleware to capture response body
  app.use((req, res, next) => {
    const originalEnd = res.end;
    let responseBody = '';

    res.end = function (chunk) {
      if (chunk) {
        responseBody += chunk.toString();
      }
      originalEnd.apply(res, arguments);
    };

    // Add response body to res.locals for Morgan to access
    res.on('finish', () => {
      res.locals.responseBody = responseBody;
    });

    next();
  });

  // Custom Morgan token for response body
  morgan.token('response-body', (req, res) => res.locals.responseBody || '');

  // Use Morgan with custom format
  app.use(
    morgan(
      ':method :url :status :res[content-length] - :response-time ms :response-body',
      { stream: accessLogStream }
    )
  );
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP,please try again in an hour',
});
app.use('/api', limiter);

//Helemt
app.use(helmet());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/payments', paymentRouter);
app.use('/api/v1/wishlist', wishlistRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} in this Server!`, 404));
});

app.use(globalErrorhandler);

module.exports = app;
