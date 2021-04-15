const addresses = {
    bsc: '0x05fF2B0DB69458A0750badebc4f9e13aDd608C7F'
}

const abi = [
    {
      inputs: [
        {
          name: '_factory',
          type: 'address',
        },
        {
          name: '_WETH',
          type: 'address',
        },
      ],
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'constructor',
    },
    {
      inputs: [],
      name: 'WETH',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'tokenA',
          type: 'address',
        },
        {
          name: 'tokenB',
          type: 'address',
        },
        {
          name: 'amountADesired',
          type: 'uint256',
        },
        {
          name: 'amountBDesired',
          type: 'uint256',
        },
        {
          name: 'amountAMin',
          type: 'uint256',
        },
        {
          name: 'amountBMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'addLiquidity',
      outputs: [
        {
          name: 'amountA',
          type: 'uint256',
        },
        {
          name: 'amountB',
          type: 'uint256',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'amountTokenDesired',
          type: 'uint256',
        },
        {
          name: 'amountTokenMin',
          type: 'uint256',
        },
        {
          name: 'amountETHMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'addLiquidityETH',
      outputs: [
        {
          name: 'amountToken',
          type: 'uint256',
        },
        {
          name: 'amountETH',
          type: 'uint256',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
      ],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [],
      name: 'factory',
      outputs: [
        {
          name: '',
          type: 'address',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOut',
          type: 'uint256',
        },
        {
          name: 'reserveIn',
          type: 'uint256',
        },
        {
          name: 'reserveOut',
          type: 'uint256',
        },
      ],
      name: 'getAmountIn',
      outputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
        {
          name: 'reserveIn',
          type: 'uint256',
        },
        {
          name: 'reserveOut',
          type: 'uint256',
        },
      ],
      name: 'getAmountOut',
      outputs: [
        {
          name: 'amountOut',
          type: 'uint256',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOut',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
      ],
      name: 'getAmountsIn',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
      ],
      name: 'getAmountsOut',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'view',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountA',
          type: 'uint256',
        },
        {
          name: 'reserveA',
          type: 'uint256',
        },
        {
          name: 'reserveB',
          type: 'uint256',
        },
      ],
      name: 'quote',
      outputs: [
        {
          name: 'amountB',
          type: 'uint256',
        },
      ],
      stateMutability: 'pure',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'tokenA',
          type: 'address',
        },
        {
          name: 'tokenB',
          type: 'address',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
        {
          name: 'amountAMin',
          type: 'uint256',
        },
        {
          name: 'amountBMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'removeLiquidity',
      outputs: [
        {
          name: 'amountA',
          type: 'uint256',
        },
        {
          name: 'amountB',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
        {
          name: 'amountTokenMin',
          type: 'uint256',
        },
        {
          name: 'amountETHMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'removeLiquidityETH',
      outputs: [
        {
          name: 'amountToken',
          type: 'uint256',
        },
        {
          name: 'amountETH',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
        {
          name: 'amountTokenMin',
          type: 'uint256',
        },
        {
          name: 'amountETHMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'removeLiquidityETHSupportingFeeOnTransferTokens',
      outputs: [
        {
          name: 'amountETH',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
        {
          name: 'amountTokenMin',
          type: 'uint256',
        },
        {
          name: 'amountETHMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
        {
          name: 'approveMax',
          type: 'bool',
        },
        {
          name: 'v',
          type: 'uint8',
        },
        {
          name: 'r',
          type: 'bytes32',
        },
        {
          name: 's',
          type: 'bytes32',
        },
      ],
      name: 'removeLiquidityETHWithPermit',
      outputs: [
        {
          name: 'amountToken',
          type: 'uint256',
        },
        {
          name: 'amountETH',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'token',
          type: 'address',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
        {
          name: 'amountTokenMin',
          type: 'uint256',
        },
        {
          name: 'amountETHMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
        {
          name: 'approveMax',
          type: 'bool',
        },
        {
          name: 'v',
          type: 'uint8',
        },
        {
          name: 'r',
          type: 'bytes32',
        },
        {
          name: 's',
          type: 'bytes32',
        },
      ],
      name: 'removeLiquidityETHWithPermitSupportingFeeOnTransferTokens',
      outputs: [
        {
          name: 'amountETH',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'tokenA',
          type: 'address',
        },
        {
          name: 'tokenB',
          type: 'address',
        },
        {
          name: 'liquidity',
          type: 'uint256',
        },
        {
          name: 'amountAMin',
          type: 'uint256',
        },
        {
          name: 'amountBMin',
          type: 'uint256',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
        {
          name: 'approveMax',
          type: 'bool',
        },
        {
          name: 'v',
          type: 'uint8',
        },
        {
          name: 'r',
          type: 'bytes32',
        },
        {
          name: 's',
          type: 'bytes32',
        },
      ],
      name: 'removeLiquidityWithPermit',
      outputs: [
        {
          name: 'amountA',
          type: 'uint256',
        },
        {
          name: 'amountB',
          type: 'uint256',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOut',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapETHForExactTokens',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOutMin',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapExactETHForTokens',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOutMin',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
      outputs: [],
      stateMutability: 'payable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
        {
          name: 'amountOutMin',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapExactTokensForETH',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
        {
          name: 'amountOutMin',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
        {
          name: 'amountOutMin',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapExactTokensForTokens',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountIn',
          type: 'uint256',
        },
        {
          name: 'amountOutMin',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapExactTokensForTokensSupportingFeeOnTransferTokens',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOut',
          type: 'uint256',
        },
        {
          name: 'amountInMax',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapTokensForExactETH',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [
        {
          name: 'amountOut',
          type: 'uint256',
        },
        {
          name: 'amountInMax',
          type: 'uint256',
        },
        {
          name: 'path',
          type: 'address[]',
        },
        {
          name: 'to',
          type: 'address',
        },
        {
          name: 'deadline',
          type: 'uint256',
        },
      ],
      name: 'swapTokensForExactTokens',
      outputs: [
        {
          name: 'amounts',
          type: 'uint256[]',
        },
      ],
      stateMutability: 'nonpayable',
      type: 'function',
    },
    {
      inputs: [],
      outputs: [],
      stateMutability: 'payable',
      type: 'receive',
    },
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