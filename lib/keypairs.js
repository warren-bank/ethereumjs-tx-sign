const EC       = require('elliptic').ec
const ec       = new EC('secp256k1')
const ecparams = ec.curve

const BN       = require('bn.js')

const rlp      = require('./rlp')
const {sha3}   = require('./keccak')

// ===============================
// ethereumjs-util.privateToPublic
// ===============================
const privateToPublic = function(privateKey, compressed=false) {
  if (typeof privateKey === 'string')
    privateKey = rlp.toBuffer('0x' + rlp.stripHexPrefix(privateKey))

  if (! Buffer.isBuffer(privateKey))
    throw new Error('invalid private key')

  let d = new BN(privateKey)
  if (d.cmp(ecparams.n) >= 0 || d.isZero())
    throw new Error('invalid private key')

  let publicKey = Buffer.from(ec.keyFromPrivate(privateKey).getPublic(compressed, true))
  return publicKey.toString('hex')
}

// ===============================
// ethereumjs-util.publicToAddress
// ===============================
const publicToAddress = function(publicKey) {
  if (typeof publicKey === 'string')
    publicKey = rlp.toBuffer('0x' + rlp.stripHexPrefix(publicKey))

  if (! Buffer.isBuffer(publicKey))
    throw new Error('invalid public key')

  if (publicKey.length === 65)
    publicKey = publicKey.slice(1)

  if (publicKey.length !== 64)
    throw new Error(`Length of public key is ${publicKey.length} bytes. Expected length is 64 bytes.`)

  // address contains the lower 160bits of the hash => 20 bytes => 40 hex-encoded string characters
  return sha3(publicKey).slice(-40)
}

const genKeyPair = function() {
  let key = ec.genKeyPair()

  let privateKey = key.getPrivate('hex')
  let publicKey  = key.getPublic().encode('hex')
  let address    = publicToAddress(publicKey)

  return {privateKey, publicKey, address}
}

module.exports = {privateToPublic, publicToAddress, genKeyPair}
