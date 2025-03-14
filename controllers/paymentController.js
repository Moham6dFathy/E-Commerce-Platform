const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Payment = require('../models/paymentModel');
const catchAsync = require('../utils/catchAsync');
const Cart = require('../models/cartModel');
const Email = require('../utils/Email');
const User = require('../models/userModel');

const stripe = require('stripe')(process.env.STRIPE_KEY);

exports.getCheckoutSession = async (req, order) => {
  try {
    const products = await Promise.all(
      order.cart.items.map(async (item) => {
        const product = await Product.findById(item.product);
        const quantity = item.quantity;
        return {
          product,
          quantity,
        };
      })
    );

    let line_items = [];
    products.forEach((product) => {
      const discount = product.product.price * (product.product.discount / 100);
      const item = {
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.product.title,
          },
          unit_amount: (product.product.price - discount) * 100,
        },
        quantity: product.quantity,
      };
      line_items.push(item);
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      success_url: `${req.protocol}://${req.get('host')}/payment/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/payment/failed`,
      customer_email: req.user.email,
      client_reference_id: order.cart._id.toString(),
      line_items,
      mode: 'payment',
      shipping_address_collection: {
        allowed_countries: ['EG'], // Specify allowed countries
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 500, currency: 'usd' },
            display_name: 'Standard shipping',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 5 },
              maximum: { unit: 'business_day', value: 7 },
            },
          },
        },
      ],
    });

    return session;
  } catch (err) {
    throw err;
  }
};

const createOrderCheckout = async (session) => {
  const cartId = session.client_reference_id;

  const cart = await Cart.findById(cartId);

  const orderBody = {
    user: cart.user,
    items: cart.items,
    shippingAddress: {
      street: session.customer_details.address.line1,
      city: session.customer_details.address.state,
      country: session.customer_details.address.city,
    },
    shippingMethod: 'Normal',
    shippingCost: session.shipping_cost.amount_total,
    paymentStatus: session.payment_status,
    paymentMethod: 'Credit Card',
  };

  const order = await Order.create(orderBody);

  const payment = {
    order: order._id,
    transaction_id: session.id,
    amount: session.amount_total / 100,
    paymentMethod: 'credit card',
    status: 'success',
  };

  await Payment.create(payment);

  // update quantities of products
  await Promise.all(
    cart.items.map(async (item) => {
      await Product.findByIdAndUpdate(item.product, {
        quantity: quantity - item.quantity,
      });
    })
  );

  //Clear Cart after order done
  cart.items = [];
  cart.updatedAt = Date.now();
  await cart.save();

  //Send Email for user
  const user = await User.findById(cart.user);
  await new Email(user, 0, order).snedOrderdetails();
};

exports.webhookCheckout = async (req, res) => {
  const signature = req.headers['stripe-signature'];

  let event;
  console.log();
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    res.status(400).send(`Webhook error: ${error.message}`);
  }

  if (event.type === 'checkout.session.completed')
    await createOrderCheckout(event.data.object);

  res.status(200).json({ received: true });
};
