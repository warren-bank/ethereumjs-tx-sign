#!/usr/bin/env node

const rlp = require('../../../lib/rlp')  // {encode, isHexPrefixed, stripHexPrefix, stripZeros, intToHex, padToEven, intToBuffer, toBuffer, bufferToHex, bufferToInt}

const rawData = [
  rlp.toBuffer(0),
  rlp.toBuffer(null)
]

const encoded_rawData = rlp.encode(rawData)

console.log('RLP encoded data:')
console.log('   ', '0    :', rlp.encode(rawData[0]))
console.log('   ', 'null :', rlp.encode(rawData[1]))
