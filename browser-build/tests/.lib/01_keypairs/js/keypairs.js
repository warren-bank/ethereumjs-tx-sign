const {privateToPublic, publicToAddress, genKeyPair} = window.ethereumjs_tx_sign.keypairs

const data = {
  generated: {},
  derived:   {}
}

// ----------------------------------------------------------------------

{
  let {privateKey, publicKey, address} = genKeyPair()

  Object.assign(data.generated, {privateKey, publicKey, address})
}

// ----------------------------------------------------------------------

{
  let publicKey = privateToPublic(data.generated.privateKey)

  data.derived.publicKey = publicKey
}

// ----------------------------------------------------------------------

{
  let address = publicToAddress(data.generated.publicKey)

  data.derived.address = address
}

// ----------------------------------------------------------------------
// print the results:

console.log(data)

// ----------------------------------------------------------------------
// validate the round-trip consistency of the results:

assert.strictEqual(
  data.derived.publicKey,
  data.generated.publicKey,
  'publicKey is not correct'
)

assert.strictEqual(
  data.derived.address,
  data.generated.address,
  'address is not correct'
)

// ----------------------------------------------------------------------
