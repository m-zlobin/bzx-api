const mainnetAddress = '0x5AbC9e082Bf6e4F930Bbc79742DA3f6259c4aD1d'
const addresses = {
  eth: mainnetAddress,
  bsc: '0x43ccac29802332e1fd3a41264ddbe34ce3073a88',
}

const oracleJson = {
  contractName: 'PriceFeeds',
  abi: [
    {
      inputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'sender',
          type: 'address',
        },
        {
          indexed: false,
          internalType: 'bool',
          name: 'isPaused',
          type: 'bool',
        },
      ],
      name: 'GlobalPricingPaused',
      type: 'event',
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: 'address',
          name: 'previousOwner',
          type: 'address',
        },
        {
          indexed: true,
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'OwnershipTransferred',
      type: 'event',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'tokenAddress',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'amount',
          type: 'uint256',
        },
      ],
      name: 'amountInEth',
      outputs: [
        {
          internalType: 'uint256',
          name: 'ethAmount',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'bzrxTokenAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'destToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'sourceAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'destAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'maxSlippage',
          type: 'uint256',
        },
      ],
      name: 'checkPriceDisagreement',
      outputs: [
        {
          internalType: 'uint256',
          name: 'sourceToDestSwapRate',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'decimals',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'loanToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'collateralToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'loanAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralAmount',
          type: 'uint256',
        },
      ],
      name: 'getCurrentMargin',
      outputs: [
        {
          internalType: 'uint256',
          name: 'currentMargin',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralToLoanRate',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'loanToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'collateralToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'loanAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralAmount',
          type: 'uint256',
        },
      ],
      name: 'getCurrentMarginAndCollateralSize',
      outputs: [
        {
          internalType: 'uint256',
          name: 'currentMargin',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralInEthAmount',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'payToken',
          type: 'address',
        },
      ],
      name: 'getFastGasPrice',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'loanToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'collateralToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'loanAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'margin',
          type: 'uint256',
        },
      ],
      name: 'getMaxDrawdown',
      outputs: [
        {
          internalType: 'uint256',
          name: 'maxDrawdown',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'globalPricingPaused',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'isOwner',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'owner',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      name: 'pricesFeeds',
      outputs: [
        {
          internalType: 'contract IPriceFeedsExt',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'destToken',
          type: 'address',
        },
      ],
      name: 'queryPrecision',
      outputs: [
        {
          internalType: 'uint256',
          name: '',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'destToken',
          type: 'address',
        },
      ],
      name: 'queryRate',
      outputs: [
        {
          internalType: 'uint256',
          name: 'rate',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'precision',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'sourceToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'destToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'sourceAmount',
          type: 'uint256',
        },
      ],
      name: 'queryReturn',
      outputs: [
        {
          internalType: 'uint256',
          name: 'destAmount',
          type: 'uint256',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'contract IERC20[]',
          name: 'tokens',
          type: 'address[]',
        },
      ],
      name: 'setDecimals',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'bool',
          name: 'isPaused',
          type: 'bool',
        },
      ],
      name: 'setGlobalPricingPaused',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address[]',
          name: 'tokens',
          type: 'address[]',
        },
        {
          internalType: 'contract IPriceFeedsExt[]',
          name: 'feeds',
          type: 'address[]',
        },
      ],
      name: 'setPriceFeed',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [
        {
          internalType: 'address',
          name: 'loanToken',
          type: 'address',
        },
        {
          internalType: 'address',
          name: 'collateralToken',
          type: 'address',
        },
        {
          internalType: 'uint256',
          name: 'loanAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'collateralAmount',
          type: 'uint256',
        },
        {
          internalType: 'uint256',
          name: 'maintenanceMargin',
          type: 'uint256',
        },
      ],
      name: 'shouldLiquidate',
      outputs: [
        {
          internalType: 'bool',
          name: '',
          type: 'bool',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        {
          internalType: 'address',
          name: 'newOwner',
          type: 'address',
        },
      ],
      name: 'transferOwnership',
      outputs: [],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'vbzrxTokenAddress',
      outputs: [
        {
          internalType: 'address',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: true,
      inputs: [],
      name: 'wethToken',
      outputs: [
        {
          internalType: 'contract IWethERC20',
          name: '',
          type: 'address',
        },
      ],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
  ],
}
export default {
  getAddress: (network) => {
    if (!addresses[network]) {
      throw new Error('Contract address not found')
    }
    return addresses[network]
  },
  abi: oracleJson.abi,
}
