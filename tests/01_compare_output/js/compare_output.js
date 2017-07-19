#!/usr/bin/env node

// ----------------------------------------------------------------------
/*

const EC  = require('elliptic').ec
const ethUtil = require('ethereumjs-util')

const ec  = new EC('secp256k1')
const key = ec.genKeyPair()

const privateKey = key.getPrivate('hex')
const publicKey  = key.getPublic().encode('hex')
const address    = ethUtil.publicToAddress(Buffer.from(publicKey, 'hex'), true).toString('hex')

console.log('privateKey:', privateKey)
console.log('publicKey:',  publicKey)
console.log('address:',    address)

*/
// ----------------------------------------------------------------------

const privateKey    = 'e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158'
const publicKey     = '0493ff3bd23838a02f24adcb23aa90bf2de8becbd1abe688e0f6a3202bee2cc4c2ecf7cd2608cda0817d6223f81bed074f166b8b55de54d603817699b4c70feaac'
const address       = 'f95abdf6ede4c3703e0e9453771fbee8592d31e9'

const contract_data = '6060604052341561000c57fe5b60405160a0806102d2833981016040528080519060200190919080519060200190919080519060200190919080519060200190919080519060200190919050505b84600060006101000a81548160ff02191690831515021790555083600060016101000a81548160ff021916908360ff1602179055508260018190555081600260006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555080600381600019169055505b50505050505b6101e7806100eb6000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900463ffffffff16806337af7327146100675780634aa2762e146100b9578063bc109174146100e7578063d2a174e51461010d578063fab261f414610137575bfe5b341561006f57fe5b610077610163565b604051808273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b34156100c157fe5b6100c9610189565b60405180826000191660001916815260200191505060405180910390f35b34156100ef57fe5b6100f761018f565b6040518082815260200191505060405180910390f35b341561011557fe5b61011d610195565b604051808215151515815260200191505060405180910390f35b341561013f57fe5b6101476101a8565b604051808260ff1660ff16815260200191505060405180910390f35b600260009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60035481565b60015481565b600060009054906101000a900460ff1681565b600060019054906101000a900460ff16815600a165627a7a72305820ff945b9d7a6ff1e878bec54db295bb00226acfa2fb89419a3f9798c76963b1650029'

// ----------------------------------------------------------------------

const clean_input = function(str) {
  if ((typeof str === 'number') || (str.isBigNumber === true)) str = `${ str.toString(16) }`
  if ((!str) || (typeof str !== 'string') || (str === '0x')) str = '00'
  if (str.indexOf('0x') === 0) str = str.substr(2)
  if (str.length % 2 === 1) str = `0${str}`
  return `0x${str}`
}

const txData = {
  nonce:    clean_input(1),
  gasPrice: clean_input(30000000000),
  gasLimit: clean_input('0x100000'),
  to:       clean_input('0x0000000000000000000000000000000000000000'),
  value:    clean_input(0),
  data:     clean_input(contract_data)
}

// ----------------------------------------------------------------------

const rlp = require('../../../lib/rlp')  // {encode, isHexPrefixed, stripHexPrefix, stripZeros, intToHex, padToEven, intToBuffer, toBuffer, bufferToHex, bufferToInt}
const createKeccakHash = require('keccak')
const BN = require('bn.js')

const web3 = {}
web3.sha3 = function (a, bits) {
  a = rlp.toBuffer(a)
  if (!bits) bits = 256

  return '0x' + createKeccakHash('keccak' + bits).update(a).digest('hex')
}
web3.BigNumber = BN

// ----------------------------------------------------------------------

const {sign, verify} = require('../../../index')

const {rawData: this_rawData, msgHash: this_msgHash, DER: this_DER, signature: this_signature, rawTx: this_rawTx} = sign(txData, privateKey, web3)

console.log('this library:')
console.log('   ', 'chainId               =', '[unavailable]')
console.log('   ', 'rawData               =', JSON.stringify(this_rawData))
console.log('   ', 'msgHash               =', this_msgHash.toString('hex'))
console.log('   ', 'signature             =', this_signature.toString('hex'))
console.log('   ', 'DER encoded signature =', JSON.stringify(this_DER))
console.log('   ', 'signed rawTx          =', clean_input(this_rawTx))
console.log('   ', 'signature verified    =', verify(this_msgHash, this_signature, publicKey, web3), "\n")

// ----------------------------------------------------------------------

const Tx = require('ethereumjs-tx');
const privateKeyBuffer = new Buffer(privateKey, 'hex')

const tx = new Tx(txData)
tx.sign(privateKeyBuffer)

const that_rawData   = tx.raw
const that_msgHash   = tx.hash(false)
const that_signature = Buffer.concat([tx.r, tx.s], 64)
const that_rawTx     = clean_input( tx.serialize().toString('hex') )

console.log('that library:')
console.log('   ', 'chainId               =', tx._chainId)
console.log('   ', 'rawData               =', JSON.stringify(that_rawData))
console.log('   ', 'msgHash               =', that_msgHash.toString('hex'))
console.log('   ', 'signature             =', that_signature.toString('hex'))
console.log('   ', 'DER encoded signature =', '[unavailable]')
console.log('   ', 'signed rawTx          =', that_rawTx)
console.log('   ', 'signature verified    =', verify(that_msgHash, that_signature, publicKey, web3), "\n")

// ----------------------------------------------------------------------
