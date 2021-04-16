import { erc20Json } from '../contracts/erc20Contract'
import { iTokenJson } from '../contracts/iTokenContract'
import { iTokenPricesModel, iTokenPriceModel } from '../models/iTokenPrices'
import { iTokens } from '../config/iTokens'
import { loanParamsListModel, loanParamsModel } from '../models/loanParams'
import BigNumber from 'bignumber.js'
import BZRXVestingTokenContract from '../contracts/BZRXVestingTokenContract'
import config from '../config.json'
import DappHelper from '../contracts/DappHelperContract'
import erc20Tokens from '../config/erc20Tokens'
import iBZx from '../contracts/iBZxContract'
import oracle from '../contracts/OracleContract'
import stakingV1 from '../contracts/StakingV1Contract'
import { allTokensStatsModel, statsModel, tokenStatsModel } from '../models/stats'
import threePool from '../contracts/ThreePoolContract'
import Web3Utils, { isBigNumber } from 'web3-utils'
import Masterchef from '../contracts/Masterchef'
import IPancakePair from '../contracts/IPancakePair'
import IPancakeRouter02 from '../contracts/IPancakeRouter02'
import HelperImpl from '../contracts/HelperImpl'

import { MasterChefPoolInfoModel, MasterChefPoolsInfoModel } from '../models/masterChefStats'

const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1)

export default class Fulcrum {
  constructor(web3, storage, logger, network) {
    this.web3 = web3
    this.logger = logger
    this.storage = storage
    this.network = network
    this.iTokensByNetwork = iTokens[network]
    this.erc20TokensByNetwork = erc20Tokens[network]
    this.avgBlockTime = this.network === 'bsc' ? 3 : 15

    this.networkFilter = {
      eth: [{ network: { $exists: false } }, { network: this.network }],
    }[this.network] || [{ network: this.network }]

    setInterval(this.updateCache.bind(this), config.cache_ttl_sec * 1000)
    setInterval(this.updateParamsCache.bind(this), config.cache_params_ttl_day * 86400 * 1000)
    this.DappHeperContract = new this.web3.eth.Contract(
      DappHelper.abi,
      DappHelper.getAddress(this.network)
    )
    this.updateCache()
    this.updateParamsCache()
  }

  async updateCache(key, value) {
    await this.updateReservedData()
    // await this.storage.setItem("reserve_data", reserve_data);
    this.logger.info('reserve_data updated')

    await this.updateITokensPrices()
    // await this.storage.setItem("itoken-prices", itoken);
    this.logger.info('itoken-prices updated')
  }

  async updateParamsCache(key, value) {
    await this.updateLoanParams()
    // await this.storage.setItem("loan_params", params);
    this.logger.info('loan_params updated')
  }

  async getTotalAssetSupply() {
    const reserveData = await this.getReserveData()
    const totalAssetSupply = {}
    reserveData.forEach((item) => (totalAssetSupply[item.token] = item.totalSupply))

    return totalAssetSupply
  }

  async getTotalAssetBorrow() {
    const reserveData = await this.getReserveData()
    const totalAssetBorrow = {}
    reserveData.forEach((item) => (totalAssetBorrow[item.token] = item.totalBorrow))

    return totalAssetBorrow
  }

  async getSupplyRateAPR() {
    const reserveData = await this.getReserveData()
    const apr = {}
    reserveData.forEach((item) => (apr[item.token] = item.supplyInterestRate))

    return apr
  }

  async getBorrowRateAPR() {
    const reserveData = await this.getReserveData()
    const apr = {}
    reserveData.forEach((item) => (apr[item.token] = item.borrowInterestRate))

    return apr
  }

  async getYieldFarmingAPY() {
    const reserveData = await this.getReserveData()
    const apy = {}
    reserveData.forEach((item) => (apy[item.token] = item.yieldFarmingAPR))

    return apy
  }

  async getFulcrumLendRates() {
    const reserveData = await this.getReserveData()
    const lendRates = []
    const borrowRates = []
    reserveData
      .filter((item) => item.token !== 'all' && item.token !== 'ethv1')
      .forEach((item) => {
        const lendApr = item.supplyInterestRate / 100
        const lendApy = this.convertAPRtoAPY(lendApr)
        const tokenSymbol = item.token.toUpperCase()
        lendRates.push({
          apr: lendApr,
          apy: lendApy,
          tokenSymbol,
        })
      })

    return { lendRates, borrowRates }
  }

  async getTorqueBorrowRates() {
    const reserveData = await this.getReserveData()

    const borrowRates = []
    reserveData
      .filter((item) => item.token !== 'all' && item.token !== 'ethv1')
      .forEach((item) => {
        const borrowApr = item.torqueBorrowInterestRate / 100
        const borrowApy = this.convertAPRtoAPY(borrowApr)
        const tokenSymbol = item.token.toUpperCase()
        borrowRates.push({
          apr: borrowApr,
          apy: borrowApy,
          tokenSymbol,
        })
      })

    return { borrowRates, lendRates: [] }
  }

  async getFulcrumLendAndTorqueBorrowAndYieldRates() {
    const reserveData = await this.getReserveData()
    const rates = {}
    reserveData
      .filter((item) => item.token !== 'all' && item.token !== 'ethv1')
      .forEach((item) => {
        const yieldFarmingAPR = item.yieldFarmingAPR / 100
        const lendApr = item.supplyInterestRate / 100
        const lendApy = this.convertAPRtoAPY(lendApr)
        const borrowApr = item.torqueBorrowInterestRate / 100
        const borrowApy = this.convertAPRtoAPY(borrowApr)
        rates[item.token] = {
          lendApr,
          lendApy,
          borrowApr,
          borrowApy,
          yieldFarmingAPR,
        }
      })
    return rates
  }

