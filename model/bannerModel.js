const mongoose = require('mongoose');

const BannerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  bannerUrl: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

const Banner = mongoose.model('Banner', BannerSchema);

module.exports = Banner;
