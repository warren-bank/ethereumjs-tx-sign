#!/usr/bin/env node

const assert = require('assert')

const {sign, verify, unsign} = require('../../../index')

const data = {}

// ----------------------------------------------------------------------

{
  data.sign = {}

  data.sign.keypairs = {
    privateKey: 'e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158',
    publicKey:  '0493ff3bd23838a02f24adcb23aa90bf2de8becbd1abe688e0f6a3202bee2cc4c2ecf7cd2608cda0817d6223f81bed074f166b8b55de54d603817699b4c70feaac',
    address:    'f95abdf6ede4c3703e0e9453771fbee8592d31e9'
  }

  let txData = {
    nonce:    '0x00',
    gasPrice: '0x6fc23ac00',
    gasLimit: '0x2710',
//  to:       '0x00',
    value:    '0x00',
    data:     '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
    chainId:  1
  }

  let {rawTx} = sign(txData, data.sign.keypairs.privateKey)

  Object.assign(data.sign, {txData, rawTx})
}

{
  let {msgHash, signature} = sign(data.sign.txData, data.sign.keypairs.privateKey)

  Object.assign(data.sign, {msgHash, signature})

  let result = verify(msgHash, signature, data.sign.keypairs.publicKey)

  data.sign.verify = (result ? 'pass' : 'fail')
}

{
  data.unsign = {}
  data.unsign.keypairs = {}

  let {txData, msgHash, signature, publicKey, address} = unsign(data.sign.rawTx)

  Object.assign(data.unsign, {txData, msgHash, signature})
  Object.assign(data.unsign.keypairs, {publicKey, address})

  data.unsign.verify = {
    recovery_publicKey: (verify(msgHash, signature, publicKey)                    ? 'pass' : 'fail'),
    original_publicKey: (verify(msgHash, signature, data.sign.keypairs.publicKey) ? 'pass' : 'fail')
  }
}

// ----------------------------------------------------------------------
// print the results:

console.log(data)

// ----------------------------------------------------------------------
// validate the round-trip consistency of the results:

assert.strictEqual(
  data.unsign.keypairs.publicKey,
  data.sign.keypairs.publicKey,
  'publicKey is not correct'
)

assert.strictEqual(
  data.unsign.keypairs.address,
  data.sign.keypairs.address,
  '"from" address is not correct'
)

assert.strictEqual(
  data.unsign.msgHash,
  data.sign.msgHash,
  'msgHash does not match'
)

let unsign_signature = Buffer.concat([
  Buffer.from(data.unsign.signature.r, 'hex'),
  Buffer.from(data.unsign.signature.s, 'hex')
])

assert.strictEqual(
  unsign_signature.toString('hex'),
  data.sign.signature.toString('hex'),
  'signature does not match'
)

// ----------------------------------------------------------------------