  convertAPRtoAPY(apr) {
    const periodicRate = 365
    // APY = (1 + APR / n)^n - 1
    return Math.pow(1 + apr / periodicRate, periodicRate) - 1
  }

  async getTorqueBorrowRateAPR() {
    const reserveData = await this.getReserveData()
    const torqueBorrowRates = {}
    reserveData.forEach((item) => (torqueBorrowRates[item.token] = item.torqueBorrowInterestRate))
    return torqueBorrowRates
  }

  async getVaultBalance() {
    const reserveData = await this.getReserveData()
    const vaultBalance = {}
    reserveData.forEach((item) => (vaultBalance[item.token] = item.vaultBalance))
    return vaultBalance
  }

  async getFreeLiquidity() {
    const reserveData = await this.getReserveData()
    const freeLiquidity = {}
    reserveData.forEach((item) => (freeLiquidity[item.token] = item.liquidity))
    return freeLiquidity
  }

  async getTVL() {
    const reserveData = await this.getReserveData()
    const tvl = {}
    reserveData.forEach((item) => (tvl[item.token] = item.usdTotalLocked))

    //Added LP and bgov volume
    if (this.network === 'bsc') {
      const bgovAddress = this.erc20TokensByNetwork.bgov.erc20Address.toLowerCase()
      const bgov_wnbAddress = IPancakePair.getAddress(
        this.network,
        'bgov_wbnb'
      ).address.toLowerCase()
      const masterchefStats = await this.getMasterchefStats()
      if (!masterchefStats) return tvl

      masterchefStats.pools.forEach((pool) => {
        if (pool.lpToken.toLowerCase() === bgovAddress) {
          tvl['bgov'] = pool.usdTotalLocked
          tvl['all'] += pool.usdTotalLocked
        } else if (pool.lpToken.toLowerCase() === bgov_wnbAddress) {
          tvl['bgov_wbnb'] = pool.usdTotalLocked
          tvl['all'] += pool.usdTotalLocked
        }
      })
    }
    return tvl
  }

  async getUsdRates() {
    const reserveData = await this.getReserveData()
    const usdRates = {}
    reserveData.forEach((item) => (usdRates[item.token] = item.swapToUSDPrice))
    return usdRates
  }

  async getITokensPrices() {
    const iTokenPricesModelByNetwork = iTokenPricesModel[this.network]
    const lastITokenPrices = (
      await iTokenPricesModelByNetwork
        .find()
        .sort({ _id: -1 })
        .select({ iTokenPrices: 1 })
        .lean()
        .limit(1)
    )[0]
    if (!lastITokenPrices) {
      this.logger.info('No itoken-prices in db!')
      await this.updateITokensPrices()
      // result = await this.updateITokensPrices();

      // await this.storage.setItem("itoken-prices", result);
      // console.dir(`itoken-prices:`);
      // console.dir(result);
    }
    const result = {}
    lastITokenPrices.iTokenPrices.forEach((iTokenPrice) => {
      result[iTokenPrice.token] = {
        symbol: iTokenPrice.symbol,
        address: iTokenPrice.address,
        price_usd: iTokenPrice.priceUsd,
        price_asset: iTokenPrice.priceAsset,
      }
    })
    return result
  }

  async updateITokensPrices() {
    const usdRates = await this.getUsdRates()
    const iTokenPricesModelByNetwork = iTokenPricesModel[this.network]
    const iTokenPrices = new iTokenPricesModelByNetwork()
    iTokenPrices.iTokenPrices = []
    for (const token in this.iTokensByNetwork) {
      const iToken = this.iTokensByNetwork[token]
      const iTokenContract = new this.web3.eth.Contract(iTokenJson.abi, iToken.address)
      this.logger.info('call iTokenContract')
      const tokenPrice = await iTokenContract.methods.tokenPrice().call()

      // price is in loanAsset of iToken contract
      const priceUsd = new BigNumber(tokenPrice)
        .multipliedBy(usdRates[iToken.name === 'ethv1' ? 'eth' : iToken.name])
        .dividedBy(10 ** 18)
      const priceAsset = new BigNumber(tokenPrice).dividedBy(10 ** 18)
      const iTokenPrice = new iTokenPriceModel({
        token: iToken.iTokenName.toLowerCase(),
        symbol: iToken.iTokenName,
        address: iToken.address.toLowerCase(),
        priceUsd: priceUsd.toNumber(),
        priceAsset: priceAsset.toNumber(),
      })
      iTokenPrices.iTokenPrices.push(iTokenPrice)
    }
    await iTokenPrices.save()
  }

  async getLoanParams() {
    const lastLoanParams = (
      await loanParamsListModel.find().sort({ _id: -1 }).select({ loanParams: 1 }).lean().limit(1)
    )[0]
    if (!lastLoanParams) {
      this.logger.info('No loan-params in db!')
      await this.updateLoanParams()
    }
    return lastLoanParams.loanParams.map((params) => {
      return {
        loanId: params.loanId,
        principal: params.principal,
        collateral: params.collateral,
        platform: params.platform,
        initialMargin: params.initialMargin,
        maintenanceMargin: params.maintenanceMargin,
        liquidationPenalty: params.liquidationPenalty,
      }
    })
  }

