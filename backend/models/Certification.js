const mongoose = require('mongoose');

const CertificationSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    certificateName: {
      type: String,
      required: [true, 'Certificate name is required'],
      trim: true,
    },
    issuedBy: { type: String, default: '' },
    issueDate: { type: String, default: '' },
    credentialUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certification', CertificationSchema);
