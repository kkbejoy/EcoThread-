const mongoose = require('mongoose');
const { Schema } = mongoose;


const isSafeString = (value) => {
  const forbiddenChars = /[$.]/;
  return !forbiddenChars.test(value);
};

const adminSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: isSafeString,
      message: 'Invalid email format.',
    },
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});



module.exports = mongoose.model('Admin', adminSchema);