  async updateLoanParams() {
    const result = {}
    const loanParamsList = new loanParamsListModel()
    loanParamsList.loanParams = []
    const iBZxContract = new this.web3.eth.Contract(iBZx.abi, iBZx.getAddress(this.network))
    if (!iBZxContract) return null

    const tokens = this.iTokensByNetwork.filter((token) => token.name !== 'ethv1')

    for (const loan in tokens) {
      const loanTokenAddress = tokens[loan].erc20Address
      const iTokenContract = new this.web3.eth.Contract(iTokenJson.abi, tokens[loan].address)
      if (!iTokenContract) return null

      for (const collateral in tokens) {
        if (loan === collateral) {
          continue
        }
        const collateralTokenAddress = tokens[collateral].erc20Address

        if (!collateralTokenAddress) return null
        const fulcrumId = new BigNumber(Web3Utils.soliditySha3(collateralTokenAddress, false))
        const liquidationIncentivePercent = await iBZxContract.methods
          .liquidationIncentivePercent(loanTokenAddress, collateralTokenAddress)
          .call()

        try {
          const fulcrumLoanId = await iTokenContract.methods.loanParamsIds(fulcrumId).call()
          const fulcrumLoanParams = await iBZxContract.methods.loanParams(fulcrumLoanId).call()
          const loanToken = this.iTokensByNetwork.find(
            (token) => token.erc20Address.toLowerCase() === fulcrumLoanParams[3].toLowerCase()
          ).displayName
          const collateralToken = this.iTokensByNetwork.find(
            (token) => token.erc20Address.toLowerCase() === fulcrumLoanParams[4].toLowerCase()
          ).displayName
          fulcrumLoanParams &&
            fulcrumLoanParams[1] === true &&
            loanParamsList.loanParams.push(
              new loanParamsModel({
                loanId: fulcrumLoanParams[0],
                principal: loanToken,
                collateral: collateralToken,
                platform: 'Fulcrum',
                initialMargin: new BigNumber(fulcrumLoanParams[5]).div(10 ** 18),
                maintenanceMargin: new BigNumber(fulcrumLoanParams[6]).div(10 ** 18),
                liquidationPenalty: new BigNumber(liquidationIncentivePercent).div(10 ** 18),
              })
            )
        } catch (e) {
          this.logger.error(e)
        }

        try {
          const torqueId = new BigNumber(Web3Utils.soliditySha3(collateralTokenAddress, true))
          const torqueLoanId = await iTokenContract.methods.loanParamsIds(torqueId).call()
          const torqueLoanParams = await iBZxContract.methods.loanParams(torqueLoanId).call()
          const loanToken = this.iTokensByNetwork.find(
            (token) => token.erc20Address.toLowerCase() === torqueLoanParams[3].toLowerCase()
          ).displayName
          const collateralToken = this.iTokensByNetwork.find(
            (token) => token.erc20Address.toLowerCase() === torqueLoanParams[4].toLowerCase()
          ).displayName
          torqueLoanParams &&
            torqueLoanParams[1] === true &&
            loanParamsList.loanParams.push(
              new loanParamsModel({
                loanId: torqueLoanParams[0],
                principal: loanToken,
                collateral: collateralToken,
                platform: 'Torque',
                initialMargin: new BigNumber(torqueLoanParams[5]).div(10 ** 18),
                maintenanceMargin: new BigNumber(torqueLoanParams[6]).div(10 ** 18),
                liquidationPenalty: new BigNumber(liquidationIncentivePercent).div(10 ** 18),
              })
            )
        } catch (e) {
          this.logger.error(e)
        }
      }
    }

    if (loanParamsList.loanParams.length > 0) {
      await loanParamsList.save()
    }

    return result
  }

  async getSwapToUsdRate(asset) {
    if (
      asset === 'SAI' ||
      asset === 'DAI' ||
      asset === 'USDC' ||
      asset === 'SUSD' ||
      asset === 'USDT'
    ) {
      return new BigNumber(1)
    }

    /* const swapRates = await this.getSwapToUsdRateBatch(
          [asset],
          process.env.REACT_APP_ETH_NETWORK === "mainnet" ?
            Asset.DAI :
            Asset.SAI
        );
    
        return swapRates[0]; */
    return this.getSwapRate(asset, 'DAI')
  }

  async getSwapRate(srcAsset, destAsset, srcAmount) {
    if (
      srcAsset === destAsset ||
      (srcAsset === 'USDC' && destAsset === 'DAI') ||
      (srcAsset === 'DAI' && destAsset === 'USDC')
    ) {
      return new BigNumber(1)
    }

    let result = new BigNumber(0)
    const srcAssetErc20Address = this.iTokensByNetwork.find(
      (token) => token.name === srcAsset.toLowerCase()
    ).erc20Address
    const destAssetErc20Address = this.iTokensByNetwork.find(
      (token) => token.name === destAsset.toLowerCase()
    ).erc20Address
    if (!srcAmount) {
      srcAmount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS
    } else {
      srcAmount = new BigNumber(srcAmount.toFixed(0, 1))
    }

    if (srcAssetErc20Address && destAssetErc20Address) {
      const oracleContract = new this.web3.eth.Contract(oracle.abi, oracle.getAddress(this.network))

      const srcAssetDecimals = this.iTokensByNetwork.find((e) => e.name === srcAsset.toLowerCase())
        .decimals
      const srcAssetPrecision = new BigNumber(10 ** (18 - srcAssetDecimals))
      const destAssetDecimals = this.iTokensByNetwork.find(
        (e) => e.name === destAsset.toLowerCase()
      ).decimals
      const destAssetPrecision = new BigNumber(10 ** (18 - destAssetDecimals))
      try {
        this.logger.info('call oracleContract')

        const swapPriceData = await oracleContract.methods
          .queryRate(srcAssetErc20Address, destAssetErc20Address)
          .call()
        result = swapPriceData[0]
          .times(srcAssetPrecision)
          .div(destAssetPrecision)
          .dividedBy(10 ** 18)
          .multipliedBy(swapPriceData[1].dividedBy(10 ** 18))
      } catch (e) {
        this.logger.info(e)
        result = new BigNumber(0)
      }
    }
    return result
  }

