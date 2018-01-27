const Issuer = artifacts.require("./Issuer.sol");
const Holder = artifacts.require("./Holder.sol");
const Verifier = artifacts.require("./Verifier.sol");
const TransactionManager = artifacts.require("./TransactionManager.sol");
const BadgeForceToken = artifacts.require("BadgeForceToken.sol");
const utils = require("./test-utils");

contract('Verifier', function (accounts) {

    let issuer;
    let token; 
    let transactionManager;
    let verifier;
    //create new smart contract instances before each test method
    beforeEach(async function () {
        token = await BadgeForceToken.new();
        utils.issuerInitialParams._adminWalletAddr = accounts[0];
        utils.issuerInitialParams._token = token.address;
        issuer = await Issuer.new(...Object.values(utils.issuerInitialParams));
        transactionManager = await TransactionManager.new(accounts[0]);
        verifier = await Verifier.new(accounts[0]);
    });
    it("should get a credential and verify (true, false if revoked)", async function() {
        const holder = await Holder.new(accounts[0]);
        await utils.issueCredential(issuer, holder);
        const key = await holder.getTxnKey(0);
        const credential = utils.getCredentialObj((await holder.getCredential(key)));
        let response = await issuer.verifyCredential(credential._txKey, credential._recipient); 
        assert.equal(response[0], true);
        await issuer.revoke(credential._txKey);
        response = await issuer.verifyCredential(credential._txKey, credential._recipient);
        assert.equal(response[0], false);
    });
});