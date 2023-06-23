const mongoose = require("mongoose");

const validateMondoDBId = (id) => {
  const isValid = mongoose.Types.ObjectId.isValid(id);
  if (!isValid) throw new Error("This ID is not valid or not found");
};

module.exports = { validateMondoDBId };