  async getReserveData() {
    let result = []
    const lastReserveData = (
      await statsModel
        .find({
          $or: this.networkFilter,
        })
        .sort({ _id: -1 })
        .select({ tokensStats: 1, allTokensStats: 1 })
        .lean()
        .limit(1)
    )[0]

    if (!lastReserveData) {
      this.logger.info('No reserve_data in db!')
      result = await this.updateReservedData()
      // await this.storage.setItem("reserve_data", result);
      // console.dir(`reserve_data:`);
      // console.dir(result);
    }

    lastReserveData.tokensStats.forEach((tokensStat) => {
      result.push(tokensStat)
    })
    result.push(lastReserveData.allTokensStats)
    return result
  }

  async getHistoryTVL(startDate, endDate, estimatedPointsNumber) {
    const dbStatsDocuments = await statsModel
      .find(
        {
          $or: this.networkFilter,
          date: {
            $lt: endDate,
            $gte: startDate,
          },
        },
        { date: 1, allTokensStats: 1 }
      )
      .sort({ date: 1 })
      .lean()

    if (dbStatsDocuments.length == 0) return []
    let additionalTvl = {}
    //Added LP and bgov volume
    if (this.network === 'bsc') {
      const masterchefStats = await MasterChefPoolsInfoModel.find(
        {
          $or: this.networkFilter,
          date: {
            $lt: endDate,
            $gte: startDate,
          },
        },
        { date: 1, pools: 1 }
      )
        .sort({ date: 1 })
        .lean()

      if (masterchefStats.length !== 0) {
        const bgovAddress = this.erc20TokensByNetwork.bgov.erc20Address.toLowerCase()
        const bgov_wnbAddress = IPancakePair.getAddress(
          this.network,
          'bgov_wbnb'
        ).address.toLowerCase()
        additionalTvl = masterchefStats.reduce((result, stats) => {
          const additioanlTvl = stats.pools.reduce((a, b) => {
            if (b.lpToken.toLowerCase() === bgovAddress) {
              return a.plus(b.usdTotalLocked)
            } else if (b.lpToken.toLowerCase() === bgov_wnbAddress) {
              return a.plus(b.usdTotalLocked)
            }
            return a
          }, new BigNumber(0))
          result[stats.date] = additioanlTvl
          return result
        }, {})
      }
    }

    const arrayLength = dbStatsDocuments.length
    const desiredlength =
      dbStatsDocuments.length > estimatedPointsNumber
        ? estimatedPointsNumber - 1
        : dbStatsDocuments.length

    // pick every n-th element to get normal scale of data
    const timeBetweenTwoArrayElements =
      (new Date(dbStatsDocuments[0].date).getTime() -
        new Date(dbStatsDocuments[arrayLength - 1].date).getTime()) /
      arrayLength
    const timeBetweenTwoOutputElements =
      (new Date(dbStatsDocuments[0].date).getTime() -
        new Date(dbStatsDocuments[arrayLength - 1].date).getTime()) /
      desiredlength
    const offset = Math.floor(timeBetweenTwoOutputElements / timeBetweenTwoArrayElements)
    const reducedArray = dbStatsDocuments.filter((e, i) => i % offset === 0)

    const result = []
    reducedArray.forEach((document, index, documents) => {
      let diffWithPrevPrecents = 0
      if (index > 0) {
        if (additionalTvl[document.date]) {
          document.allTokensStats.usdSupply = new BigNumber(document.allTokensStats.usdSupply).plus(
            additionalTvl[document.date]
          )
          document.allTokensStats.usdTotalLocked = new BigNumber(
            document.allTokensStats.usdTotalLocked
          ).plus(additionalTvl[document.date])
        }

        diffWithPrevPrecents =
          ((document.allTokensStats.usdTotalLocked -
            documents[index - 1].allTokensStats.usdTotalLocked) /
            documents[index - 1].allTokensStats.usdTotalLocked) *
          100
      }
      result.push({
        timestamp: new Date(document.date).getTime(),
        tvl: document.allTokensStats.usdTotalLocked,
        diffWithPrevPrecents: diffWithPrevPrecents,
      })
    })
    return result
  }

  async getAssetStatsHistory(asset, startDate, endDate, estimatedPointsNumber, metrics) {
    const dbStatsDocuments = await statsModel
      .find(
        {
          $or: this.networkFilter,
          date: {
            $lt: endDate,
            $gte: startDate,
          },
          tokensStats: { $elemMatch: { token: asset } },
        },
        { date: 1, tokensStats: 1, 'tokensStats.$': asset }
      )
      .sort({ date: 1 })
      .lean()

    if (dbStatsDocuments.length == 0) return []

    const arrayLength = dbStatsDocuments.length
    const desiredlength =
      dbStatsDocuments.length > estimatedPointsNumber
        ? estimatedPointsNumber - 1
        : dbStatsDocuments.length

    // pick every n-th element to get normal scale of data
    const timeBetweenTwoArrayElements =
      (new Date(dbStatsDocuments[0].date).getTime() -
        new Date(dbStatsDocuments[arrayLength - 1].date).getTime()) /
      arrayLength
    const timeBetweenTwoOutputElements =
      (new Date(dbStatsDocuments[0].date).getTime() -
        new Date(dbStatsDocuments[arrayLength - 1].date).getTime()) /
      desiredlength
    const offset = Math.floor(timeBetweenTwoOutputElements / timeBetweenTwoArrayElements)
    const reducedArray = dbStatsDocuments.filter((e, i) => i % offset === 0)

    const result = []
    reducedArray.forEach((document, index, documents) => {
      const assetStats = document.tokensStats[0]
      let tvlChange24h = 0
      let aprChange24h = 0
      let utilizationChange24h = 0
      const utilization = (assetStats.totalBorrow / assetStats.totalSupply) * 100
      if (index > 0) {
        const prevAssetStats = documents[index - 1].tokensStats[0]
        const prevAssetUtilization = (prevAssetStats.totalBorrow / prevAssetStats.totalSupply) * 100

        tvlChange24h =
          (assetStats.usdTotalLocked - prevAssetStats.usdTotalLocked) /
          prevAssetStats.usdTotalLocked
        aprChange24h =
          (assetStats.supplyInterestRate - prevAssetStats.supplyInterestRate) /
          prevAssetStats.supplyInterestRate
        utilizationChange24h = (utilization - prevAssetUtilization) / prevAssetUtilization
      }
      result.push({
        timestamp: new Date(document.date).getTime(),
        token: assetStats.token,
        supplyInterestRate: assetStats.supplyInterestRate,
        tvl: assetStats.vaultBalance,
        tvlUsd: assetStats.usdTotalLocked,
        utilization: utilization,
        tvlChange24h,
        aprChange24h,
        utilizationChange24h,
      })
    })
    return result
  }

