pragma solidity ^0.4.17;

import "./TransactionManager.sol";
import "./Holder.sol";

contract Verifier is TransactionManager {

    string constant INVALID_TRANSACTION = "Invalid transaction: the transaction does not exist";
    string constant INVALID_INTEGRITYHASH = "Invalid data integrity: data in credential does not match original transaction data";
    string constant INVALID_RECIPIENT = "Invalid recipient: recipient does not match original transaction data";
    string constant INVALID_TXTKEY = "Invalid transaction key: transaction keys don't match";
    string constant REVOKED = "Invalid credential: credential revoked";
    string constant VALID_CREDENTIAL = "Credential is valid";

    address constant NONE = 0x0000000000000000000000000000000000000000;

    function Verifier(address _adminWalletAddr) public TransactionManager(_adminWalletAddr) {}

    function verifyCredential(bytes32 _txnKey, address _recipient) constant public returns(bool isVerified, string errMsg) {
        var (_revoked, _integrityHashCheck, _recipientCheck) = verifyCredentialTxn(_txnKey, _recipient);
        if (_revoked) {
            return(false, REVOKED);
        } else if (!_recipientCheck) {
            return(_recipientCheck, INVALID_RECIPIENT);
        } else if (!_integrityHashCheck) {
            return(_integrityHashCheck, INVALID_INTEGRITYHASH);
        } else {
            return(true, VALID_CREDENTIAL);
        }
    }

    /// @notice check that a transaction key exists in the transaction map (verify credential issuer)
    /// @param _txnKey key to access the transaction
    /// @param _recipient recipient of the credential being verified
    function verifyCredentialTxn(bytes32 _txnKey, address _recipient) constant public returns(bool _revoked,  bool _integrityHashCheck, bool _recipientCheck) {
        var (key, integrityHash, recipient, revoked) = getTxn(_txnKey);

        if (recipient == NONE) {
            return(true, false, false);
        } else if (revoked) {
            return(revoked, false, false);
        }

        Holder holder = Holder(_recipient);
        bytes32 _integrityHash = holder.recomputePOIHash(key);
        return(revoked,
            (_integrityHash == integrityHash),
            (_recipient == recipient)
        );
    }

}
