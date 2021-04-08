const mongoose = require('mongoose')

const tokenStatsModel = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  liquidity: {
    type: String,
    required: true,
  },
  totalSupply: {
    type: String,
    required: true,
  },
  totalBorrow: {
    type: String,
    required: true,
  },
  supplyInterestRate: {
    type: String,
    required: true,
  },
  borrowInterestRate: {
    type: String,
    required: true,
  },
  torqueBorrowInterestRate: {
    type: String,
    required: true,
  },
  yieldFarmingAPR: {
    type: String,
    required: true,
  },
  vaultBalance: {
    type: String,
    required: true,
  },
  swapRates: {
    type: String,
    required: true,
  },
  lockedAssets: {
    type: String,
    required: true,
  },
  swapToUSDPrice: {
    type: String,
    required: true,
  },
  usdSupply: {
    type: String,
    required: true,
  },
  usdTotalLocked: {
    type: String,
    required: true,
  },
})

const allTokensStatsModel = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  usdSupply: {
    type: String,
    required: true,
  },
  usdTotalLocked: {
    type: String,
    required: true,
  },
})

const statsModel = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  tokensStats: {
    type: [tokenStatsModel],
    required: true,
    default: undefined,
  },
  allTokensStats: {
    type: allTokensStatsModel,
    required: true,
  },
})

const statsModelEth = mongoose.model('stats', statsModel)
const statsModelBsc = mongoose.model('stats_bsc', statsModel)
module.exports.statsModel = { eth: statsModelEth, bsc: statsModelBsc }
module.exports.tokenStatsModel = mongoose.model('token_stats', tokenStatsModel)
module.exports.allTokensStatsModel = mongoose.model('all_token_stats', allTokensStatsModel)
