'use strict'

const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const ecparams = ec.curve

const BN = require('bn.js')

const unsignRawTx = require('@warren-bank/ethereumjs-tx-unsign')

const rlp = require('./lib/rlp')  // {encode, isHexPrefixed, stripHexPrefix, stripZeros, intToHex, padToEven, intToBuffer, toBuffer, bufferToHex, bufferToInt}

const {sha3} = require('./lib/keccak')

const {publicToAddress} = require('./lib/keypairs')

const assert = require('assert')

// ----------------------------------------------------------------------

// =========================
// ethereumjs-tx.constructor
// =========================
const fields = [{
  name: 'nonce',
  length: 32,
  allowLess: true,
  default: new Buffer([])
}, {
  name: 'gasPrice',
  length: 32,
  allowLess: true,
  default: new Buffer([])
}, {
  name: 'gasLimit',
  alias: 'gas',
  length: 32,
  allowLess: true,
  default: new Buffer([])
}, {
  name: 'to',
  allowZero: true,
  length: 20,
  default: new Buffer([])
}, {
  name: 'value',
  length: 32,
  allowLess: true,
  default: new Buffer([])
}, {
  name: 'data',
  alias: 'input',
  allowZero: true,
  default: new Buffer([])
}, {
  name: 'v',
  allowZero: true,
  default: new Buffer([0x1c])
}, {
  name: 'r',
  length: 32,
  allowZero: true,
  allowLess: true,
  default: new Buffer([])
}, {
  name: 's',
  length: 32,
  allowZero: true,
  allowLess: true,
  default: new Buffer([])
}]

// ================================
// ethereumjs-util.defineProperties
// ================================
const process_data = function(data, use_defaults=true) {
  let raw = []
  let keys = Object.keys(data)

  fields.forEach(function (field, index) {
    let value
    if      (keys.indexOf(field.name)  !== -1)               value = get_field_value(field, data[field.name])
    else if (keys.indexOf(field.alias) !== -1)               value = get_field_value(field, data[field.alias])
    else if (use_defaults && (field.default !== undefined))  value = field.default
    if (value !== undefined) raw[index] = value
  })

  return raw
}

const get_field_value = function(field, value) {
  let v      = rlp.toBuffer(value)
  let isZero = (v.toString('hex').match(/^0+$/) !== null)

  // modify value
  if (isZero) {
    if (!field.allowZero)     v = Buffer.allocUnsafe(0)
    else if (field.allowLess) v = Buffer.alloc(1, 0)
    else if (field.length)    v = Buffer.alloc(field.length, 0)
  }
  else {
    if (field.allowLess)      v = rlp.stripZeros(v)
  }

  // validate value
  if (field.length) {
    if (field.allowLess)      assert(field.length  >= v.length, 'The field ' + field.name + ' must not have more ' + field.length + ' bytes')
    else                      assert(field.length === v.length, 'The field ' + field.name + ' must have byte length of ' + field.length)
  }

  return v
}

// ==================
// ethereumjs-tx.sign
// ==================
const get_signature = function(rawData, chainId, privateKey) {
  let msgHash    = get_hash(rawData, chainId)
  let {DER, sig} = get_raw_signature(msgHash, privateKey)
  let rawSigData = format_raw_signature(sig)
  if (chainId)
    rawSigData.v += (chainId * 2) + 8
  rawSigData     = process_data(rawSigData, false)
  rawSigData.forEach((value, index) => {
    if (value !== undefined) rawData[index] = value
  })

  return {msgHash, DER, signature: sig.signature}
}

// ==================
// ethereumjs-tx.hash
// ==================
const get_hash = function(rawData, chainId) {
  let items = rawData.slice(0, 6)  // "nonce","gasPrice","gasLimit","to","value","data"
  if (chainId) {
    let rawSigData = {v: chainId, r: null, s: null}
    rawSigData     = process_data(rawSigData, false)
    rawSigData.forEach((value, index) => {
      if (value !== undefined) items[index] = value
    })
  }

  let msgHash = sha3(rlp.encode(items))
  return rlp.stripHexPrefix(msgHash)
}

// ===================
// secp256k1-node.sign
// ===================
const get_raw_signature = function(msgHash, privateKey) {
  let d = new BN(rlp.bufferToHex(privateKey, false), 16)
  if (d.cmp(ecparams.n) >= 0 || d.isZero()) throw new Error("nonce generation function failed or private key is invalid")

  let signed_msgHash = ec.sign(msgHash, privateKey, { canonical: true })
  let DER = signed_msgHash.toDER()
  let sig = {
    signature: Buffer.concat([
      signed_msgHash.r.toArrayLike(Buffer, 'be', 32),
      signed_msgHash.s.toArrayLike(Buffer, 'be', 32)
    ]),
    recovery: signed_msgHash.recoveryParam
  }
  return {DER, sig}
}

// ======================
// ethereumjs-util.ecsign
// ======================
const format_raw_signature = function(sig) {
  let data = {}
  data.v = sig.recovery + 27
  data.r = sig.signature.slice(0, 32)
  data.s = sig.signature.slice(32, 64)
  return data
}

// ===
// API
// ===
const sign = function(data, privateKey) {
  privateKey                    = rlp.toBuffer('0x' + rlp.stripHexPrefix(privateKey))
  let rawData                   = process_data(data)
  let {msgHash, DER, signature} = get_signature(rawData, data.chainId, privateKey)
  let rawTx                     = rlp.encode(rawData).toString('hex')
  return {rawData, msgHash, DER, signature, rawTx}
}

// =====================
// secp256k1-node.verify
// =====================
const verify = function(msgHash, signature, publicKey) {
  publicKey  = rlp.toBuffer('0x' + rlp.stripHexPrefix(publicKey))

  // skip this step if signature is DER encoded
  if (Buffer.isBuffer(signature) && (signature.length === 64)) {
    let sigObj = {r: signature.slice(0, 32), s: signature.slice(32, 64)}

    let sigr = new BN(sigObj.r.toString('hex'), 16)
    let sigs = new BN(sigObj.s.toString('hex'), 16)
    if (sigr.cmp(ecparams.n) >= 0 || sigs.cmp(ecparams.n) >= 0) throw new Error("couldn't parse signature")
    if (sigs.cmp(ec.nh) === 1 || sigr.isZero() || sigs.isZero()) return false

    signature = sigObj
  }

  return ec.verify(msgHash, signature, publicKey)
}

const unsign = function(rawTx) {
  let {txData, signature} = unsignRawTx(rawTx, true, true, false)

  let rawData = process_data(txData)
  let msgHash = get_hash(rawData, txData.chainId)

  let ec_msgHash = new BN(msgHash, 16)
  let ec_signature = {
    r: signature.r,
    s: signature.s
  }
  let ec_recovery = parseInt(signature.v, 16) - 27
  if (txData.chainId)
    ec_recovery -= (txData.chainId * 2) + 8

  let publicKey = ec.recoverPubKey(ec_msgHash, ec_signature, ec_recovery).encode('hex')
  let address = publicToAddress(publicKey)

  return {txData, signature, msgHash, publicKey, address}
}

module.exports = {sign, verify, unsign}

// ----------------------------------------------------------------------
