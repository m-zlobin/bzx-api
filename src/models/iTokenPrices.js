const mongoose = require('mongoose')

const iTokenPriceSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  priceUsd: {
    type: Number,
    required: true,
  },
  priceAsset: {
    type: Number,
    required: true,
  },
})

const iTokenPricesSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  iTokenPrices: {
    type: [iTokenPriceSchema],
    required: true,
    default: undefined,
  },
})

const iTokenPricesSchemaEth = mongoose.model('itoken_prices', iTokenPricesSchema)
const iTokenPricesSchemaBsc = mongoose.model('itoken_prices_bsc', iTokenPricesSchema)
exports.iTokenPricesModel = { eth: iTokenPricesSchemaEth, bsc: iTokenPricesSchemaBsc }
exports.iTokenPriceModel = mongoose.model('itoken_price', iTokenPriceSchema)
