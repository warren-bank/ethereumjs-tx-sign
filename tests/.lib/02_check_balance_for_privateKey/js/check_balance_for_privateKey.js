#!/usr/bin/env node

// ----------------------------------------------------------------------

const privateKey = 'f7ef8432857eb502f9406282b6cb86219ea4973f5f9bb0605099cfc2c63a516a'

// ----------------------------------------------------------------------

const {privateToPublic, publicToAddress} = require('../../../../lib/keypairs')

const Web3 = require('web3')
const web3 = new Web3()
web3.setProvider(new web3.providers.HttpProvider('https://mainnet.infura.io:443'))

// ----------------------------------------------------------------------

const publicKey = privateToPublic(privateKey)
const address   = publicToAddress(publicKey)

// ----------------------------------------------------------------------

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

// ----------------------------------------------------------------------
