const mongoose = require('mongoose');

require('dotenv').config({ path: './config.env' });

const app = require('./app');

const db_url = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD
);

// Connect the database
mongoose.connect(db_url).then(() => {
  console.log('Database server is connecting 👌');
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App Running on Port ${port} 😎`);
});
