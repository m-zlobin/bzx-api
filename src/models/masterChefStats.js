const mongoose = require('mongoose')

const MasterChefPoolInfoModel = new mongoose.Schema({
  network: {
    type: String,
    required: true,
  },
  lpToken: {
    type: String,
    required: true,
  },
  allocPoint: {
    type: String,
    required: true,
  },
  lastRewardBlock: {
    type: String,
    required: true,
  },
  accBGOVPerShare: {
    type: String,
    required: true,
  },
  tokenPriceUSD: {
    type: String,
    required: true,
  },
  stakedVolume: {
    type: String,
    required: true,
  },
  usdTotalLocked: {
    type: String,
    required: true,
  },
  apr: {
    type: String,
    required: true,
  },
})

const MasterChefPoolsInfoModel = new mongoose.Schema({
  network: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  totalAllocPoint: {
    type: String,
    required: true,
  },
  bgovPerBlock: {
    type: String,
    required: true,
  },
  blocksPerYear: {
    type: String,
    required: true,
  },
  bgovPrice: {
    type: String,
    required: true,
  },
  bgovAddress: {
    type: String,
    required: true,
  },
  poolLength: {
    type: String,
    required: true,
  },
  pools: {
    type: [MasterChefPoolInfoModel],
    required: true,
    default: undefined,
  },
})

exports.MasterChefPoolsInfoModel = mongoose.model('masterchef_pools_info', MasterChefPoolsInfoModel)
exports.MasterChefPoolInfoModel = mongoose.model('masterchef_pool_info', MasterChefPoolInfoModel)
