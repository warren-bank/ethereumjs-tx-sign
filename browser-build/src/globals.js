const {Buffer} = require('buffer')

const BN = require('bn.js')

const {sign, verify, unsign} = require('../../index')
const {privateToPublic, publicToAddress, genKeyPair} = require('../../lib/keypairs')
const {encode, isHexPrefixed, stripHexPrefix, stripZeros, intToHex, padToEven, intToBuffer, toBuffer, bufferToHex, bufferToInt} = require('../../lib/rlp')
const {createKeccakHash, sha3} = require('../../lib/keccak')

const ethereumjs_tx_sign = {
  sign,
  verify,
  unsign,
  keypairs: {privateToPublic, publicToAddress, genKeyPair},
  rlp:      {encode, isHexPrefixed, stripHexPrefix, stripZeros, intToHex, padToEven, intToBuffer, toBuffer, bufferToHex, bufferToInt},
  keccak:   {createKeccakHash, sha3}
}

window.Buffer = Buffer

window.BN = BN

window.ethereumjs_tx_sign = ethereumjs_tx_sign
