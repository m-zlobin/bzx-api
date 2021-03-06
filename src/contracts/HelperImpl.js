const addresses = {
  bsc: '0xE05999ACcb887D32c9bd186e8C9dfE0e1E7814dE',
  eth: '0xFad79f3922cCef7AeB8A5674f36E45B6E81A10C7'
}
const abi = [
  {
      'anonymous': false,
      'inputs': [
          {
              'indexed': true,
              'internalType': "address",
              'name': "previousOwner",
              'type': "address"
          },
          {
              'indexed': true,
              'internalType': "address",
              'name': "newOwner",
              'type': "address"
          }
      ],
      'name': "OwnershipTransferred",
      'type': "event"
  },
  {
      'inputs': [
          {
              'internalType': "contract IERC20[]",
              'name': "tokens",
              'type': "address[]"
          },
          {
              'internalType': "address",
              'name': "owner",
              'type': "address"
          },
          {
              'internalType': "address",
              'name': "spender",
              'type': "address"
          }
      ],
      'name': "allowance",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "allowances",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IToken[]",
              'name': "tokens",
              'type': "address[]"
          },
          {
              'internalType': "address",
              'name': "wallet",
              'type': "address"
          }
      ],
      'name': "assetBalanceOf",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "balances",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IERC20[]",
              'name': "tokens",
              'type': "address[]"
          },
          {
              'internalType': "address",
              'name': "wallet",
              'type': "address"
          }
      ],
      'name': "balanceOf",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "balances",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IToken[]",
              'name': "tokens",
              'type': "address[]"
          }
      ],
      'name': "borrowInterestRate",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "rates",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IToken[]",
              'name': "tokens",
              'type': "address[]"
          }
      ],
      'name': "marketLiquidity",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "liquidity",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [],
      'name': "owner",
      'outputs': [
          {
              'internalType': "address",
              'name': "",
              'type': "address"
          }
      ],
      'stateMutability': "view",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IToken[]",
              'name': "tokens",
              'type': "address[]"
          },
          {
              'internalType': "address",
              'name': "wallet",
              'type': "address"
          }
      ],
      'name': "profitOf",
      'outputs': [
          {
              'internalType': "int256[]",
              'name': "profits",
              'type': "int256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [],
      'name': "renounceOwnership",
      'outputs': [],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IToken[]",
              'name': "tokens",
              'type': "address[]"
          }
      ],
      'name': "supplyInterestRate",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "rates",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IToken[]",
              'name': "tokens",
              'type': "address[]"
          }
      ],
      'name': "tokenPrice",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "prices",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "contract IERC20[]",
              'name': "tokens",
              'type': "address[]"
          }
      ],
      'name': "totalSupply",
      'outputs': [
          {
              'internalType': "uint256[]",
              'name': "totalSupply",
              'type': "uint256[]"
          }
      ],
      'stateMutability': "nonpayable",
      'type': "function"
  },
  {
      'inputs': [
          {
              'internalType': "address",
              'name': "newOwner",
              'type': "address"
          }
      ],
      'name': "transferOwnership",
      'outputs': [],
      'stateMutability': "nonpayable",
      'type': "function"
  }
]

export default {
  getAddress: (network) => {
    if (!addresses[network]) {
      throw new Error('Contract address not found')
    }
    return addresses[network]
  },
  abi: abi,
}
