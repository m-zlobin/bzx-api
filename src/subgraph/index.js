import fetch from 'node-fetch';
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import gql from "graphql-tag";
import BigNumber from 'bignumber.js';
import erc20Tokens from '../config/erc20Tokens';
import { iTokens } from '../config/iTokens';
import { iTokenJson } from '../contracts/iTokenContract';
import { BPoolJson } from '../contracts/BPool';

const VBZRX_START_STAMP = 1610416800;
const VBZRX_END_STAMP = 1720792800;
const STAK_START_DAY = 18656;


export default class Subgraph {

  constructor(web3, logger, config) {
    this.web3 = web3
    this.logger = logger
    this.kyber_api_pairs_url = config.kyber_api_pairs_url

    this.graphQlClient = new ApolloClient({
      link: new HttpLink({ uri: config.thegraph_api_url, fetch }),
      cache: new InMemoryCache()
    });

  }

  async getStakingPoolsInfo() {
    const ibzrx = iTokens.find(token => token.name === 'bzrx').address;
    const bzrx = erc20Tokens.bzrx.erc20Address.toLowerCase();
    const vbzrx = erc20Tokens.vbzrx.erc20Address.toLowerCase();
    const bpt = erc20Tokens.bpt.erc20Address.toLowerCase();
    const weth = erc20Tokens.weth.erc20Address.toLowerCase();

    const now = Math.floor(new Date().getTime() / (1000 * 86400)); //Current day

    const fees = await this.getFeesStats(now - 365);
    const staking = await this.getStakingStats();
    const kyberPrices = await this.getCurrentKyberEthPrices();
    if (!kyberPrices) {
      this.logger.error("Missing Kyber prices");
      return null;
    }
    if (!staking) {
      this.logger.error("Missing staking stats");
      return null;
    }
    if (!fees) {
      this.logger.error("Missing fees stats");
      return null;
    }

    const prices = Object.values(kyberPrices).reduce(function (map, obj) {
      map[obj.contractAddress] = obj;
      return map;
    }, {});

    let totalFeesEth = new BigNumber(0);

    const bzrxDecimals = prices[bzrx].decimals;
    fees.forEach(fee => {
      const token = fee.token;
      if (!prices[token]) return;

      const totalFees =
        new BigNumber(fee.payLendingFeeVolume)
          .plus(new BigNumber(fee.settleFeeRewardForInterestExpenseVolume))
          .plus(new BigNumber(fee.payTradingFeeVolume))
          .plus(new BigNumber(fee.payBorrowingFeeVolume))
          .plus(new BigNumber(fee.earnRewardVolume))
          .plus(new BigNumber(fee.withdrawLendingFeesSenderVolume))
          .plus(new BigNumber(fee.withdrawTradingFeesSenderVolume))
          .plus(new BigNumber(fee.withdrawBorrowingFeesSenderVolume))

          .multipliedBy(prices[token].lastPrice)
          .div(new BigNumber(10 ** prices[token].decimals))
        ;
      totalFeesEth = totalFeesEth.plus(totalFees);
    });

    const staked = staking.reduce(function (map, obj) {
      const token = obj.token;
      map[token] = {
        'volume': new BigNumber(obj.stakeAmountVolume).minus(new BigNumber(obj.unstakeAmountVolume))
          .div(10 ** bzrxDecimals).toNumber()
      }
      return map;
    }, {});

    const ibzrxContract = new this.web3.eth.Contract(iTokenJson.abi, ibzrx)
    const ibzrxPrice = await ibzrxContract.methods
      .tokenPrice()
      .call()

    //Pool rates agains bzrx pool
    const rates = this.calculateLRates(
      staked[bzrx].volume,
      staked[ibzrx].volume,
      staked[vbzrx].volume,
      staked[bpt].volume,
      ibzrxPrice / (10 ** bzrxDecimals)
    );

    const totalStaked = staked[bzrx].volume * rates[0]
      + staked[ibzrx].volume * rates[1]
      + staked[vbzrx].volume * rates[2]
      + staked[bpt].volume * rates[3]

    staked[bzrx].ratio = staked[bzrx].volume * rates[0] / totalStaked;
    staked[ibzrx].ratio = staked[ibzrx].volume * rates[1] / totalStaked;
    staked[vbzrx].ratio = staked[vbzrx].volume * rates[2] / totalStaked;
    staked[bpt].ratio = staked[bpt].volume * rates[3] / totalStaked;

    const bptMarketPrice = await this.getBptMarketPrice(prices[weth].currentPrice, prices[bzrx].currentPrice);
    const vbzrxMarketPrice = await this.getVbzrxMarketPrice(prices) / bzrxDecimals;

    staked[bzrx].priceEth = prices[bzrx].lastPrice;
    staked[ibzrx].priceEth = prices[bzrx].lastPrice * rates[1];
    staked[vbzrx].priceEth = vbzrxMarketPrice;
    staked[bpt].priceEth = bptMarketPrice;

    //Only half of profit goes to staking rewards
    totalFeesEth = totalFeesEth.toNumber() / 2;
    staked[bzrx].apr = this.getApr(totalFeesEth, staked[bzrx].volume, staked[bzrx].ratio, staked[bzrx].priceEth);
    staked[ibzrx].apr = this.getApr(totalFeesEth, staked[ibzrx].volume, staked[ibzrx].ratio, staked[ibzrx].priceEth);
    staked[vbzrx].apr = this.getApr(totalFeesEth, staked[vbzrx].volume, staked[vbzrx].ratio, staked[vbzrx].priceEth);
    staked[bpt].apr = this.getApr(totalFeesEth, staked[bpt].volume, staked[bpt].ratio, staked[bpt].priceEth);
    return staked
  }

