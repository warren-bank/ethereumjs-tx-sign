#!/usr/bin/env node

// ----------------------------------------------------------------------

const privateKey   = 'e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158'
const publicKey    = '0493ff3bd23838a02f24adcb23aa90bf2de8becbd1abe688e0f6a3202bee2cc4c2ecf7cd2608cda0817d6223f81bed074f166b8b55de54d603817699b4c70feaac'
const from_address = 'f95abdf6ede4c3703e0e9453771fbee8592d31e9'

// ----------------------------------------------------------------------

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

// ----------------------------------------------------------------------

// contract project directory:
//     "tests/.contracts/01_Storage"

const artifacts = {
  abi: [{"constant":true,"inputs":[],"name":"value_address","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"value_string","outputs":[{"name":"","type":"bytes32"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"value_uint256","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"value_bool","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"value_uint8","outputs":[{"name":"","type":"uint8"}],"payable":false,"type":"function"},{"inputs":[{"name":"_value_bool","type":"bool"},{"name":"_value_uint8","type":"uint8"},{"name":"_value_uint256","type":"uint256"},{"name":"_value_address","type":"address"},{"name":"_value_string","type":"bytes32"}],"payable":false,"type":"constructor"}],
  bin: '6060604052341561000c57fe5b60405160a0806102d2833981016040528080519060200190919080519060200190919080519060200190919080519060200190919080519060200190919050505b84600060006101000a81548160ff02191690831515021790555083600060016101000a81548160ff021916908360ff1602179055508260018190555081600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600381600019169055505b50505050505b6101e7806100eb6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806337af7327146100675780634aa2762e146100b9578063bc109174146100e7578063d2a174e51461010d578063fab261f414610137575bfe5b341561006f57fe5b610077610163565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100c157fe5b6100c9610189565b60405180826000191660001916815260200191505060405180910390f35b34156100ef57fe5b6100f761018f565b6040518082815260200191505060405180910390f35b341561011557fe5b61011d610195565b604051808215151515815260200191505060405180910390f35b341561013f57fe5b6101476101a8565b604051808260ff1660ff16815260200191505060405180910390f35b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60035481565b60015481565b600060009054906101000a900460ff1681565b600060019054906101000a900460ff16815600a165627a7a72305820ff945b9d7a6ff1e878bec54db295bb00226acfa2fb89419a3f9798c76963b1650029'
}

const Storage = web3.eth.contract(artifacts.abi)

// ----------------------------------------------------------------------

const contract_constructor_params = [
  1,                                             // value_bool    (true)
  255,                                           // value_uint8   (255)
  '0x100',                                       // value_uint256 (256)
  '0x1111111111222222222233333333334444444444',  // value_address
  'hello world'                                  // value_string
]

contract_constructor_params.push({
  data: artifacts.bin
})

const contract_data = Storage.new.getData(...contract_constructor_params)

// ----------------------------------------------------------------------

const BN = require('bn.js')

const clean_input = function(str) {
  if ((typeof str === 'number') || (str.isBigNumber === true) || BN.isBN(str)) str = `${ str.toString(16) }`
  if ((!str) || (typeof str !== 'string') || (str === '0x')) str = '00'
  if (str.indexOf('0x') === 0) str = str.substr(2)
  if (str.length % 2 === 1) str = `0${str}`
  return `0x${str}`
}

const from_nonce = web3.eth.getTransactionCount(clean_input(from_address))

const txData = {
  nonce:    clean_input(from_nonce),
  gasPrice: clean_input(30000000000),
  gasLimit: clean_input('0x100000'),
//to:       clean_input('0x0000000000000000000000000000000000000000'),
  value:    clean_input(0),
  data:     clean_input(contract_data)
}

// ----------------------------------------------------------------------

const {sign, verify} = require('../../../index')

const {rawData, msgHash, DER, signature, rawTx} = sign(txData, privateKey)

console.log('rawData               =', JSON.stringify(rawData))
console.log('msgHash               =', msgHash.toString('hex'))
console.log('signature             =', signature.toString('hex'))
console.log('DER encoded signature =', JSON.stringify(DER))
console.log('signed rawTx          =', clean_input(rawTx))
console.log('signature verified    =', verify(msgHash, signature, publicKey), "\n")

// ----------------------------------------------------------------------

web3.eth.sendRawTransaction(rawTx, function(err, hash) {
  if (err) console.log('error:', err.message)
  if ((!err) && hash) {
    console.log('tx_hash:', hash, "\n")

    web3.eth.getTransaction(hash, (err, tx_data) => {
      if (err) console.log('error:', err.message)
      if ((!err) && tx_data) {
        console.log('tx_data:', tx_data, "\n")
      }
    })

    web3.eth.getTransactionReceipt(hash, (err, tx_receipt) => {
      if (err) console.log('error:', err.message)
      if ((!err) && tx_receipt) {
        console.log('tx_receipt:', tx_receipt, "\n")

        let contract_address = tx_receipt.contractAddress
        if (contract_address) {
          web3.eth.getCode(contract_address, (err, deployed_contract_code) => {
            console.log('deployed_contract_code:', deployed_contract_code, "\n")
          })
        }
      }
    })
  }
})

// ----------------------------------------------------------------------
