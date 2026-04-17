const mongoose = require('mongoose');

const roleMenuActionSchema = new mongoose.Schema({
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  menuAction: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuAction' },
  isAllowed: { type: Boolean }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

module.exports = mongoose.model('RoleMenuAction', roleMenuActionSchema);
