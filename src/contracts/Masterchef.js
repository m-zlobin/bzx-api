const addresses = {
    bsc: '0x1FDCA2422668B961E162A8849dc0C2feaDb58915'
}

const abi = [
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': "address",
                'name': "user",
                'type': "address"
            },
            {
                'indexed': true,
                'internalType': "uint256",
                'name': "pid",
                'type': "uint256"
            },
            {
                'indexed': false,
                'internalType': "uint256",
                'name': "amount",
                'type': "uint256"
            }
        ],
        'name': "Deposit",
        'type': "event"
    },
    {
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': "address",
                'name': "user",
                'type': "address"
            },
            {
                'indexed': true,
                'internalType': "uint256",
                'name': "pid",
                'type': "uint256"
            },
            {
                'indexed': false,
                'internalType': "uint256",
                'name': "amount",
                'type': "uint256"
            }
        ],
        'name': "EmergencyWithdraw",
        'type': "event"
    },
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
        'anonymous': false,
        'inputs': [
            {
                'indexed': true,
                'internalType': "address",
                'name': "user",
                'type': "address"
            },
            {
                'indexed': true,
                'internalType': "uint256",
                'name': "pid",
                'type': "uint256"
            },
            {
                'indexed': false,
                'internalType': "uint256",
                'name': "amount",
                'type': "uint256"
            }
        ],
        'name': "Withdraw",
        'type': "event"
    },
    {
        'inputs': [],
        'name': "BGOV",
        'outputs': [
            {
                'internalType': "contract BGovToken",
                'name': "",
                'type': "address"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "BGOVPerBlock",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "BONUS_MULTIPLIER",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_allocPoint",
                'type': "uint256"
            },
            {
                'internalType': "contract IERC20",
                'name': "_lpToken",
                'type': "address"
            },
            {
                'internalType': "bool",
                'name': "_withUpdate",
                'type': "bool"
            }
        ],
        'name': "add",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "bonusEndBlock",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            }
        ],
        'name': "claimReward",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "_amount",
                'type': "uint256"
            }
        ],
        'name': "deposit",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "address",
                'name': "_devaddr",
                'type': "address"
            }
        ],
        'name': "dev",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "devaddr",
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
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            }
        ],
        'name': "emergencyWithdraw",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_from",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "_to",
                'type': "uint256"
            }
        ],
        'name': "getMultiplier",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "address",
                'name': "_user",
                'type': "address"
            }
        ],
        'name': "getOptimisedUserInfos",
        'outputs': [
            {
                'internalType': "uint256[2][]",
                'name': "userInfos",
                'type': "uint256[2][]"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "address",
                'name': "_user",
                'type': "address"
            }
        ],
        'name': "getPendingBGOV",
        'outputs': [
            {
                'internalType': "uint256[]",
                'name': "pending",
                'type': "uint256[]"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "getPoolInfos",
        'outputs': [
            {
                'components': [
                    {
                        'internalType': "contract IERC20",
                        'name': "lpToken",
                        'type': "address"
                    },
                    {
                        'internalType': "uint256",
                        'name': "allocPoint",
                        'type': "uint256"
                    },
                    {
                        'internalType': "uint256",
                        'name': "lastRewardBlock",
                        'type': "uint256"
                    },
                    {
                        'internalType': "uint256",
                        'name': "accBGOVPerShare",
                        'type': "uint256"
                    }
                ],
                'internalType': "struct MasterChef.PoolInfo[]",
                'name': "poolInfos",
                'type': "tuple[]"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "address",
                'name': "_wallet",
                'type': "address"
            }
        ],
        'name': "getUserInfos",
        'outputs': [
            {
                'components': [
                    {
                        'internalType': "uint256",
                        'name': "amount",
                        'type': "uint256"
                    },
                    {
                        'internalType': "uint256",
                        'name': "rewardDebt",
                        'type': "uint256"
                    }
                ],
                'internalType': "struct MasterChef.UserInfo[]",
                'name': "userInfos",
                'type': "tuple[]"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "implementation",
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
                'internalType': "contract BGovToken",
                'name': "_BGOV",
                'type': "address"
            },
            {
                'internalType': "address",
                'name': "_devaddr",
                'type': "address"
            },
            {
                'internalType': "uint256",
                'name': "_BGOVPerBlock",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "_startBlock",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "_bonusEndBlock",
                'type': "uint256"
            }
        ],
        'name': "initialize",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "massUpdatePools",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            }
        ],
        'name': "migrate",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "migrator",
        'outputs': [
            {
                'internalType': "contract IMigratorChef",
                'name': "",
                'type': "address"
            }
        ],
        'stateMutability': "view",
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
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            },
            {
                'internalType': "address",
                'name': "_user",
                'type': "address"
            }
        ],
        'name': "pendingBGOV",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'name': "poolInfo",
        'outputs': [
            {
                'internalType': "contract IERC20",
                'name': "lpToken",
                'type': "address"
            },
            {
                'internalType': "uint256",
                'name': "allocPoint",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "lastRewardBlock",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "accBGOVPerShare",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "poolLength",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
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
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "_allocPoint",
                'type': "uint256"
            },
            {
                'internalType': "bool",
                'name': "_withUpdate",
                'type': "bool"
            }
        ],
        'name': "set",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "contract IMigratorChef",
                'name': "_migrator",
                'type': "address"
            }
        ],
        'name': "setMigrator",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "startBlock",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [],
        'name': "totalAllocPoint",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
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
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            }
        ],
        'name': "updatePool",
        'outputs': [],
        'stateMutability': "nonpayable",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "",
                'type': "uint256"
            },
            {
                'internalType': "address",
                'name': "",
                'type': "address"
            }
        ],
        'name': "userInfo",
        'outputs': [
            {
                'internalType': "uint256",
                'name': "amount",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "rewardDebt",
                'type': "uint256"
            }
        ],
        'stateMutability': "view",
        'type': "function"
    },
    {
        'inputs': [
            {
                'internalType': "uint256",
                'name': "_pid",
                'type': "uint256"
            },
            {
                'internalType': "uint256",
                'name': "_amount",
                'type': "uint256"
            }
        ],
        'name': "withdraw",
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