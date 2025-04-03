import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  ratings: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  }],
  reviews: [{
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  averageRating: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.models.User || mongoose.model('User', userSchema); 