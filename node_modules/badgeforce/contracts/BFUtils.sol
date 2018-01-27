pragma solidity ^0.4.17;

contract BFUtils {
  /// @notice compute integrity hash of credential data
  function getIntegrityHash(
      address issuer,
      string description,
      string name,
      string image,
      string version,
      address recipient
  ) pure public returns(bytes32 _hash)
  {
      return keccak256(
              issuer,
              description,
              name,
              image,
              version,
              recipient
      );
  }
}
