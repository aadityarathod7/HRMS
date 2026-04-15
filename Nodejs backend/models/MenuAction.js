const mongoose = require('mongoose');

const menuActionSchema = new mongoose.Schema({
  actionName: { type: String },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('MenuAction', menuActionSchema);
