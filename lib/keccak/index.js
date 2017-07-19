'use strict'

// based on:
//   https://github.com/cryptocoinjs/keccak/raw/v1.3.0/js.js
//   https://github.com/cryptocoinjs/keccak/tree/v1.3.0/lib

const createKeccakHash = require('./api')(require('./keccak'))

const toBuffer = require('../rlp').toBuffer

// ====================
// ethereumjs-util.sha3
// ====================
const sha3 = function (a, bits) {
  a = toBuffer(a)
  if (!bits) bits = 256

  return createKeccakHash('keccak' + bits).update(a).digest('hex')
}

module.exports = {createKeccakHash, sha3}
