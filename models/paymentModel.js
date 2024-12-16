const mongosse = require('mongoose');

const paymentSchema = new mongosse.Schema({
  user: {
    type: mongosse.SchemaTypes.ObjectId,
    ref: 'User',
  },
  order: {
    type: mongosse.SchemaTypes.ObjectId,
    ref: 'Order',
  },
  paymentMethod: {
    type: String,
    enum: [],
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
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
