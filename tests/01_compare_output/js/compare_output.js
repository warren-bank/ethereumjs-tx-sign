#!/usr/bin/env node

// ----------------------------------------------------------------------

const privateKey    = 'cc30c22d832c308b23b3885b79501a704f372950f3cd596f8c9150500405badf'
const publicKey     = '045b72b37490dbce7e6473c9fd2ff4493aa8f22012a5432810ef1c20f47fe7c98fec87c4c6ef7b63e20aac524fa500535d08e025d549b00d64c89c55f7c2c505ad'
const contract_data = '6060604052341561000c57fe5b60405160a0806102d2833981016040528080519060200190919080519060200190919080519060200190919080519060200190919080519060200190919050505b84600060006101000a81548160ff02191690831515021790555083600060016101000a81548160ff021916908360ff1602179055508260018190555081600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600381600019169055505b50505050505b6101e7806100eb6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806337af7327146100675780634aa2762e146100b9578063bc109174146100e7578063d2a174e51461010d578063fab261f414610137575bfe5b341561006f57fe5b610077610163565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100c157fe5b6100c9610189565b60405180826000191660001916815260200191505060405180910390f35b34156100ef57fe5b6100f761018f565b6040518082815260200191505060405180910390f35b341561011557fe5b61011d610195565b604051808215151515815260200191505060405180910390f35b341561013f57fe5b6101476101a8565b604051808260ff1660ff16815260200191505060405180910390f35b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60035481565b60015481565b600060009054906101000a900460ff1681565b600060019054906101000a900460ff16815600a165627a7a72305820ff945b9d7a6ff1e878bec54db295bb00226acfa2fb89419a3f9798c76963b1650029'

// ----------------------------------------------------------------------

const clean_input = function(str) {
  if ((typeof str === 'number') || (str.isBigNumber === true)) str = `${ str.toString(16) }`
  if ((!str) || (typeof str !== 'string') || (str === '0x')) str = '00'
  if (str.indexOf('0x') === 0) str = str.substr(2)
  if (str.length % 2 === 1) str = `0${str}`
  return `0x${str}`
}

const rawTx = {
  nonce:    clean_input(1),
  gasPrice: clean_input(30000000000),
  gasLimit: clean_input('0x100000'),
  to:       clean_input('0x0000000000000000000000000000000000000000'),
  value:    clean_input(0),
  data:     clean_input(contract_data)
}

// ----------------------------------------------------------------------

const rlp = require('../../../lib/rlp')  // {encode, isHexPrefixed, stripHexPrefix, intToHex, padToEven, intToBuffer, toBuffer}
const createKeccakHash = require('keccak')
const BN = require('bn.js')

const web3 = {}
web3.sha3 = function (a, bits) {
  a = rlp.toBuffer(a)
  if (!bits) bits = 256

  return createKeccakHash('keccak' + bits).update(a).digest()
}
web3.toBigNumber = function(numberOrHexString) {
  return new BN(numberOrHexString)
}

// ----------------------------------------------------------------------

const {sign, verify} = require('../../../index')

const {msgHash: this_msgHash, signature: this_signature, signed_serialized_rawTx: this_signed_serialized_rawTx} = sign(rawTx, privateKey, web3)

const this_output = clean_input(this_signed_serialized_rawTx)

console.log('this library:')
console.log('   ', 'chainId            =', 0)
console.log('   ', 'msgHash            =', this_msgHash.toString('hex'))
console.log('   ', 'signature          =', this_signature.toString('hex'))
console.log('   ', 'signed rawTx       =', this_output)
console.log('   ', 'signature verified =', verify(this_msgHash, this_signature, publicKey, web3), "\n")

// ----------------------------------------------------------------------

const Tx = require('ethereumjs-tx');
const privateKeyBuffer = new Buffer(privateKey, 'hex')

const tx = new Tx(rawTx)
tx.sign(privateKeyBuffer)

const that_msgHash   = tx.hash(false)
const that_signature = Buffer.concat([tx.r, tx.s], 64)
const that_output    = clean_input( tx.serialize().toString('hex') )

console.log('that library:')
console.log('   ', 'chainId            =', tx._chainId)
console.log('   ', 'msgHash            =', that_msgHash.toString('hex'))
console.log('   ', 'signature          =', that_signature.toString('hex'))
console.log('   ', 'signed rawTx       =', that_output)
console.log('   ', 'signature verified =', verify(that_msgHash, that_signature, publicKey, web3), "\n")

// ----------------------------------------------------------------------
