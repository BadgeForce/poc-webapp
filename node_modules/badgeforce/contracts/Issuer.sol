pragma solidity ^0.4.17;

import "BadgeForceToken/contracts/BadgeForceToken.sol";

import "./Holder.sol";
import "./Verifier.sol";

contract Issuer is Verifier {
    //access the badgeforce token contract
    BadgeForceToken private BFT;

    address constant NONE = 0x0000000000000000000000000000000000000000;

    /// @notice address of this contract
    address public issuerContract;

    string public name;
    string public url;


    function Issuer(address _adminWalletAddr, string _name, string _url, address _token) public Verifier(_adminWalletAddr) {
        name = _name;
        url = _url;
        issuerContract = address(this);
        BFT = BadgeForceToken(_token);
    }

    modifier payForIssue() {
        require(BFT.burnForIssue());
        _;
    }

    event CredentialIssued(
        string _badgeName,
        address indexed _recipient
    );
    /// @notice issue a new credential to a recipient contract
    /// @param _badgeName name of the badge to issue
    /// @param _recipient address of the holder contract
    /// @param _expires expire date (number of weeks)
    function issue(
        string _badgeName,
        address _recipient,
        uint _expires)
    public authorized(msg.sender) payForIssue()
    {
        uint expires;
        if (_expires <= 0) {
            expires = _expires;
        } else {
            expires = now + (_expires * 1 weeks);
        }
        bytes32 _txnKey = getCredentialTxnKey(issuerContract, msg.data);
        _sendToRecipient(
            _badgeName,
            expires,
            _recipient,
            _txnKey
        );
        setNewTxn(_txnKey, _recipient, _badgeName);
    }

    /// @notice internal method that gets instance of recipient contract and stores credential
    function _sendToRecipient(
        string _badgeName,
        uint expires,
        address _recipient,
        bytes32 _txnKey
    ) private
    {
        Badge memory badge = badgeVault.badges[getBadgeNameHash(_badgeName)];
        require(badge.issuer != NONE);
        Holder holder = Holder(_recipient);
        holder.storeCredential(
            badge.issuer,
            badge.description,
            badge.name,
            badge.image,
            badge.version,
            expires,
            _recipient,
            _txnKey
        );
        CredentialIssued(
            badge.name,
            _recipient
        );
    }

    /// @notice get issuer info
    function getInfo() public constant returns(address _issuer, address _contract, string _name, string _url) {
        return(admin, issuerContract, name, url);
    }

}
