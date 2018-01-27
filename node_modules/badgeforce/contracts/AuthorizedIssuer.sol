pragma solidity ^0.4.17;

contract AuthorizedIssuer {

    /// @notice the god account for this contract
    address public admin;

    address constant NONE = 0x0000000000000000000000000000000000000000;

    struct AuthorizedAccount {
        address issuer;
        uint index;
        bool isAuthorized;
    }

    /// @notice authorized issuers on this contract
    mapping (address=>AuthorizedAccount) public authorizedAccountsMap;

    /// @notice list of authorized acounts
    address[] authorizedAccountsList;

    function AuthorizedIssuer(address _adminWalletAddr) public {
        admin = _adminWalletAddr;
    }

    event AuthorizeAttempt(address _actor, bool authorized);
    /// @notice make sure caller is the issuer that owns this contract because badgeforce tokens will be used 
    modifier authorized(address _issuer) {
        bool isAuthorized = (_issuer == admin || authorizedAccountsMap[_issuer].isAuthorized);
        AuthorizeAttempt(_issuer, isAuthorized);
        require(isAuthorized);
        _;
    }

    /// @notice make sure caller is the admin of this contract
    modifier onlyAdmin(address _issuer) {
        bool isAuthorized = (_issuer == admin);
        AuthorizeAttempt(_issuer, isAuthorized);
        require(isAuthorized);
        _;
    }

    event NewAccountAuthorized(address _newIssuer);
    /** @dev add a new account that will be able to issue credentials from this contract
      * @param _newIssuer address of the account to authorize
    */ 
    function authorzeAccount(address _newIssuer) public onlyAdmin(msg.sender) {
        authorizedAccountsMap[_newIssuer] = AuthorizedAccount(_newIssuer, authorizedAccountsList.push(_newIssuer)-1, true);
        NewAccountAuthorized(_newIssuer);
    }

    event AuthorizedAccountRemoved(address _issuer);
    /** @dev remove an authorized issuer from this contract 
      * @param _issuer address of the account that will be authorized
    */ 
    function removeAuthorizedAccount(address _issuer) public onlyAdmin(msg.sender) {
        authorizedAccountsMap[_issuer].isAuthorized = false;
        AuthorizedAccountRemoved(_issuer);
    }

    /** @dev gets a authorized account, can be used in conjuntion with numOfAuthorizedAccounts to get all in UI
      * @param _index the index of the account in the authorizedAccountsList
      * @return _issuer account address
    */ 
    function getAuthorizedAccount(uint _index) public view returns(address _issuer) {
        if (authorizedAccountsMap[authorizedAccountsList[_index]].isAuthorized) {
            return authorizedAccountsList[_index];
        } else {
            return NONE;
        }
    }

    /** @dev get the number of authorized accounts for this issuer contract
      * @return _numOfAccounts number of accounts
    */ 
    function getNumberOfAuthorizedAccounts() public view returns(uint _numOfAccounts) {
        return authorizedAccountsList.length;
    }
}