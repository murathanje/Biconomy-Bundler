export const ENTRY_POINT_ABI = [
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "SIG_VALIDATION_FAILED",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "_validateSenderAndPaymaster",
        "inputs": [
            {
                "name": "initCode",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "sender",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "paymasterAndData",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "addStake",
        "inputs": [
            {
                "name": "unstakeDelaySec",
                "type": "uint32",
                "internalType": "uint32"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "balanceOf",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "depositTo",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "deposits",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "deposit",
                "type": "uint112",
                "internalType": "uint112"
            },
            {
                "name": "staked",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "stake",
                "type": "uint112",
                "internalType": "uint112"
            },
            {
                "name": "unstakeDelaySec",
                "type": "uint32",
                "internalType": "uint32"
            },
            {
                "name": "withdrawTime",
                "type": "uint48",
                "internalType": "uint48"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getDepositInfo",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [
            {
                "name": "info",
                "type": "tuple",
                "internalType": "struct IStakeManager.DepositInfo",
                "components": [
                    {
                        "name": "deposit",
                        "type": "uint112",
                        "internalType": "uint112"
                    },
                    {
                        "name": "staked",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "stake",
                        "type": "uint112",
                        "internalType": "uint112"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint32",
                        "internalType": "uint32"
                    },
                    {
                        "name": "withdrawTime",
                        "type": "uint48",
                        "internalType": "uint48"
                    }
                ]
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getNonce",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "key",
                "type": "uint192",
                "internalType": "uint192"
            }
        ],
        "outputs": [
            {
                "name": "nonce",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "getSenderAddress",
        "inputs": [
            {
                "name": "initCode",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getUserOpHash",
        "inputs": [
            {
                "name": "userOp",
                "type": "tuple",
                "internalType": "struct UserOperation",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "handleAggregatedOps",
        "inputs": [
            {
                "name": "opsPerAggregator",
                "type": "tuple[]",
                "internalType": "struct IEntryPoint.UserOpsPerAggregator[]",
                "components": [
                    {
                        "name": "userOps",
                        "type": "tuple[]",
                        "internalType": "struct UserOperation[]",
                        "components": [
                            {
                                "name": "sender",
                                "type": "address",
                                "internalType": "address"
                            },
                            {
                                "name": "nonce",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "initCode",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "callData",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "callGasLimit",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "verificationGasLimit",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "preVerificationGas",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "maxFeePerGas",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "maxPriorityFeePerGas",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "paymasterAndData",
                                "type": "bytes",
                                "internalType": "bytes"
                            },
                            {
                                "name": "signature",
                                "type": "bytes",
                                "internalType": "bytes"
                            }
                        ]
                    },
                    {
                        "name": "aggregator",
                        "type": "address",
                        "internalType": "contract IAggregator"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "beneficiary",
                "type": "address",
                "internalType": "address payable"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "handleOps",
        "inputs": [
            {
                "name": "ops",
                "type": "tuple[]",
                "internalType": "struct UserOperation[]",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "beneficiary",
                "type": "address",
                "internalType": "address payable"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "incrementNonce",
        "inputs": [
            {
                "name": "key",
                "type": "uint192",
                "internalType": "uint192"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "innerHandleOp",
        "inputs": [
            {
                "name": "callData",
                "type": "bytes",
                "internalType": "bytes"
            },
            {
                "name": "opInfo",
                "type": "tuple",
                "internalType": "struct EntryPoint.UserOpInfo",
                "components": [
                    {
                        "name": "mUserOp",
                        "type": "tuple",
                        "internalType": "struct EntryPoint.MemoryUserOp",
                        "components": [
                            {
                                "name": "sender",
                                "type": "address",
                                "internalType": "address"
                            },
                            {
                                "name": "nonce",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "callGasLimit",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "verificationGasLimit",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "preVerificationGas",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "paymaster",
                                "type": "address",
                                "internalType": "address"
                            },
                            {
                                "name": "maxFeePerGas",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "maxPriorityFeePerGas",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    },
                    {
                        "name": "userOpHash",
                        "type": "bytes32",
                        "internalType": "bytes32"
                    },
                    {
                        "name": "prefund",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "contextOffset",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "preOpGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "context",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [
            {
                "name": "actualGasCost",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "nonceSequenceNumber",
        "inputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "",
                "type": "uint192",
                "internalType": "uint192"
            }
        ],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "simulateHandleOp",
        "inputs": [
            {
                "name": "op",
                "type": "tuple",
                "internalType": "struct UserOperation",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "target",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "targetCallData",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "simulateValidation",
        "inputs": [
            {
                "name": "userOp",
                "type": "tuple",
                "internalType": "struct UserOperation",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "unlockStake",
        "inputs": [],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawStake",
        "inputs": [
            {
                "name": "withdrawAddress",
                "type": "address",
                "internalType": "address payable"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "withdrawTo",
        "inputs": [
            {
                "name": "withdrawAddress",
                "type": "address",
                "internalType": "address payable"
            },
            {
                "name": "withdrawAmount",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "AccountDeployed",
        "inputs": [
            {
                "name": "userOpHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "factory",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "paymaster",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "BeforeExecution",
        "inputs": [],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Deposited",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "totalDeposit",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "SignatureAggregatorChanged",
        "inputs": [
            {
                "name": "aggregator",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "StakeLocked",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "totalStaked",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "unstakeDelaySec",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "StakeUnlocked",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "withdrawTime",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "StakeWithdrawn",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "withdrawAddress",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "UserOperationEvent",
        "inputs": [
            {
                "name": "userOpHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "paymaster",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "nonce",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "success",
                "type": "bool",
                "indexed": false,
                "internalType": "bool"
            },
            {
                "name": "actualGasCost",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "actualGasUsed",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "UserOperationRevertReason",
        "inputs": [
            {
                "name": "userOpHash",
                "type": "bytes32",
                "indexed": true,
                "internalType": "bytes32"
            },
            {
                "name": "sender",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "nonce",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            },
            {
                "name": "revertReason",
                "type": "bytes",
                "indexed": false,
                "internalType": "bytes"
            }
        ],
        "anonymous": false
    },
    {
        "type": "event",
        "name": "Withdrawn",
        "inputs": [
            {
                "name": "account",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "withdrawAddress",
                "type": "address",
                "indexed": false,
                "internalType": "address"
            },
            {
                "name": "amount",
                "type": "uint256",
                "indexed": false,
                "internalType": "uint256"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "ExecutionResult",
        "inputs": [
            {
                "name": "preOpGas",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "paid",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "validAfter",
                "type": "uint48",
                "internalType": "uint48"
            },
            {
                "name": "validUntil",
                "type": "uint48",
                "internalType": "uint48"
            },
            {
                "name": "targetSuccess",
                "type": "bool",
                "internalType": "bool"
            },
            {
                "name": "targetResult",
                "type": "bytes",
                "internalType": "bytes"
            }
        ]
    },
    {
        "type": "error",
        "name": "FailedOp",
        "inputs": [
            {
                "name": "opIndex",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "reason",
                "type": "string",
                "internalType": "string"
            }
        ]
    },
    {
        "type": "error",
        "name": "ReentrancyGuardReentrantCall",
        "inputs": []
    },
    {
        "type": "error",
        "name": "SenderAddressResult",
        "inputs": [
            {
                "name": "sender",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "SignatureValidationFailed",
        "inputs": [
            {
                "name": "aggregator",
                "type": "address",
                "internalType": "address"
            }
        ]
    },
    {
        "type": "error",
        "name": "ValidationResult",
        "inputs": [
            {
                "name": "returnInfo",
                "type": "tuple",
                "internalType": "struct IEntryPoint.ReturnInfo",
                "components": [
                    {
                        "name": "preOpGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "prefund",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "sigFailed",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "validAfter",
                        "type": "uint48",
                        "internalType": "uint48"
                    },
                    {
                        "name": "validUntil",
                        "type": "uint48",
                        "internalType": "uint48"
                    },
                    {
                        "name": "paymasterContext",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "senderInfo",
                "type": "tuple",
                "internalType": "struct IStakeManager.StakeInfo",
                "components": [
                    {
                        "name": "stake",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "factoryInfo",
                "type": "tuple",
                "internalType": "struct IStakeManager.StakeInfo",
                "components": [
                    {
                        "name": "stake",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "paymasterInfo",
                "type": "tuple",
                "internalType": "struct IStakeManager.StakeInfo",
                "components": [
                    {
                        "name": "stake",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            }
        ]
    },
    {
        "type": "error",
        "name": "ValidationResultWithAggregation",
        "inputs": [
            {
                "name": "returnInfo",
                "type": "tuple",
                "internalType": "struct IEntryPoint.ReturnInfo",
                "components": [
                    {
                        "name": "preOpGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "prefund",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "sigFailed",
                        "type": "bool",
                        "internalType": "bool"
                    },
                    {
                        "name": "validAfter",
                        "type": "uint48",
                        "internalType": "uint48"
                    },
                    {
                        "name": "validUntil",
                        "type": "uint48",
                        "internalType": "uint48"
                    },
                    {
                        "name": "paymasterContext",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "senderInfo",
                "type": "tuple",
                "internalType": "struct IStakeManager.StakeInfo",
                "components": [
                    {
                        "name": "stake",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "factoryInfo",
                "type": "tuple",
                "internalType": "struct IStakeManager.StakeInfo",
                "components": [
                    {
                        "name": "stake",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "paymasterInfo",
                "type": "tuple",
                "internalType": "struct IStakeManager.StakeInfo",
                "components": [
                    {
                        "name": "stake",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "unstakeDelaySec",
                        "type": "uint256",
                        "internalType": "uint256"
                    }
                ]
            },
            {
                "name": "aggregatorInfo",
                "type": "tuple",
                "internalType": "struct IEntryPoint.AggregatorStakeInfo",
                "components": [
                    {
                        "name": "aggregator",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "stakeInfo",
                        "type": "tuple",
                        "internalType": "struct IStakeManager.StakeInfo",
                        "components": [
                            {
                                "name": "stake",
                                "type": "uint256",
                                "internalType": "uint256"
                            },
                            {
                                "name": "unstakeDelaySec",
                                "type": "uint256",
                                "internalType": "uint256"
                            }
                        ]
                    }
                ]
            }
        ]
    }
] as const;

export const SMART_ACCOUNT_ABI = [
    {
        "type": "constructor",
        "inputs": [
            {
                "name": "anEntryPoint",
                "type": "address",
                "internalType": "contract IEntryPoint"
            },
            {
                "name": "anOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "receive",
        "stateMutability": "payable"
    },
    {
        "type": "function",
        "name": "entryPoint",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "contract IEntryPoint"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "execute",
        "inputs": [
            {
                "name": "dest",
                "type": "address",
                "internalType": "address"
            },
            {
                "name": "value",
                "type": "uint256",
                "internalType": "uint256"
            },
            {
                "name": "func",
                "type": "bytes",
                "internalType": "bytes"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "executeBatch",
        "inputs": [
            {
                "name": "dest",
                "type": "address[]",
                "internalType": "address[]"
            },
            {
                "name": "value",
                "type": "uint256[]",
                "internalType": "uint256[]"
            },
            {
                "name": "func",
                "type": "bytes[]",
                "internalType": "bytes[]"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "getNonce",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "owner",
        "inputs": [],
        "outputs": [
            {
                "name": "",
                "type": "address",
                "internalType": "address"
            }
        ],
        "stateMutability": "view"
    },
    {
        "type": "function",
        "name": "updateOwner",
        "inputs": [
            {
                "name": "newOwner",
                "type": "address",
                "internalType": "address"
            }
        ],
        "outputs": [],
        "stateMutability": "nonpayable"
    },
    {
        "type": "function",
        "name": "validateUserOp",
        "inputs": [
            {
                "name": "userOp",
                "type": "tuple",
                "internalType": "struct UserOperation",
                "components": [
                    {
                        "name": "sender",
                        "type": "address",
                        "internalType": "address"
                    },
                    {
                        "name": "nonce",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "initCode",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "callGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "verificationGasLimit",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "preVerificationGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "maxPriorityFeePerGas",
                        "type": "uint256",
                        "internalType": "uint256"
                    },
                    {
                        "name": "paymasterAndData",
                        "type": "bytes",
                        "internalType": "bytes"
                    },
                    {
                        "name": "signature",
                        "type": "bytes",
                        "internalType": "bytes"
                    }
                ]
            },
            {
                "name": "userOpHash",
                "type": "bytes32",
                "internalType": "bytes32"
            },
            {
                "name": "missingAccountFunds",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "outputs": [
            {
                "name": "validationData",
                "type": "uint256",
                "internalType": "uint256"
            }
        ],
        "stateMutability": "nonpayable"
    },
    {
        "type": "event",
        "name": "OwnerUpdated",
        "inputs": [
            {
                "name": "previousOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            },
            {
                "name": "newOwner",
                "type": "address",
                "indexed": true,
                "internalType": "address"
            }
        ],
        "anonymous": false
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignature",
        "inputs": []
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureLength",
        "inputs": [
            {
                "name": "length",
                "type": "uint256",
                "internalType": "uint256"
            }
        ]
    },
    {
        "type": "error",
        "name": "ECDSAInvalidSignatureS",
        "inputs": [
            {
                "name": "s",
                "type": "bytes32",
                "internalType": "bytes32"
            }
        ]
    }
] as const;