  getApr(fees, volume, poolRate, price) {
    return 100 * (fees * poolRate) / (volume * price)
  }


  async getVbzrxMarketPrice() {
    const balancerPooll = new this.web3.eth.Contract(BPoolJson.abi, "0x753f64a1447228bb800336569d98e11e94b0d0d2")
    const spotPrice = await balancerPooll.methods
      .getSpotPriceSansFee(erc20Tokens.weth.erc20Address, erc20Tokens.vbzrx.erc20Address)
      .call()

    return spotPrice;
  }

  //BPT Price from balancer pool
  async getBptMarketPrice(wethPrice, bzrxPrice) {
    const bzrxContract = new this.web3.eth.Contract(pTokenJson.abi, erc20Tokens.bzrx.erc20Address)
    const bzrxPoolBalance = await bzrxContract.methods
      .balanceOf(erc20Tokens.bpt.erc20Address)
      .call()

    const bptContract = new this.web3.eth.Contract(pTokenJson.abi, erc20Tokens.bpt.erc20Address)
    const bptTotalSupply = await bptContract.methods
      .totalSupply()
      .call()

    const wethContract = new this.web3.eth.Contract(pTokenJson.abi, erc20Tokens.weth.erc20Address)
    const wethPoolBalance = await wethContract.methods
      .balanceOf(erc20Tokens.bpt.erc20Address)
      .call()

    return (wethPrice * wethPoolBalance + bzrxPrice * bzrxPoolBalance)
      / bptTotalSupply;

  }
  async getCurrentKyberEthPrices() {
    this.logger.info("Getting kyber current prices");
    let response = await fetch(this.kyber_api_pairs_url)
    let currentPrices = response.json()

    return currentPrices;
  }



  async getFeesStats(from) {
    this.logger.info("Getting subgraph feesStats");
    const endResult = await this.graphQlClient
      .query({
        query: gql`
        {
          feesStats(where: {
            type: T,
            user: null
        }
            ){
            date
            type
            token
            payLendingFeeVolume
            settleFeeRewardForInterestExpenseVolume
            payTradingFeeVolume
            payBorrowingFeeVolume
            earnRewardVolume
            withdrawLendingFeesSenderVolume
            withdrawTradingFeesSenderVolume
            withdrawBorrowingFeesSenderVolume
          }  
        }
        `
      });
    ;

    const result = [];
    const tokens = endResult.data.feesStats.map(s => s.token);
    for (let index = 0; index < tokens.length; index++) {
      const token = tokens[index];
      const startResult = await this.graphQlClient
        .query({
          query: gql`
        {
          feesStats(where: {
            type: A,
            user: null,
            token: "${token}",
            date_gte: ${from}
        },
        orderBy: date,
        first: 1
            ){
            date
            payLendingFeeVolume
            settleFeeRewardForInterestExpenseVolume
            payTradingFeeVolume
            payBorrowingFeeVolume
            earnRewardVolume
            withdrawLendingFeesSenderVolume
            withdrawTradingFeesSenderVolume
            withdrawBorrowingFeesSenderVolume
          }  
        }
        `
        });
      if (startResult.data.feesStats) {
        startResult.data.feesStats.forEach(fees => {
          result.push(
            {
              token: token,
              payLendingFeeVolume: endResult.data.feesStats[index].payLendingFeeVolume - fees.payLendingFeeVolume,
              settleFeeRewardForInterestExpenseVolume: endResult.data.feesStats[index].settleFeeRewardForInterestExpenseVolume - fees.settleFeeRewardForInterestExpenseVolume,
              payTradingFeeVolume: endResult.data.feesStats[index].payTradingFeeVolume - fees.payTradingFeeVolume,
              payBorrowingFeeVolume: endResult.data.feesStats[index].payBorrowingFeeVolume - fees.payBorrowingFeeVolume,
              earnRewardVolume: endResult.data.feesStats[index].earnRewardVolume - fees.earnRewardVolume,
              withdrawLendingFeesSenderVolume: endResult.data.feesStats[index].withdrawLendingFeesSenderVolume - fees.withdrawLendingFeesSenderVolume,
              withdrawTradingFeesSenderVolume: endResult.data.feesStats[index].withdrawTradingFeesSenderVolume - fees.withdrawTradingFeesSenderVolume,
              withdrawBorrowingFeesSenderVolume: endResult.data.feesStats[index].withdrawBorrowingFeesSenderVolume - fees.withdrawBorrowingFeesSenderVolume
            }
          );
        })
      }
      else {
        result.push(endResult.data.feesStats[index]);
      }
    }

    return result;
  }

  async getStakingStats() {
    this.logger.info("Getting staking stats");

    const result = await this.graphQlClient
      .query({
        query: gql`
                {
                  tokenStakingStats(where: {
                  type: T,
                  user: null
              }
                  ){
                  date
                  type
                  token
                  stakeAmountVolume
                  unstakeAmountVolume
                }  
              }
        `
      });
    return result.data.tokenStakingStats;
  }

  calculateLRates(stakedBzrx, stakedIBzrx, stakedVBzrx, stakedBpt, iBxrzPrice) {

    let now = new Date();
    let bzrxPerMs = 1 / ((VBZRX_END_STAMP - VBZRX_START_STAMP))
    let bzrxPerVbzrx = 1 - (now.getTime() / 1000 - VBZRX_START_STAMP) * bzrxPerMs;
    let stakedBzrxPrice = stakedIBzrx * iBxrzPrice;
    let stakedVbzrxPrice = stakedVBzrx * bzrxPerVbzrx;

    let totalStakedBzrx = stakedBzrx + stakedBzrxPrice + stakedVbzrxPrice;
    return [1, new BigNumber(iBxrzPrice).toNumber(), bzrxPerVbzrx, totalStakedBzrx / stakedBpt]
  }

}
