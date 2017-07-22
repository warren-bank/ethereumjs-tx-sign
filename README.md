### [ethereumjs-tx-sign](https://github.com/warren-bank/ethereumjs-tx-sign)

#### Description:

The goal of this project is to provide a light-weight minimal library to sign (and verify) raw Ethereum transactions.

#### Installation:

```bash
npm install --save '@warren-bank/ethereumjs-tx-sign'
```

- - - -

#### Background:

[ethereumjs-tx](https://github.com/ethereumjs/ethereumjs-tx) is the de-facto library used to sign raw transactions.

Clean installation of the `ethereumjs-tx` module results in a `node_modules` directory that is:
* `10.4 MB`
* `24.9 MB` on disk (_ext4_)

Clean installation of this module results in a `node_modules` directory that is:
* `333.5 KB`
* `640.0 KB` on disk (_ext4_)

- - - -

#### API:

__{rawData, msgHash, DER, signature, rawTx} = sign(txData, privateKey)__

* params:
  * txData
    * type: Object
    * keys can include: `"nonce","gasPrice","gasLimit","to","value","data"`
    * values:
      * type: String
      * format: hex-encoded (with '0x' prefix)
      * more generally: any value that can be converted to a Buffer: `rlp.toBuffer(value)`
  * privateKey
    * type: String
    * format: hex-encoded (with or without '0x' prefix)
* returns:
  * rawData
    * type: Array of Buffers
    * length: 9
    * values (and order) correspond to the data fields: `"nonce","gasPrice","gasLimit","to","value","data","v","r","s"`
  * msgHash
    * description: sha3 hash of RLP encoded Array containing the first 6 elements of rawData
    * type: String
    * format: hex-encoded (without '0x' prefix)
  * DER
    * description: DER encoded signature
    * type: Array of Number
    * format: each Number is an Integer in the range [0..255] and represents a single Byte
  * signature
    * Buffer
    * length: 64 Bytes
    * contents: rawData.r (32 Bytes) + rawData.s (32 Bytes)
  * rawTx
    * description: RLP encoded rawData
    * type: String
    * format: hex-encoded (without '0x' prefix)

__Example:__

```javascript
const {sign} = require('@warren-bank/ethereumjs-tx-sign')

const txData = {
  nonce:    '0x00',
  gasPrice: '0x6fc23ac00',
  gasLimit: '0x2710',
//to:       '0x00',
  value:    '0x00',
  data:     '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
}

const privateKey = 'e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158'

const {rawTx} = sign(txData, privateKey)

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

web3.eth.sendRawTransaction(rawTx, function(err, hash) {
  if (err)
    console.log('error:', err.message)
  if ((!err) && hash)
    console.log('transaction hash:', hash)
})
```

__More Complete Example:__

* [script](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/01_compare_output/js/compare_output.js)
* [output](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/01_compare_output/run.log)

- - - -

__verify(msgHash, signature, publicKey)__

* params:
  * msgHash
    * type: String
    * format: hex-encoded (without '0x' prefix)
  * signature
    * type:
      * Buffer: length of 64 Bytes
      * Object: `{r, s}`
        * r: Buffer w/ length of 32 Bytes
        * s: Buffer w/ length of 32 Bytes
      * (DER encoded) Array of Number
      * (DER encoded) String: hex-encoded (without '0x' prefix):<br>
        `let DER_string = require('elliptic').utils.encode(DER, 'hex')`
  * publicKey
    * type: String
    * format: hex-encoded (with or without '0x' prefix)
* returns:
  * Boolean
    * indicates whether the `signature` can be verified for the `msgHash` using the `publicKey`
      * `true` indicates that the `signature` was originally created using the (unavailable) `privateKey` that is paired to the (available) `publicKey`
      * `false` indicates that it was not

__Example:__

```javascript
// continuation of the previous example:

const {verify} = require('@warren-bank/ethereumjs-tx-sign')

{
  let {msgHash, signature} = sign(txData, privateKey)

  let publicKey = '0493ff3bd23838a02f24adcb23aa90bf2de8becbd1abe688e0f6a3202bee2cc4c2ecf7cd2608cda0817d6223f81bed074f166b8b55de54d603817699b4c70feaac'

  let result = verify(msgHash, signature, publicKey)
}
```

__More Complete Example:__

* [script](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/02_deploy_and_validate/js/deploy_and_validate.js)
* [output](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/02_deploy_and_validate/run.log)

- - - -

__{txData, signature, msgHash, publicKey, address} = unsign(rawTx, add_prefix)__

* params:
  * rawTx
    * type:
      * String: hex-encoded (with or without '0x' prefix)
      * Buffer
  * add_prefix
    * description: prepend '0x' prefix to hex-encoded String values in `txData`?
    * type: Boolean
    * default: true
* returns:
  * txData
    * type: Object
    * keys: `"nonce","gasPrice","gasLimit","to","value","data"`
    * values:
      * type: String
      * format: hex-encoded
        * if `add_prefix`: with '0x' prefix
  * signature
    * type: Object
    * keys: `"r","s"`
    * values:
      * type: String
      * format: hex-encoded (without '0x' prefix)
  * msgHash
    * type: String
    * format: hex-encoded (without '0x' prefix)
  * publicKey
    * type: String
    * format: hex-encoded (without '0x' prefix)
  * address
    * description: "from" address &hellip; seen by network as the sender of this signed transaction
    * type: String
    * format: hex-encoded (without '0x' prefix)

__Example:__

```javascript
// continuation of the previous example:

const {unsign} = require('@warren-bank/ethereumjs-tx-sign')

{
  let {txData, msgHash, signature, publicKey} = unsign(rawTx)

  let result = verify(msgHash, signature, publicKey)
}
```

__More Complete Example:__

* [script](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/03_unsign_raw_tx/js/unsign_raw_tx.js)
* [output](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/03_unsign_raw_tx/run.log)

__Related:__

* [ethereumjs-tx-unsign](https://github.com/warren-bank/ethereumjs-tx-unsign)
  * exports a variation of the function: `unsign()`
  * it is a minimal library to retrieve `txData` and (optionally) `signature` from `rawTx`
  * it doesn't include any external dependencies and (consequently) lacks the ability to calculate `publicKey` and `address` from `signature`

- - - -

#### Bonus (Internal Library) APIs:

__{privateKey, publicKey, address} = genKeyPair()__

* returns:
  * privateKey
    * type: String
    * format: hex-encoded (without '0x' prefix)
  * publicKey
    * type: String
    * format: hex-encoded (without '0x' prefix)
  * address
    * type: String
    * format: hex-encoded (without '0x' prefix)

__Example:__

```javascript
const {genKeyPair} = require('@warren-bank/ethereumjs-tx-sign/lib/keypairs')

const {privateKey, publicKey, address} = genKeyPair()

console.log({privateKey, publicKey, address})
```

__Output:__

```javascript
{
  privateKey: 'e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158',
  publicKey:  '0493ff3bd23838a02f24adcb23aa90bf2de8becbd1abe688e0f6a3202bee2cc4c2ecf7cd2608cda0817d6223f81bed074f166b8b55de54d603817699b4c70feaac',
  address:    'f95abdf6ede4c3703e0e9453771fbee8592d31e9'
}
```

__More Complete Example:__

* [script](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/.lib/01_keypairs/js/keypairs.js)
* [output](https://github.com/warren-bank/ethereumjs-tx-sign/blob/master/tests/.lib/01_keypairs/run.log)

- - - -

__publicKey = privateToPublic(privateKey, compressed)__

* params:
  * privateKey
    * type:
      * String: hex-encoded (with or without '0x' prefix)
      * Buffer
  * compressed
    * [description](https://github.com/ethereumj/ethereumj/blob/a0a8a94aaf16a8a75af171c6c51d958b11922669/ethereumj-core/src/main/java/org/ethereum/crypto/ECKey.java#L58)
    * type: Boolean
    * default: false
* returns:
  * publicKey
    * type: String
    * format: hex-encoded (without '0x' prefix)

__Example:__

```javascript
// continuation of the previous example:

const {privateToPublic} = require('@warren-bank/ethereumjs-tx-sign/lib/keypairs')

{
  let pubKey = privateToPublic(privateKey)

  assert(pubKey === publicKey)
}
```

- - - -

__address = publicToAddress(publicKey)__

* params:
  * publicKey
    * type:
      * String: hex-encoded (with or without '0x' prefix)
      * Buffer
* returns:
  * address
    * type: String
    * format: hex-encoded (without '0x' prefix)

__Example:__

```javascript
// continuation of the previous example:

const {publicToAddress} = require('@warren-bank/ethereumjs-tx-sign/lib/keypairs')

{
  let addr = publicToAddress(publicKey)

  assert(addr === address)
}
```

- - - -

#### Credits (mostly) Belong To:

* [ethereumjs-tx](https://github.com/ethereumjs/ethereumjs-tx)
* [ethereumjs-util](https://github.com/ethereumjs/ethereumjs-util)
* [secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node)
* [rlp](https://github.com/ethereumjs/rlp)
* [keccak](https://github.com/cryptocoinjs/keccak)

#### Special Thanks To:

* [elliptic](https://github.com/indutny/elliptic)
  * is a dependency of this module
  * is the work-horse that makes all of this possible
