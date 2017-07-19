pragma solidity ^0.4.2;

contract Storage {
  bool    public value_bool;
  uint8   public value_uint8;
  uint256 public value_uint256;
  address public value_address;
  bytes32 public value_string;

  function Storage(
    bool    _value_bool,
    uint8   _value_uint8,
    uint256 _value_uint256,
    address _value_address,
    bytes32 _value_string
  ) {
    value_bool    = _value_bool;
    value_uint8   = _value_uint8;
    value_uint256 = _value_uint256;
    value_address = _value_address;
    value_string  = _value_string;
  }
}
