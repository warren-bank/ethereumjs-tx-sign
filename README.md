### [ethereumjs-tx-sign](https://github.com/warren-bank/ethereumjs-tx-sign)

#### Description:

The goal of this repo is to provide a stripped down version of `ethereumjs-tx` that can still be used to sign raw transactions.

#### Installation:

```bash
npm install --save '@warren-bank/ethereumjs-tx-sign'
```

#### Background:

[ethereumjs-tx](https://github.com/ethereumjs/ethereumjs-tx) is the de-facto library used to sign raw transactions.

`npm install --production 'ethereumjs-tx'` results in a `node_modules` directory that is `10.4 MB` (`24.9 MB on disk using ext4`).

Installation of this npm module results in a `node_modules` directory that is `302.3 KB` (`580.0 KB on disk using ext4`).

#### Usage Example:

```javascript
const {sign} = require('@warren-bank/ethereumjs-tx-sign')

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'))

const privateKey = 'e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158'

const txData = {
  nonce:    '0x00',
  gasPrice: '0x6fc23ac00',
  gasLimit: '0x2710',
//to:       '0x00',
  value:    '0x00',
  data:     '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
}

const {rawTx} = sign(txData, privateKey)
console.log('raw_tx:', rawTx, "\n")

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
```

#### Credits (and Copyright) Belong To:

* [ethereumjs-tx](https://github.com/ethereumjs/ethereumjs-tx)
* [ethereumjs-util](https://github.com/ethereumjs/ethereumjs-util)
* [secp256k1-node](https://github.com/cryptocoinjs/secp256k1-node)
* [rlp](https://github.com/ethereumjs/rlp)
* [keccak](https://github.com/cryptocoinjs/keccak)
