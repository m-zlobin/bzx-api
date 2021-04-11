import { Router } from 'express'
import Fulcrum from '../fulcrum'
import Torque from '../torque'
import Web3 from 'web3'

import { query, validationResult } from 'express-validator'
import { iTokens } from '../config/iTokens'

import QueuedStorage from '../QueuedStorage'

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

  api.get('/interest-rates-fulcrum', async (req, res) => {
    const lendRates = await fulcrums.eth.getFulcrumLendRates()
    res.json(lendRates)
  })

  api.get('/interest-rates-torque', async (req, res) => {
    const borrowRates = await fulcrums.eth.getTorqueBorrowRates()
    res.json(borrowRates)
  })

  api.get('/interest-rates', async (req, res) => {
    const rates = await fulcrums.eth.getFulcrumLendAndTorqueBorrowAndYieldRates()
    res.json({ data: rates, success: true })
  })

  api.get('/total-asset-supply', async (req, res) => {
    const totalAssetSupply = await fulcrums.eth.getTotalAssetSupply()
    res.json({ data: totalAssetSupply, success: true })
  })

  api.get('/total-asset-borrow', async (req, res) => {
    const totalAssetBorrow = await fulcrums.eth.getTotalAssetBorrow()
    res.json({ data: totalAssetBorrow, success: true })
  })

  api.get('/supply-rate-apr', async (req, res) => {
    const apr = await fulcrums.eth.getSupplyRateAPR()
    res.json({ data: apr, success: true })
  })

  api.get('/borrow-rate-apr', async (req, res) => {
    const apr = await fulcrums.eth.getBorrowRateAPR()
    res.json({ data: apr, success: true })
  })

  api.get('/yield-farimng-apy', async (req, res) => {
    const apy = await fulcrums.eth.getYieldFarmingAPY()
    res.json({ data: apy, success: true })
  })

  api.get('/loan-params', async (req, res) => {
    const params = await fulcrums.eth.getLoanParams()
    res.json({ data: params, success: true })
  })

  api.get('/torque-borrow-rate-apr', async (req, res) => {
    const torqueBorrowRates = await fulcrums.eth.getTorqueBorrowRateAPR()
    res.json({ data: torqueBorrowRates, success: true })
  })

  api.get('/vault-balance', async (req, res) => {
    const vaultBalance = await fulcrums.eth.getVaultBalance()
    res.json({ data: vaultBalance, success: true })
  })

  api.get('/liquidity', async (req, res) => {
    const liquidity = await fulcrums.eth.getFreeLiquidity()
    res.json({ data: liquidity, success: true })
  })

  api.get('/vault-balance-usd', async (req, res) => {
    const reqNetworks = req.query.networks
    if (!reqNetworks) {
      const tvlEth = await fulcrums.eth.getTVL()
      return res.json({ data: tvlEth, success: true })
    }

    const output = { data: {}, success: true }
    for (let i = 0; i < reqNetworks.length; i++) {
      const network = reqNetworks[i];
      if (!fulcrums[network]) {
        logger.error(network + ' network is not supported');
        return;
      }
      output.data[network] = await fulcrums[network].getTVL()
    }
    return res.json(output)
  })

  api.get('/oracle-rates-usd', async (req, res) => {
    const usdRates = await fulcrums.eth.getUsdRates()
    res.json({ data: usdRates, success: true })
  })

  api.get('/itoken-prices', async (req, res) => {
    const usdRates = await fulcrums.eth.getITokensPrices()
    res.json({ data: usdRates, success: true })
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

      const reqNetworks = req.query.networks
      if (!reqNetworks) {
        const tvlHistoryEth = await fulcrums.eth.getHistoryTVL(startDate, endDate, pointsNumber)
        return res.json({ data: tvlHistoryEth, success: true })
      }

      const output = { data: {}, success: true }
      for (let i = 0; i < reqNetworks.length; i++) {
        const network = reqNetworks[i];
        if (!fulcrums[network]) {
          logger.error(network + ' network is not supported');
          return;
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

      const reqNetworks = req.query.networks
      if (!reqNetworks) {
        const aprHistory = await fulcrums.eth.getAssetStatsHistory(asset, startDate, endDate, pointsNumber)
        return res.json({ data: aprHistory, success: true })
      }

      const output = { data: {}, success: true }
      for (let i = 0; i < reqNetworks.length; i++) {
        const network = reqNetworks[i];
        if (!fulcrums[network]) {
          logger.error(network + ' network is not supported');
          return;
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

      const priceHistory = await fulcrums.eth.getAssetHistoryPrice(asset, date)
      res.json({ data: priceHistory, success: true })
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
      const borrowDepositEstimate = await torque.getBorrowDepositEstimate(
        borrowAsset,
        collateralAsset,
        amount
      )
      if (parseFloat(borrowDepositEstimate.depositAmount) === 0 && amount > 0) {
        res.json({ message: 'You entered too large amount', success: false })
      } else {
        res.json({ data: borrowDepositEstimate, success: true })
      }
    }
  )

  api.get('*', function (req, res) {
    res
      .status(404)
      .send("Endpoint not found. Go to <a href='https://api.bzx.network'>bZx API docs page</a>")
  })

  return api
}
