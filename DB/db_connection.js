const mongoose = require("mongoose");
////ConsoleHaven is the data base name
const dbconnect = mongoose.connect(process.env.MONGODB_KEY || "mongodb://localhost:27017/TheConsoleHaven");

dbconnect
  .then(() => console.log("DB Connected"))
  .catch((err) => console.log(err.message));