  async getAssetHistoryPrice(asset, date) {
    const dbStatsDocuments = await statsModel
      .find(
        {
          $or: this.networkFilter,
          date: {
            $lt: new Date(date.getTime() + 1000 * 60 * 60),
            $gte: new Date(date.getTime() - 1000 * 60 * 60),
          },
          tokensStats: { $elemMatch: { token: asset } },
        },
        { date: 1, tokensStats: 1, 'tokensStats.$': asset }
      )
      .sort({ date: 1 })
      .lean()

    if (dbStatsDocuments.length == 0) return []

    return {
      swapToUSDPrice: dbStatsDocuments[0].tokensStats[0].swapToUSDPrice,
      timestamp: dbStatsDocuments[0].date.getTime(),
    }
  }

  async getVbzrxWorthPart() {
    const bzrxVestingTokenContract = new this.web3.eth.Contract(
      BZRXVestingTokenContract.abi,
      BZRXVestingTokenContract.getAddress(this.network)
    )
    const vbzrxTotalVested = await bzrxVestingTokenContract.methods.totalVested().call()
    const vbzrxTotalSupply = await bzrxVestingTokenContract.methods.totalSupply().call()

    // how much vBZRX tokens already vested. This gives coefficient for vBZRX token price from BZRX price
    const vbzrxWorthPart = new BigNumber(1).minus(
      new BigNumber(vbzrxTotalVested).div(vbzrxTotalSupply)
    )
    return vbzrxWorthPart
  }

  async getBzrxLockedInStaking() {
    const vbzrxAddress = this.erc20TokensByNetwork.vbzrx.erc20Address
    const bzrxAddress = this.erc20TokensByNetwork.bzrx.erc20Address
    const bptAddress = this.erc20TokensByNetwork.bpt.erc20Address

    const bptErc20Contract = new this.web3.eth.Contract(
      erc20Json.abi,
      BZRXVestingTokenContract.getAddress(this.network)
    )
    // how much vBZRX tokens already vested. This gives coefficient for vBZRX token price from BZRX price
    const vbzrxWorthPart = await this.getVbzrxWorthPart()
    const vbzrxStakedLockedAmount = (
      await this.getErc20BalanceOfUser(vbzrxAddress, stakingV1.getAddress(this.network))
    ).times(vbzrxWorthPart)
    const bzrxStakedLockedAmount = await this.getErc20BalanceOfUser(
      bzrxAddress,
      stakingV1.getAddress(this.network)
    )

    const bptBalanceOfStaking = await this.getErc20BalanceOfUser(
      bptAddress,
      stakingV1.getAddress(this.network)
    )
    const bptTotalSupply = await bptErc20Contract.methods.totalSupply().call()

    const bzrxBalanceOfBpt = await this.getErc20BalanceOfUser(bzrxAddress, bptAddress)
    // share of bzrx liquidity that belongs to staking contract from all bzrx tokens in pool
    const bzrxShareOfBptStakedLockedAmount = bzrxBalanceOfBpt
      .div(bptTotalSupply)
      .times(bptBalanceOfStaking)

    return vbzrxStakedLockedAmount
      .plus(bzrxStakedLockedAmount)
      .plus(bzrxShareOfBptStakedLockedAmount)
  }
  async getWethLockedInBptLockedInStaling() {
    const bptAddress = this.erc20TokensByNetwork.bpt.erc20Address
    const wethAddress = this.erc20TokensByNetwork.weth.erc20Address

    const bptErc20Contract = new this.web3.eth.Contract(erc20Json.abi, bptAddress)

    const bptBalanceOfStaking = await this.getErc20BalanceOfUser(
      bptAddress,
      stakingV1.getAddress(this.network)
    )
    const bptTotalSupply = await bptErc20Contract.methods.totalSupply().call()
    const wethBalanceOfBpt = await this.getErc20BalanceOfUser(wethAddress, bptAddress)

    // share of weth liquidity that belongs to staking contract from all weth tokens in pool
    const wethShareOfBptStakedLockedAmount = wethBalanceOfBpt
      .times(bptBalanceOfStaking)
      .div(bptTotalSupply)
    return wethShareOfBptStakedLockedAmount
  }

  async getShareOfCrvLockedInStaking() {
    const crvAddress = this.erc20TokensByNetwork.crv.erc20Address

    const crvErc20Contract = new this.web3.eth.Contract(erc20Json.abi, crvAddress)

    const crvStakedLockedAmount = await crvErc20Contract.methods
      .balanceOf(stakingV1.getAddress(this.network))
      .call()
    const crvTotalSupply = await crvErc20Contract.methods.totalSupply().call()

    // get a share of 3CRV tokens in staking contract compare to all exisiting 3CRV tokens
    const shareOfCrvLockedInStaking = new BigNumber(crvStakedLockedAmount).div(crvTotalSupply)
    return shareOfCrvLockedInStaking
  }

