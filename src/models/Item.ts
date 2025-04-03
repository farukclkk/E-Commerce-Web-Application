import mongoose, { Document } from 'mongoose';

interface IItem extends Document {
  name: string;
  description: string;
  price: number;
  category: 'Vinyls' | 'Antique Furniture' | 'GPS Sport Watches' | 'Running Shoes';
  seller: string;
  image: string;
  batteryLife?: number;
  age?: number;
  size?: string;
  material?: string;
  ratings: Array<{
    userId: mongoose.Types.ObjectId;
    rating: number;
  }>;
  reviews: Array<{
    userId: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }>;
  averageRating: number;
}

const itemSchema = new mongoose.Schema<IItem>({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Vinyls', 'Antique Furniture', 'GPS Sport Watches', 'Running Shoes'],
  },
  seller: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  // Optional fields based on category
  batteryLife: {
    type: Number,
    required: function(this: IItem) {
      return this.category === 'GPS Sport Watches';
    },
  },
  age: {
    type: Number,
    required: function(this: IItem) {
      return this.category === 'Antique Furniture' || this.category === 'Vinyls';
    },
  },
  size: {
    type: String,
    required: function(this: IItem) {
      return this.category === 'Running Shoes';
    },
  },
  material: {
    type: String,
    required: function(this: IItem) {
      return this.category === 'Antique Furniture' || this.category === 'Running Shoes';
    },
  },
  // Rating and review fields
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  }],
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

export default mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema); 