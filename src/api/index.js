import { Router } from 'express'
import Fulcrum from '../fulcrum'
import Torque from '../torque'
import Web3 from 'web3'

import { query, validationResult } from 'express-validator'
import { iTokens } from '../config/iTokens'

import QueuedStorage from '../QueuedStorage'
import Subgraph from '../subgraph'
import Masterchef from '../contracts/Masterchef'
import BigNumber from 'bignumber.js'
import fetch from 'node-fetch'

export default ({ config, logger }) => {
  const api = Router()
  const networks = ['eth', 'bsc']
  const supportedTokensList = networks.flatMap((network) =>
    iTokens[network].flatMap((token) => token.name)
  )
  const storage = new QueuedStorage()

    ; (async () => {
      await storage.init({
        dir: 'persist-storage',
      })
    })()

  const web3Eth = new Web3(new Web3.providers.HttpProvider(config.web3_provider_url));
  const web3Bsc = new Web3(new Web3.providers.HttpProvider(config.web3_bsc_provider_url));
  const fulcrums = {
    'eth': new Fulcrum(web3Eth, storage, logger, 'eth'),
    'bsc': new Fulcrum(web3Bsc, storage, logger, 'bsc')
  }
  const torques = {
    'eth': new Torque(web3Eth, storage, logger, 'eth'),
    'bsc': new Torque(web3Bsc, storage, logger, 'bsc')
  }

  const getNetworks = (req) => {
    const reqNetworks = req.query.networks
    if (!reqNetworks) {
      //Support old response format
      return [{ network: 'eth', single: true }]
    }

    const result = []
    reqNetworks.split(",").forEach(network => {
      if (!fulcrums[network.trim()]) {
        logger.error(network + ' network is not supported');
        return;
      }
      result.push({ network: network.trim(), single: false })
    })
    return result;
  }

  api.get('/interest-rates-fulcrum', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getFulcrumLendRates()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getFulcrumLendRates()
    }
    return res.json(output)
  })

  api.get('/interest-rates-torque', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getTorqueBorrowRates()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getTorqueBorrowRates()
    }
    return res.json(output)
  })

  api.get('/interest-rates', async (req, res) => {

    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getFulcrumLendAndTorqueBorrowAndYieldRates()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getFulcrumLendAndTorqueBorrowAndYieldRates()
    }
    return res.json(output)
  })

  api.get('/total-asset-supply', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getTotalAssetSupply()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getTotalAssetSupply()
    }
    return res.json(output)
  })

  api.get('/total-asset-borrow', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getTotalAssetBorrow()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getTotalAssetBorrow()
    }
    return res.json(output)
  })

  api.get('/supply-rate-apr', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getSupplyRateAPR()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getSupplyRateAPR()
    }
    return res.json(output)
  })

  api.get('/borrow-rate-apr', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getBorrowRateAPR()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getBorrowRateAPR()
    }
    return res.json(output)
  })

  api.get('/yield-farimng-apy', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getYieldFarmingAPY()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getYieldFarmingAPY()
    }
    return res.json(output)
  })

  api.get('/loan-params', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getLoanParams()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getLoanParams()
    }
    return res.json(output)
  })

  api.get('/torque-borrow-rate-apr', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getTorqueBorrowRateAPR()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getTorqueBorrowRateAPR()
    }
    return res.json(output)
  })

  api.get('/vault-balance', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getVaultBalance()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getVaultBalance()
    }
    return res.json(output)
  })

  api.get('/liquidity', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getFreeLiquidity()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getFreeLiquidity()
    }
    return res.json(output)
  })

  api.get('/vault-balance-usd', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getTVL()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getTVL()
    }
    return res.json(output)
  })

  api.get('/oracle-rates-usd', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getUsdRates()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getUsdRates()
    }
    return res.json(output)
  })

  api.get('/itoken-prices', async (req, res) => {
    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getITokensPrices()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getITokensPrices()
    }
    return res.json(output)
  })

  api.get(
    '/tvl-history',
    [
      query('start_date').isInt({ gt: 0 }),
      query('end_date').isInt({ lte: new Date().setDate(new Date().getDate() + 1) }),
      query('points_number').isInt({ gt: 0 }),
    ],
    async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array(), success: false })
      }
      let startDate = new Date(parseInt(req.query.start_date))
      let endDate = new Date(parseInt(req.query.end_date))
      let pointsNumber = parseInt(req.query.points_number)

      const reqNetworks = getNetworks(req)
      const output = { data: {}, success: true }

      for (let i = 0; i < reqNetworks.length; i++) {
        const network = reqNetworks[i].network;
        if (reqNetworks[i].single) {
          output.data = await fulcrums[network].getHistoryTVL(startDate, endDate, pointsNumber)
          return res.json(output)
        }
        output.data[network] = await fulcrums[network].getHistoryTVL(startDate, endDate, pointsNumber)
      }
      return res.json(output)
    }
  )

  api.get(
    '/asset-stats-history',
    [
      query('asset').isIn(supportedTokensList),
      query('start_date').isInt({ gt: 0 }),
      query('end_date').isInt({ lte: new Date().setDate(new Date().getDate() + 1) }),
      query('points_number').isInt({ gt: 0 }),
    ],
    async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array(), success: false })
      }
      let asset = req.query.asset
      let startDate = new Date(parseInt(req.query.start_date))
      let endDate = new Date(parseInt(req.query.end_date))
      let pointsNumber = parseInt(req.query.points_number)
      const reqNetworks = getNetworks(req)
      const output = { data: {}, success: true }

      for (let i = 0; i < reqNetworks.length; i++) {
        const network = reqNetworks[i].network;
        if (reqNetworks[i].single) {
          output.data = await fulcrums[network].getAssetStatsHistory(asset, startDate, endDate, pointsNumber)
          return res.json(output)
        }
        output.data[network] = await fulcrums[network].getAssetStatsHistory(asset, startDate, endDate, pointsNumber)
      }
      return res.json(output)
    }
  )

  api.get(
    '/asset-history-price',
    [
      query('asset').isIn(supportedTokensList),
      query('date').isInt({ gt: 0, lte: new Date().setDate(new Date().getDate() + 1) }),
    ],
    async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array(), success: false })
      }
      let asset = req.query.asset
      let date = new Date(parseInt(req.query.date))
      for (let i = 0; i < reqNetworks.length; i++) {
        const network = reqNetworks[i].network;
        if (reqNetworks[i].single) {
          output.data = await fulcrums[network].getAssetHistoryPrice(asset, date)
          return res.json(output)
        }
        output.data[network] = await fulcrums[network].getAssetHistoryPrice(asset, date)
      }
      return res.json(output)
    }
  )

  api.get(
    '/borrow-deposit-estimate',
    [
      query('borrow_asset').isIn(supportedTokensList),
      query('borrow_asset').isIn(supportedTokensList),
      query('amount').isFloat({ gt: 0 }),
    ],
    async (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array(), success: false })
      }
      let borrowAsset = req.query.borrow_asset
      let collateralAsset = req.query.collateral_asset
      let amount = req.query.amount

      const reqNetworks = getNetworks(req)
      const output = { data: {}, success: true }

      for (let i = 0; i < reqNetworks.length; i++) {
        const network = reqNetworks[i].network;
        const borrowDepositEstimate = await torques[network].getBorrowDepositEstimate(
          borrowAsset,
          collateralAsset,
          amount
        )
        if (parseFloat(borrowDepositEstimate.depositAmount) === 0 && amount > 0) {
          output.message = 'You entered too large amount'
          output.success = false
          return res.json(output)
        }

        if (reqNetworks[i].single) {
          output.data = await fulcrums[network].getAssetHistoryPrice(asset, date)
          return res.json(output)
        }
        output.data[network] = await fulcrums[network].getAssetHistoryPrice(asset, date)
      }

      return res.json(output)
    }
  )

  api.get('/farming-pools-info', 
  [
    query('networks').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array(), success: false })
    }

    const reqNetworks = getNetworks(req)
    const output = { data: {}, success: true }

    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i].network;
      if (reqNetworks[i].single) {
        output.data = await fulcrums[network].getMasterchefStats()
        return res.json(output)
      }
      output.data[network] = await fulcrums[network].getMasterchefStats()
    }
    return res.json(output)
  }
  )

  api.get('/bsc/defistation-update-farm-tvl', async (req, res) => {
    //https://github.com/cosmostation/defistation-web/blob/master/data-provider-api.md

    if(!req.headers.authorization){
      return { message: 'Authorization header missing', success: false }
    }

    console.log(req.headers.authorization);
    const network = 'bsc';
    const masterChef = await fulcrums[network].getMasterchefStats()
    const itokens = iTokens[network].map(token=>token.displayName)
    itokens.push('BGOV')
    itokens.push('BGOV_WBNB')
    const totalStaked = masterChef.pools.reduce((result, pool) => {
      result = result.plus(new BigNumber(pool.usdTotalLocked))
    return result
    }, new BigNumber(0))

    const defistationRequest = {
      "tvl": totalStaked.toFixed(),
      "volume": 0,
      "bnb": 0,
      "data": {
          "NiceFarm": {
              "contractAddress": Masterchef.getAddress(network),
              "tokens": itokens
          }
      },
      "test": req.query.test||false
  }
    console.log(defistationRequest);
    const result = await fetch(config.defistation_api_url+'/tvl', {
      method: 'POST',
      body: JSON.stringify(defistationRequest),
      headers: { 'Authorization': req.headers.authorization }
  })
    console.log(result);
    return res.json(result)
  })


  api.get('*', function (req, res) {
    res
      .status(404)
      .send("Endpoint not found. Go to <a href='https://api.bzx.network'>bZx API docs page</a>")
  })

  return api
}
