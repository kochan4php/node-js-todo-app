const mongoose = require("mongoose");

const connectDB = async function () {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected : ${con.connection.host}`);
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports = connectDB;