  async updateReservedData() {
    const result = []
    const tokenAddresses = this.iTokensByNetwork.map((x) => x.address)
    const swapRates = (
      await this.getSwapToUsdRateBatch(
        this.iTokensByNetwork.find((x) =>
          this.network === 'bsc' ? x.name === 'busd' : x.name === 'dai'
        )
      )
    )[0]
    const reserveData = await this.DappHeperContract.methods.reserveDetails(tokenAddresses).call()
    let usdTotalLockedAll = new BigNumber(0)
    let usdSupplyAll = new BigNumber(0)
    const stats = new statsModel()
    stats.date = new Date()
    stats.tokensStats = []
    stats.network = this.network
    const bzrxUsdPrice = new BigNumber(
      swapRates[this.iTokensByNetwork.map((x) => x.name).indexOf('bzrx')]
    ).dividedBy(10 ** 18)
    const ethUsdPrice = new BigNumber(
      swapRates[this.iTokensByNetwork.map((x) => x.name).indexOf('eth')]
    ).dividedBy(10 ** 18)
    const monthlyReward = new BigNumber(10300000).times(bzrxUsdPrice)

    if (reserveData && reserveData.totalAssetSupply.length > 0) {
      await Promise.all(
        this.iTokensByNetwork.map(async (token, i) => {
          let totalAssetSupply = new BigNumber(reserveData.totalAssetSupply[i])
          let totalAssetBorrow = new BigNumber(reserveData.totalAssetBorrow[i])
          const supplyInterestRate = new BigNumber(reserveData.supplyInterestRate[i])
          const borrowInterestRate = new BigNumber(reserveData[4][i])
          const torqueBorrowInterestRate = new BigNumber(reserveData.torqueBorrowInterestRate[i])
          let vaultBalance = new BigNumber(reserveData.vaultBalance[i])

          let marketLiquidity = totalAssetSupply.minus(totalAssetBorrow)

          const decimals = token.decimals
          let usdSupply = new BigNumber(0)
          let usdTotalLocked = new BigNumber(0)

          if (token.name === 'ethv1') {
            vaultBalance = await this.getAssetTokenBalanceOfUser(
              token.name,
              '0x8b3d70d628ebd30d4a2ea82db95ba2e906c71633'
            )
          }

          const precision = new BigNumber(10 ** (18 - decimals))
          totalAssetSupply = totalAssetSupply.times(precision)
          totalAssetBorrow = totalAssetBorrow.times(precision)
          marketLiquidity = marketLiquidity.times(precision)
          vaultBalance = vaultBalance.times(precision)
          if (token.name === 'bzrx' && this.network === 'eth') {
            const vbzrxAddress = this.erc20TokensByNetwork.vbzrx.erc20Address
            const vbzrxWorthPart = await this.getVbzrxWorthPart()
            const vbzrxProtocolLockedAmount = (
              await this.getErc20BalanceOfUser(vbzrxAddress, iBZx.getAddress(this.network))
            ).times(vbzrxWorthPart)
            const bzrxLockedInStaking = await this.getBzrxLockedInStaking()
            vaultBalance = vaultBalance.plus(vbzrxProtocolLockedAmount).plus(bzrxLockedInStaking)
          }
          if (token.name === 'eth' && this.network === 'eth') {
            const wethShareOfBptStakedLockedAmount = await this.getWethLockedInBptLockedInStaling()
            vaultBalance = vaultBalance.plus(wethShareOfBptStakedLockedAmount)
          }

          if (token.name === 'dai' && this.network === 'eth') {
            const shareOfCrvLockedInStaking = await this.getShareOfCrvLockedInStaking()
            // 3CRV swap contract
            const threePoolContract = new this.web3.eth.Contract(
              threePool.abi,
              threePool.getAddress(this.network)
            )

            // underlying DAI in 3CRV
            const underlyingDaiInCRV = await threePoolContract.methods
              .balances(new BigNumber(0))
              .call()
            const shareOfDaiInStakedCrv = new BigNumber(underlyingDaiInCRV)
              .times(precision)
              .times(shareOfCrvLockedInStaking)
            vaultBalance = vaultBalance.plus(shareOfDaiInStakedCrv)
          }
          if (token.name === 'usdc' && this.network === 'eth') {
            const shareOfCrvLockedInStaking = await this.getShareOfCrvLockedInStaking()
            // 3CRV swap contract
            const threePoolContract = new this.web3.eth.Contract(
              threePool.abi,
              threePool.getAddress(this.network)
            )

            // underlying USDC in 3CRV
            const underlyingUsdcInCRV = await threePoolContract.methods
              .balances(new BigNumber(1))
              .call()
            const shareOfUsdcInStakedCrv = new BigNumber(underlyingUsdcInCRV)
              .times(precision)
              .times(shareOfCrvLockedInStaking)
            vaultBalance = vaultBalance.plus(shareOfUsdcInStakedCrv)
          }
          if (token.name === 'usdt' && this.network === 'eth') {
            const shareOfCrvLockedInStaking = await this.getShareOfCrvLockedInStaking()
            // 3CRV swap contract
            const threePoolContract = new this.web3.eth.Contract(
              threePool.abi,
              threePool.getAddress(this.network)
            )

            // underlying USDT in 3CRV
            const underlyingUsdtInCRV = await threePoolContract.methods
              .balances(new BigNumber(2))
              .call()
            const shareOfUsdtInStakedCrv = new BigNumber(underlyingUsdtInCRV)
              .times(precision)
              .times(shareOfCrvLockedInStaking)
            vaultBalance = vaultBalance.plus(shareOfUsdtInStakedCrv)
          }

          if (swapRates[i]) {
            usdSupply = totalAssetSupply.times(swapRates[i]).dividedBy(10 ** 18)
            usdSupplyAll = usdSupplyAll.plus(usdSupply)

            usdTotalLocked = marketLiquidity
              .plus(vaultBalance)
              .times(swapRates[i])
              .dividedBy(10 ** 18)
            usdTotalLockedAll = usdTotalLockedAll.plus(usdTotalLocked)
          }

          // const totalBorrowUSD = totalAssetBorrow.dividedBy(10 ** 18).times(new BigNumber(swapRates[i]).dividedBy(10 ** 18))
          // const fees = totalBorrowUSD.times(0.09/100);
          // const rebate = fees.div(2);
          // const borrowCost = totalBorrowUSD.times(borrowInterestRate.dividedBy(10 ** 20).div(12))
          // const reward = rebate.plus(monthlyReward);
          // const yieldMonthlyRate = (reward.minus(borrowCost)).div(totalBorrowUSD);
          // const yieldYearlyPercents = yieldMonthlyRate.times(12).times(100)

          stats.tokensStats.push(
            new tokenStatsModel({
              address: token.address.toLowerCase(),
              network: this.network,
              token: token.name,
              liquidity: marketLiquidity.dividedBy(10 ** 18).toFixed(),
              totalSupply: totalAssetSupply.dividedBy(10 ** 18).toFixed(),
              totalBorrow: totalAssetBorrow.dividedBy(10 ** 18).toFixed(),
              supplyInterestRate: supplyInterestRate.dividedBy(10 ** 18).toFixed(),
              borrowInterestRate: borrowInterestRate.dividedBy(10 ** 18).toFixed(),
              torqueBorrowInterestRate: torqueBorrowInterestRate.dividedBy(10 ** 18).toFixed(),
              vaultBalance: vaultBalance.dividedBy(10 ** 18).toFixed(),
              swapRates: swapRates[i],
              lockedAssets: vaultBalance.dividedBy(10 ** 18).toFixed(),
              swapToUSDPrice: new BigNumber(swapRates[i]).dividedBy(10 ** 18).toFixed(),
              usdSupply: usdSupply.dividedBy(10 ** 18).toFixed(),
              usdTotalLocked: usdTotalLocked.dividedBy(10 ** 18).toFixed(),
              yieldFarmingAPR: new BigNumber(0),
            })
          )
        })
      )

      let totalBorrowAmountAllAssetsUsd = new BigNumber(0)

      // collecting total asset borrow and interest fees for all assets
      stats.tokensStats.forEach((tokenStat) => {
        const totalAssetBorrowUSD = new BigNumber(tokenStat.totalBorrow).times(
          new BigNumber(tokenStat.swapToUSDPrice)
        )
        totalBorrowAmountAllAssetsUsd = totalBorrowAmountAllAssetsUsd.plus(totalAssetBorrowUSD)
      })

      stats.tokensStats.forEach((tokenStat) => {
        let totalBorrowUSD = new BigNumber(tokenStat.totalBorrow).times(
          new BigNumber(tokenStat.swapToUSDPrice)
        )
        if (totalBorrowUSD.eq(0)) totalBorrowUSD = new BigNumber(1)
        const fees = totalBorrowUSD.times(0.09 / 100)
        const rebate = fees.div(2)
        const monthlyRewardPerToken = totalBorrowUSD
          .div(totalBorrowAmountAllAssetsUsd)
          .times(monthlyReward)

        const reward = rebate.plus(monthlyRewardPerToken)
        const yieldMonthlyRate = reward.div(totalBorrowUSD)
        const yieldYearlyPercents = yieldMonthlyRate.times(12).times(100).div(2)

        tokenStat.yieldFarmingAPR =
          isNaN(yieldYearlyPercents.toFixed()) || yieldYearlyPercents.toFixed() === 'Infinity'
            ? '0'
            : yieldYearlyPercents.toFixed()
      })

      stats.allTokensStats = new allTokensStatsModel({
        network: this.network,
        token: 'all',
        usdSupply: usdSupplyAll.dividedBy(10 ** 18).toFixed(),
        usdTotalLocked: usdTotalLockedAll.dividedBy(10 ** 18).toFixed(),
      })
      await stats.save()
    }

    const pricesByAddress = stats.tokensStats.reduce((result, model) => {
      result[model.address.toLowerCase()] = model.swapToUSDPrice
      return result
    }, {})

    await this.updateMasterChefStats(stats.date, pricesByAddress)
    return result
  }

