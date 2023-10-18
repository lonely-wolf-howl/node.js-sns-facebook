const mongoose = require('mongoose');

class Connect {
  static mongoDB() {
    mongoose.set('strictQuery', false);
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        console.log('Connected to MongoDB');
      })
      .catch((error) => {
        console.log(error);
      });
  }
}

module.exports = Connect;
