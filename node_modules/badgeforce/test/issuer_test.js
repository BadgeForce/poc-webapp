var Issuer = artifacts.require("./Issuer.sol");
var Holder = artifacts.require("./Holder.sol");
var BadgeForceToken = artifacts.require("BadgeForceToken.sol");
const utils = require("./test-utils");

contract('Issuer', function (accounts) {

  let token;
  let issuer;
  //create new smart contract instances before each test method
  beforeEach(async function () {
    token = await BadgeForceToken.new();
    utils.issuerInitialParams._adminWalletAddr = accounts[0];
    utils.issuerInitialParams._token = token.address;
    issuer = await Issuer.new(...Object.values(utils.issuerInitialParams));
  });

  it("should set initial attributes", async function() {
    assert.equal(await issuer.admin(), utils.issuerInitialParams._adminWalletAddr);
    assert.equal(await issuer.name(), utils.issuerInitialParams._name);
    assert.equal(await issuer.url(), utils.issuerInitialParams._url);
    await issuer.createBadge(...Object.values(utils.createBadgeParams));

  });
  it("should return issuer info", async function() {
    const info = await issuer.getInfo();
    //address _issuer, address _contract, string _name, string _url
    assert.equal(info[0], accounts[0]);
    assert.equal(info[1], await issuer.issuerContract());
    assert.equal(info[2], utils.issuerInitialParams._name);
    assert.equal(info[3], utils.issuerInitialParams._url);
  });
  it("should issue badge to holder", async function() {
    const holder = await Holder.new(accounts[0]);
    await holder.addTrustedIssuer(issuer.address);
    await issuer.createBadge(...Object.values(utils.createBadgeParams));
    //string _badgeName, address _recipient, uint _expires
    const issueParams = {
      _badgeName: utils.createBadgeParams._name,
      _recipient: holder.address,
      _expires: 0,
    }
    await issuer.issue(...Object.values(issueParams));
    const key = await holder.getTxnKey(0);
    const data = await holder.getCredential(key);
    const credential = utils.getCredentialObj(data);
    assert.equal(credential._name, issueParams._badgeName);
    assert.equal(credential._recipient, issueParams._recipient);
    //bytes32 key; bytes32 integrityHash; address recipient;
    const issueTransaction = await issuer.credentialTxnMap(credential._txKey);
    assert.equal(issueTransaction[2], credential._recipient);
  });
});
