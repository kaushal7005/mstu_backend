const express = require("express");
const cors = require("cors"); 
const logger = require("morgan");
const mongoose = require('mongoose');

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(logger("dev"));
app.use(cors());
app.use(express.json());

const uri = process.env.URI
mongoose.connect(uri, {
  useNewUrlParser: true, 
  // useCreateIndex: true
});
const connection = mongoose.connection;
connection.once('open', () =>{
  console.log("MongoDB database connection is established")
})

const singleEntryRoute = require("./routes/singleEntry");
const bulkEntryRoute = require("./routes/bulkEntry");

app.use("/singleEntry", singleEntryRoute);
app.use("/bulkEntry", bulkEntryRoute);

app.listen(port, function() {
  console.log("Server is running on port " + port);
});


module.exports = app;