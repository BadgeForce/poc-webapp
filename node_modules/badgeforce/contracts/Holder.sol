pragma solidity ^0.4.17;

import "BadgeLibrary/contracts/BadgeLibrary.sol";

import "./BFUtils.sol";

contract Holder is BFUtils {

    /// @notice address where holder holds there badgeforce tokens
    address public holder;

    /// @notice mapping of name hash to credential
    /// @notice array of hash names
    struct CredentialVault {
        mapping (bytes32=>BadgeLibrary.Credential) credentials;
        mapping (bytes32=>uint) indexMap;
        uint numOfPendingCreds;
        bytes32[] keys;
    }

    /// @notice vault holding credentials
    CredentialVault credentialVault;

    /// @notice mapping of trusted issuers
    mapping (address=>bool) public trustedIssuers;

    function Holder(address _holder) public {
        holder = _holder;
    }

    event AuthorizeAttempt(address _actor, bool authorized);
    /// @notice make sure caller is the issuer that owns this contract because badgeforce tokens will be used
    modifier authorized(address _holder) {
        bool isAuthorized = (_holder == holder);
        AuthorizeAttempt(_holder, isAuthorized);
        require(isAuthorized);
        _;
    }

    event LogStoreAttempt(address _caller);
    /// @notice make sure issuer is trusted to store credentials on this contract
    modifier trusted(address _issuer) {
        LogStoreAttempt(_issuer);
        require(trustedIssuers[_issuer]);
        _;
    }

    /// @notice add a new trusted issuer
    function addTrustedIssuer(address _issuer) public authorized(msg.sender) {
        trustedIssuers[_issuer] = true;
    }

    /// @notice add a new trusted issuer
    function removeTrustedIssuer(address _issuer) public authorized(msg.sender) {
        trustedIssuers[_issuer] = false;
    }

    event NewPendingCredential(string _name, address _issuer);
    /**
     *  @dev put a new credential inside the pending queue
     */
    function storeCredential(
        address _issuer,
        string _description,
        string _name,
        string _image,
        string _version,
        uint _expires,
        address _recipient,
        bytes32 _txnKey
    ) public trusted(msg.sender)
    {
        credentialVault.credentials[_txnKey] = BadgeLibrary.Credential(
                BadgeLibrary.Badge(_issuer, _description, _name, _image, _version),
                _expires,
                _recipient,
                _txnKey,
                false
        );
        credentialVault.indexMap[_txnKey] = credentialVault.keys.push(_txnKey)-1;
        credentialVault.numOfPendingCreds++;
        NewPendingCredential(_name, _issuer);
    }

    event NewCredentialAccepted(bytes32 _txnKey);
    function acceptCredential(bytes32 _txnKey) authorized(msg.sender) public {
        require(!credentialVault.credentials[_txnKey].active);
        credentialVault.credentials[_txnKey].active = true;
        credentialVault.numOfPendingCreds--;
        NewCredentialAccepted(_txnKey);
    }

    event CredentialRejected(bytes32 _txnKey);
    function rejectCredential(bytes32 _txnKey) authorized(msg.sender) public returns(bool success) {
        require(!credentialVault.credentials[_txnKey].active);
        credentialVault.numOfPendingCreds--;
        CredentialRejected(_txnKey);
        return _deleteCredential(_txnKey);
    }

    event CredentialDeleted(bytes32 _txnKey, uint count);
    /// @notice delete a credential
    function deleteCredential(bytes32 _txnKey) authorized(msg.sender) public returns(bool success) {
        BadgeLibrary.Credential memory cred = credentialVault.credentials[_txnKey];
        if(!cred.active) {
          success = rejectCredential(_txnKey);
        } else {
          success = _deleteCredential(_txnKey);
        }
        CredentialDeleted(_txnKey, credentialVault.keys.length);
        return success;
    }

    function _deleteCredential(bytes32 _txnKey) public returns(bool success) {
        delete credentialVault.credentials[_txnKey];
        uint rowToDelete = credentialVault.indexMap[_txnKey];
        bytes32 rowToMove = credentialVault.keys[credentialVault.keys.length-1];
        credentialVault.indexMap[rowToMove] = rowToDelete;
        credentialVault.keys[rowToDelete] = rowToMove;
        credentialVault.keys.length--;
        delete credentialVault.indexMap[_txnKey];
        delete credentialVault.credentials[_txnKey];
        return true;
    }

    /// @notice get a holders credential
    /// @param _name index of credential to return
    function getCredential(bytes32 _txnKey) constant public  returns (
        address _issuer,
        string _description,
        string _name,
        string _image,
        string _version,
        uint _expires,
        address _recipient,
        bytes32 txnKey,
        bool _active
    ) {
        require(credentialVault.keys.length > 0);
        BadgeLibrary.Credential memory cred = credentialVault.credentials[_txnKey];
        return (
            cred.badge.issuer,
            cred.badge.description,
            cred.badge.name,
            cred.badge.image,
            cred.badge.version,
            cred.expires,
            cred.recipient,
            cred.txnKey,
            cred.active
        );
    }

    /// @notice helper function for UI to retrieve all names then retrieve the credentials
    /// @param _index index of the name you want
    function getTxnKey(uint _index) constant public returns(bytes32 txnKey) {
        return credentialVault.keys[_index];
    }

    /// @dev get number of credentials
    function getNumberOfCredentials() constant public returns(uint count) {
        return credentialVault.keys.length;
    }

    /// @dev get number of pending credentials
    function getNumberOfPendingCredentials() constant public returns(uint count) {
        return credentialVault.numOfPendingCreds;
    }

    function recomputePOIHash(bytes32 _txnKey) constant public returns(bytes32 poiHash) {
        BadgeLibrary.Credential memory credential = credentialVault.credentials[_txnKey];
        return getIntegrityHash(
            credential.badge.issuer,
            credential.badge.description,
            credential.badge.name,
            credential.badge.image,
            credential.badge.version,
            credential.recipient
        );
    }
}
