pragma solidity ^0.4.17;

import "./BadgeManager.sol";
import "./BFUtils.sol";

contract TransactionManager is BadgeManager, BFUtils {

    struct Transaction {
        bytes32 key;
        bytes32 integrityHash;
        address recipient;
        bool revoked;
    }

    /// @notice mapping of a unique hash to a recipient address, used to verify issuer of a credential
    mapping (bytes32=>Transaction) public credentialTxnMap;

    uint public nonce;

    function TransactionManager(address _adminWalletAddr) public BadgeManager(_adminWalletAddr) {
        nonce = 0;
    }

    /** @dev sets a new transaction (credential issued to recipient)
      * @param _txnKey the transaction key
      * @param _recipient recipient of the credential
    */
    function setNewTxn(
        bytes32 _txnKey,
        address _recipient,
        string _badgeName) authorized(msg.sender) public
        {
        //increase nonce
        nonce++;
        bytes32 badgeNameHash = getBadgeNameHash(_badgeName);
        Badge memory badge = badgeVault.badges[badgeNameHash];
        bytes32 integrityHash = getIntegrityHash(
            badge.issuer,
            badge.description,
            badge.name,
            badge.image,
            badge.version,
            _recipient
        );
        credentialTxnMap[_txnKey] = Transaction(_txnKey, integrityHash, _recipient, false);
    }

    /** @dev gets a transaction
      * @param _txnKey the transaction key
      * @return txnKey the key for the transaction
      * @return integrityHash proof of integrity hash for badge issued in this transaction
      * @return recipient address of the wallet associated with the person who received this badge
    */
    function getTxn(bytes32 _txnKey) constant public returns(bytes32 txnKey, bytes32 integrityHash, address recipient, bool revoked) {
        return(
            credentialTxnMap[_txnKey].key,
            credentialTxnMap[_txnKey].integrityHash,
            credentialTxnMap[_txnKey].recipient,
            credentialTxnMap[_txnKey].revoked
        );
    }

    /// @notice generate a credential transaction key
    /// @param _issuer address of the issuer
    /// @param _msgData msg data
    function getCredentialTxnKey(address _issuer, bytes _msgData) public view returns(bytes32 key) {
        return keccak256(_issuer, _msgData, nonce);
    }

    event CredentialRevoked(bytes32 _txnKey);
    /// @notice revoke a credential
    function revoke(bytes32 _txnKey) public authorized(msg.sender) {
        credentialTxnMap[_txnKey].revoked = true;
        CredentialRevoked(_txnKey);
    }

    event CredentialUnRevoked(bytes32 _txnKey);
    /// @notice unrevoke a credential
    function unRevoke(bytes32 _txnKey) public authorized(msg.sender) {
        credentialTxnMap[_txnKey].revoked = false;
        CredentialUnRevoked(_txnKey);
    }

    /// @notice check if credential is revoked
    function isRevoked(bytes32 _txnKey) public constant returns(bool c) {
        return credentialTxnMap[_txnKey].revoked;
    }
}
