'use strict'

const EC = require('elliptic').ec
const ec = new EC('secp256k1')
const ecparams = ec.curve

const rlp = require('./lib/rlp')  // {encode, isHexPrefixed, stripHexPrefix, intToHex, padToEven, intToBuffer, toBuffer}

// ----------------------------------------------------------------------

const fields = ["nonce","gasPrice","gasLimit","to","value","data","v","r","s"]

// ======================
// ethereumjs-util.ecsign
// ======================
const format_signature = function(sig) {
  let data = {}
  data.v = sig.recovery + 27
  data.r = sig.signature.slice(0, 32)
  data.s = sig.signature.slice(32, 64)
  return data
}

// ===================
// secp256k1-node.sign
// ===================
const get_signature = function(msgHash, privateKey, web3) {
  let d = web3.toBigNumber(privateKey)
  if (d.cmp(ecparams.n) >= 0 || d.isZero()) throw new Error("nonce generation function failed or private key is invalid")

  let signed_msgHash = ec.sign(msgHash, privateKey, 16, { canonical: true })
  let sig = {
    signature: Buffer.concat([
      signed_msgHash.r.toArrayLike(Buffer, 'be', 32),
      signed_msgHash.s.toArrayLike(Buffer, 'be', 32)
    ]),
    recovery: signed_msgHash.recoveryParam
  }
  return sig
}

// ==================
// ethereumjs-tx.hash
// ==================
const get_hash = function(raw, web3) {
  let items = raw.slice(0, 6)  // "nonce","gasPrice","gasLimit","to","value","data"
  let msgHash = web3.sha3(rlp.encode(items))
  return msgHash
}

// ==================
// ethereumjs-tx.sign
// ==================
const get_formatted_signature = function(raw, privateKey, web3) {
  let msgHash = get_hash(raw, web3)
  let sig = get_signature(msgHash, privateKey, web3)
  let signature_data = format_signature(sig)
  return {msgHash, signature: sig.signature, signature_data}
}

// ===
// API
// ===
const sign = function(data, privateKey, web3) {
  privateKey = `0x${ rlp.stripHexPrefix(privateKey) }`
  let msgHash, signature, signature_data
  let raw = []

  fields.forEach((key, index) => {
    if (data[key] === undefined) {
      let default_value = (key === 'v') ? new Buffer([0x1c]) : new Buffer([])
      raw[index] = default_value
    }
    else {
      raw[index] = rlp.toBuffer(data[key])
    }

    if (key === 'data') {
      ({msgHash, signature, signature_data} = get_formatted_signature(raw, privateKey, web3))
      data = signature_data
    }
  })

  let signed_serialized_rawTx = rlp.encode(raw).toString('hex')
  return {msgHash, signature, signed_serialized_rawTx}
}

// =====================
// secp256k1-node.verify
// =====================
const verify = function(msgHash, signature, publicKey, web3) {
  publicKey  = rlp.stripHexPrefix(publicKey)
  let sigObj = {r: signature.slice(0, 32), s: signature.slice(32, 64)}

  let sigr = web3.toBigNumber('0x' + sigObj.r.toString('hex'))
  var sigs = web3.toBigNumber('0x' + sigObj.s.toString('hex'))
  if (sigr.cmp(ecparams.n) >= 0 || sigs.cmp(ecparams.n) >= 0) throw new Error("couldn't parse signature")
  if (sigs.cmp(ec.nh) === 1 || sigr.isZero() || sigs.isZero()) return false

  return ec.verify(msgHash, sigObj, publicKey, 'hex')
}

module.exports = {sign, verify}

// ----------------------------------------------------------------------
