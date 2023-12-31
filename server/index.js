const express = require("express");
const dbConnect = require("./config/dbConnect");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const auth = require("./routes/auth");
const app = express();
const dotenv = require("dotenv").config();
const { errorHandler, notFound } = require("./middleware/errorHandler");

const PORT = process.env.PORT || 4000;

dbConnect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api/v1/user", auth);

app.use(notFound);
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
