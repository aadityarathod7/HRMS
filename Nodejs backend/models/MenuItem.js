const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
