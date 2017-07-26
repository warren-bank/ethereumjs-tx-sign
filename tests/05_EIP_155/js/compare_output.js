#!/usr/bin/env node

// ----------------------------------------------------------------------
/*

test:
=====
* run the example given (by "vbuterin") in the spec for EIP 155:
    https://github.com/ethereum/eips/issues/155

-------------------------------------------------------------------------

result (current methodology => same as "ethereumjs-tx"):
========================================================

* when "r" and "s" are zero-length Buffers,
    > `let rawSigData = {v: chainId, r: null, s: null}`
  the output matches:
    - all of the values computed by "kvhnuke":
        https://github.com/ethereum/eips/issues/155#issuecomment-262413098
    - only the "raw transaction" value computed by "vbuterin"
        * notes:
            - his comments suggest that the value was updated..
              copied from the comment by "kvhnuke"
            - it appears that he didn't copy all of the pertinent data..
              only the final result

output:
=======

signing hash: daf5a779ae972f972197303d7b574746c7ef83eadac0f2791ad23db92e4c8e53

v,r,s values (hex): [ '25',
  '28ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276',
  '67cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83' ]

v,r,s values (dec): [ '37',
  '18515461264373351373200002665853028612451056578545711640558177340181847433846',
  '46948507304638947509940763649030358759909902576025900602547168820602576006531' ]

signed tx: f86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b3800ccf555c9f3dc64214b297fb1966a3b6d83

-------------------------------------------------------------------------

result (alt methodology):
=========================

* when "r" and "s" are 1-byte Buffers containing the value `0x00`,
    > `let rawSigData = {v: chainId, r: 0, s: 0}`
  the output matches:
    - none of the values computed by "vbuterin"
    - none of the values computed by "kvhnuke"

output:
=======

signing hash: 8646f40078126ef7cb96dec9b4d76af1f2b11ae691f652605e2d2b1d16437801

v,r,s values (hex): [ '25',
  'b891f4948abe0a4359244bfd4107bf8f0a251b0e7c929ad17796cc12080bc1a6',
  '021c181aed1375ad0e67d399edef44f2fac4bf1f86a14e06d5d75ba822f2b302' ]

v,r,s values (dec): [ '37',
  '83483444994505879033205705411998783055313808914703638564537073996963313861030',
  '954263782818282227560844856387924666054442925700602173265761955597444625154' ]

signed tx: f86c098504a817c800825208943535353535353535353535353535353535353535880de0b6b3a76400008025a0b891f4948abe0a4359244bfd4107bf8f0a251b0e7c929ad17796cc12080bc1a6a0021c181aed1375ad0e67d399edef44f2fac4bf1f86a14e06d5d75ba822f2b302

*/
// ----------------------------------------------------------------------

const {sign} = require('../../../index')
const BN = require('bn.js')

const clean_input = function(str) {
  if ((typeof str === 'number') || (str.isBigNumber === true) || BN.isBN(str)) str = `${ str.toString(16) }`
  if ((!str) || (typeof str !== 'string') || (str === '0x')) str = '00'
  if (str.indexOf('0x') === 0) str = str.substr(2)
  if (str.length % 2 === 1) str = `0${str}`
  return `0x${str}`
}

const txData = {
  nonce:    clean_input(9),
  gasPrice: clean_input(new BN('20000000000', 10)),
  gasLimit: clean_input(21000),
  to:       clean_input('0x3535353535353535353535353535353535353535'),
  value:    clean_input(new BN('1000000000000000000', 10)),
  data:     null,
  chainId:  1
}

const privateKey = '4646464646464646464646464646464646464646464646464646464646464646'

// ----------------------------------------------------------------------

{
  let {rawData, msgHash, rawTx} = sign(txData, privateKey)
  let vrs_hex = rawData.slice(6).map(buf => buf.toString('hex'))
  let vrs_dec = vrs_hex.map((hex) => {return (new BN(hex, 16)).toString(10)})
  console.log('signing hash:',       msgHash, "\n")
  console.log('v,r,s values (hex):', vrs_hex, "\n")
  console.log('v,r,s values (dec):', vrs_dec, "\n")
  console.log('signed tx:',          rawTx,   "\n")
}

// ----------------------------------------------------------------------
