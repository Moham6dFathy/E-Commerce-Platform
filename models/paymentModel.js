const mongosse = require('mongoose');

const paymentSchema = new mongosse.Schema({
  order: {
    type: mongosse.SchemaTypes.ObjectId,
    ref: 'Order',
  },
  paymentMethod: {
    type: String,
    enum: ['credit card', 'On Delivery'],
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  transaction_id: {
    type: String,
    required: [true, 'You must attach the transaction_id'],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updateAt: {
    type: Date,
    default: Date.now(),
  },
});

const Payment = new mongosse.model('payment', paymentSchema);

module.exports = Payment;
