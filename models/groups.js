const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
  },
  groupName: {
    type: String,
  },
  perticipants: [
    {
      user: {
        type: String,
        required: true,
      },
      isAdmin: {
        type: Boolean,
        required: true,
        default: false,
      },
      isSuperAdmin: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  ],
});

const Group = mongoose.model('group', groupSchema);
module.exports = { Group };
