#!/usr/bin/env node

// ----------------------------------------------------------------------

const {privateToPublic, publicToAddress} = require('../../../../lib/keypairs')

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('https://mainnet.infura.io:443'))

// ----------------------------------------------------------------------

const check_balance_for_privateKey = function(privateKey) {
  let publicKey = privateToPublic(privateKey)
  let address   = publicToAddress(publicKey)

  web3.eth.getBalance(address, (error, balance) => {
    if (error) {
      console.log('[Error]:', error.message)
    }
    else {
      console.log('Balance:')
      console.log('   ', balance.valueOf(),                        'wei')
      console.log('   ', web3.fromWei(balance, 'ether').valueOf(), 'ether')
    }
  })
}

// ----------------------------------------------------------------------

check_balance_for_privateKey('e922354a3e5902b5ac474f3ff08a79cff43533826b8f451ae2190b65a9d26158')

// ----------------------------------------------------------------------