  async updateMasterChefStats(date, pricesByAddress) {
    if (this.network === 'bsc') {
      const currentBlockNumber = await this.web3.eth.getBlock('latest').then((resp) => resp.number)
      const helperContract = new this.web3.eth.Contract(
        HelperImpl.abi,
        HelperImpl.getAddress(this.network)
      )
      const masterchefAddress = Masterchef.getAddress(this.network)
      const masterChef = new this.web3.eth.Contract(Masterchef.abi, masterchefAddress)
      const poolLength = await masterChef.methods.poolLength().call()
      const poolInfos = await masterChef.methods.getPoolInfos().call()
      const totalAllocPoint = await masterChef.methods.totalAllocPoint().call()
      const bgovPerBlock = new BigNumber(await masterChef.methods.BGOVPerBlock().call()).div(
        10 ** 18
      )
      const bgovAddress = await masterChef.methods.BGOV().call()
      const pkRouter = new this.web3.eth.Contract(
        IPancakeRouter02.abi,
        IPancakeRouter02.getAddress(this.network)
      )
      const bgov_wbnbAddress = IPancakePair.getAddress(this.network, 'bgov_wbnb').address
      const usdtAddress = this.iTokensByNetwork.find((token) => token.name === 'usdt').erc20Address
      const wbnbAddress = this.iTokensByNetwork.find((token) => token.name === 'bnb').erc20Address
      const lp = new this.web3.eth.Contract(IPancakePair.abi, bgov_wbnbAddress)

      const lpTotalSuply = await lp.methods.totalSupply().call()
      const lpReserves = await lp.methods.getReserves().call()

      const [
        amountOut,
        bgovPriceEth,
        bgovPriceUsdt,
      ] = await pkRouter.methods
        .getAmountsOut(new BigNumber(10 ** 18), [bgovAddress, wbnbAddress, usdtAddress])
        .call()

      const wbnbPriceUsdt = bgovPriceUsdt / bgovPriceEth
      const lpUsdtVolume0 = (lpReserves.reserve0 / 10 ** 18) * wbnbPriceUsdt
      const lpUsdtVolume1 = (lpReserves.reserve1 / 10 ** 18) * (bgovPriceUsdt / 10 ** 18)
      const wbnb_bgovPrice = (lpUsdtVolume0 + lpUsdtVolume1) / (lpTotalSuply / 10 ** 18)

      const blocksPerYear = (60 * 60 * 24 * 365) / this.avgBlockTime
      const poolAddresses = poolInfos.map((pool) => pool.lpToken.toLowerCase())
      const totalStakedBalances = await helperContract.methods
        .balanceOf(poolAddresses, masterchefAddress)
        .call()

      const poolsInfoModel = new MasterChefPoolsInfoModel()
      poolsInfoModel.date = date
      poolsInfoModel.pools = []
      poolsInfoModel.network = this.network
      poolsInfoModel.totalAllocPoint = totalAllocPoint
      poolsInfoModel.bgovPerBlock = bgovPerBlock
      poolsInfoModel.blocksPerYear = blocksPerYear
      poolsInfoModel.bgovAddress = bgovAddress
      poolsInfoModel.poolLength = poolLength
      poolsInfoModel.bgovPrice = new BigNumber(bgovPriceUsdt).div(10 ** 18)

      for (let i = 0; i < poolInfos.length; i++) {
        const poolInfo = poolInfos[i]

        const bgovForPoolPerYear = new BigNumber(poolInfo.allocPoint)
          .div(totalAllocPoint)
          .times(bgovPerBlock)
          .times(blocksPerYear)
          .times(currentBlockNumber < 6774870 ? 10 : 1)

        let lpPrice = pricesByAddress[poolInfo.lpToken.toLowerCase()]
        if (!lpPrice) {
          if (poolInfo.lpToken.toLowerCase() === bgovAddress.toLowerCase()) {
            lpPrice = poolsInfoModel.bgovPrice
          } else if (poolInfo.lpToken.toLowerCase() === bgov_wbnbAddress.toLowerCase()) {
            lpPrice = wbnb_bgovPrice
          }
        }

        const totalStakedUsd = new BigNumber(totalStakedBalances[i]).times(lpPrice).div(10 ** 18)
        const apr = bgovForPoolPerYear
          .times(poolsInfoModel.bgovPrice)
          .div(totalStakedUsd)
          .times(100)

        const poolInfoModel = new MasterChefPoolInfoModel()
        poolInfoModel.network = this.network
        poolInfoModel.lpToken = poolInfo.lpToken
        poolInfoModel.allocPoint = poolInfo.allocPoint
        poolInfoModel.lastRewardBlock = poolInfo.lastRewardBlock
        poolInfoModel.accBGOVPerShare = poolInfo.accBGOVPerShare
        poolInfoModel.tokenPriceUSD = lpPrice
        poolInfoModel.usdTotalLocked = totalStakedUsd
        poolInfoModel.apr = apr
        poolInfoModel.stakedVolume = new BigNumber(totalStakedBalances[i]).div(10 ** 18)

        poolsInfoModel.pools.push(poolInfoModel)
      }
      await poolsInfoModel.save()
    }
  }

