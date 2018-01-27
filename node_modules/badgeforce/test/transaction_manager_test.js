const Issuer = artifacts.require("./Issuer.sol");
const Holder = artifacts.require("./Holder.sol");
const TransactionManager = artifacts.require("./TransactionManager.sol");
const BadgeForceToken = artifacts.require("BadgeForceToken.sol");
const utils = require("./test-utils");

contract('TransactionManager', function (accounts) {

  let issuer;
  let token; 
  let transactionManager;
  //create new smart contract instances before each test method
  beforeEach(async function () {
    token = await BadgeForceToken.new();
    utils.issuerInitialParams._adminWalletAddr = accounts[0];
    utils.issuerInitialParams._token = token.address;
    issuer = await Issuer.new(...Object.values(utils.issuerInitialParams));
    transactionManager = await TransactionManager.new(accounts[0]);
  });
  it("should revoke and unrevoke a credential", async function() {
    const holder = await Holder.new(accounts[0]);
    await utils.issueCredential(issuer, holder);
    const key = await holder.getTxnKey(0);
    const credential = utils.getCredentialObj((await holder.getCredential(key)));
    await issuer.revoke(credential._txKey);
    let txn = utils.getTxn((await issuer.getTxn(credential._txKey)));
    assert.equal(txn._revoked, true);
    await issuer.unRevoke(credential._txKey);
    txn = utils.getTxn((await issuer.getTxn(credential._txKey)));
    assert.equal(txn._revoked, false);
  });
  it("should add new authorized account and unauthorize account", async function() {
    transactionManager.authorzeAccount(accounts[1]);
    let account = await transactionManager.authorizedAccountsMap(accounts[1]);
    assert.equal(account[0], accounts[1]);
    assert.equal(account[2], true);
    transactionManager.removeAuthorizedAccount(accounts[1]);
    account = await transactionManager.authorizedAccountsMap(accounts[1]);
    assert.equal(account[2], false);    
  });
});