const AuthorizedIssuer = artifacts.require("./AuthorizedIssuer.sol");

contract('AuthorizedIssuer', function (accounts) {

  let authorizedIssuer;
  //create new smart contract instances before each test method
  beforeEach(async function () {
    authorizedIssuer = await AuthorizedIssuer.new(accounts[0]);
  });
  it("should add new authorized account and unauthorize account", async function() {
    await authorizedIssuer.authorzeAccount(accounts[1]);
    let account = await authorizedIssuer.authorizedAccountsMap(accounts[1]);
    assert.equal(account[0], accounts[1]);
    assert.equal(account[2], true);
    authorizedIssuer.removeAuthorizedAccount(accounts[1]);
    account = await authorizedIssuer.authorizedAccountsMap(accounts[1]);
    assert.equal(account[2], false);    
  });
  it("should get number of authorized accounts", async function() {
    await authorizedIssuer.authorzeAccount(accounts[1]);
    let count = await authorizedIssuer.getNumberOfAuthorizedAccounts();
    assert.equal(count, 1);  
  });
  it("should get an authorized account", async function() {
    await authorizedIssuer.authorzeAccount(accounts[1]);
    let account = await authorizedIssuer.getAuthorizedAccount(0);
    assert.equal(account, accounts[1]);  
  });
});