  async getAssetTokenBalanceOfUser(asset, account) {
    let result = new BigNumber(0)
    const token = this.iTokensByNetwork.find((x) => x.name === asset)
    const precision = token.decimals || 18
    const assetErc20Address = token.erc20Address
    if (assetErc20Address) {
      result = await this.getErc20BalanceOfUser(assetErc20Address, account)
      result = result.times(10 ** (18 - precision))
    }
    return result
  }

  async getErc20BalanceOfUser(addressErc20, account) {
    let result = new BigNumber(0)
    const tokenContract = new this.web3.eth.Contract(erc20Json.abi, addressErc20)
    if (tokenContract) {
      result = new BigNumber(await tokenContract.methods.balanceOf(account).call())
    }
    return result
  }

  getGoodSourceAmountOfAsset(assetName) {
    switch (assetName) {
      case 'wbtc':
        return new BigNumber(10 ** 6)
      case 'usdc':
        return new BigNumber(10 ** 4)
      case 'usdt':
        return new BigNumber(10 ** 4)
      default:
        return new BigNumber(10 ** 16)
    }
  }

  async getSwapToUsdRateBatch(usdToken) {
    let result = []
    const usdTokenAddress = usdToken.erc20Address
    const underlyings = this.iTokensByNetwork.map((e) => e.erc20Address)
    const amounts = this.iTokensByNetwork.map((e) =>
      this.getGoodSourceAmountOfAsset(e.name).toFixed()
    )

    result = await this.DappHeperContract.methods
      .assetRates(usdTokenAddress, underlyings, amounts)
      .call()

    return result
  }

  async getMasterchefStats() {
    const result = await MasterChefPoolsInfoModel.find({
      $or: this.networkFilter,
    })
      .sort({ _id: -1 })
      .lean()
      .limit(1)

    if (!result) {
      return {}
    }
    return result[0]
  }
}
