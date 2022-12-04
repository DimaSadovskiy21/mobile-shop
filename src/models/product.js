const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      required: true,
    },
    price: {
      type: String,
    },
    sizes: {
      type: Array,
    },
    description: {
      type: String,
    },
    sex: {
      type: String,
    },
    typeOfClothing: {
      type: String,
    },
    favoriteCount: {
      type: Number,
      default: 0,
    },
    favoritedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('Product', ProductSchema);
