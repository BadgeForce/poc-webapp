var Issuer = artifacts.require("./Issuer.sol");
var Holder = artifacts.require("./Holder.sol");
var BadgeForceToken = artifacts.require("BadgeForceToken.sol");
const utils = require("./test-utils");

contract('Holder', function (accounts) {
    let token; 
    let issuer;
    let holder;
    //create new smart contract instances before each test method
    beforeEach(async function () {
        token = await BadgeForceToken.new();
        utils.issuerInitialParams._adminWalletAddr = accounts[0];
        utils.issuerInitialParams._token = token.address;
        issuer = await Issuer.new(...Object.values(utils.issuerInitialParams));
        holder = await Holder.new(accounts[0]);
    });
    it("should add and remove trusted issuer", async function() {
        await holder.addTrustedIssuer(issuer.address);
        let trusted = await holder.trustedIssuers(issuer.address);
        assert.equal(trusted, true);

        await holder.removeTrustedIssuer(issuer.address);
        trusted = await holder.trustedIssuers(issuer.address);
        assert.equal(trusted, false);
    });  
    it("should get number of active & pending credentials", async function() {
        let numOfCredentials = await holder.getNumberOfCredentials();
        let numOfPendingCredentials = await holder.getNumberOfPendingCredentials();
        assert.equal(numOfCredentials, 0);
        assert.equal(numOfPendingCredentials, 0);
        
        let badge = utils.createBadgeParams;
        await utils.issueCredentialManual(issuer, holder, badge);
        badge._name = "Another Cool Badge";
        await utils.issueCredentialManual(issuer, holder, badge);
        let numOfCredentials_x = await holder.getNumberOfCredentials();
        let numOfPendingCredential_x = await holder.getNumberOfPendingCredentials();
        assert.equal(numOfCredentials_x, 2);
        assert.equal(numOfPendingCredential_x, 2);

        await holder.acceptCredential((await holder.getTxnKey(0)));
        let numOfCredentials_y = await holder.getNumberOfCredentials();
        let numOfPendingCredentials_y = await holder.getNumberOfPendingCredentials();
        assert.equal(numOfCredentials_y, 2);
        assert.equal(numOfPendingCredentials_y, 1);
    });
    it("should accept and reject credential", async function() {
        let badge = utils.createBadgeParams;
        await utils.issueCredential(issuer, holder);
        badge._name = "Another Cool Badge 1";
        await utils.issueCredentialManual(issuer, holder, badge);
        let key = await holder.getTxnKey(0);
        let credential = utils.getCredentialObj((await holder.getCredential(key)));
        assert.equal(credential._active, false);
        await holder.acceptCredential(key);  
        credential = utils.getCredentialObj((await holder.getCredential(key)));
        assert.equal(credential._active, true); 
        let numOfCredentials = await holder.getNumberOfCredentials();
        let numOfPendingCredentials = await holder.getNumberOfPendingCredentials();
        assert.equal(numOfCredentials, 2);
        assert.equal(numOfPendingCredentials, 1);

        key = await holder.getTxnKey(1);
        credential = utils.getCredentialObj((await holder.getCredential(key)));
        assert.equal(credential._active, false);
        await holder.rejectCredential(key);  
        let numOfCredentials_x = await holder.getNumberOfCredentials();
        let numOfPendingCredentials_x = await holder.getNumberOfPendingCredentials();
        assert.equal(numOfCredentials_x, 1);
        assert.equal(numOfPendingCredentials_x, 0);
    });
    it("should get a credential", async function() {
        await utils.issueCredential(issuer, holder);
        const key = await holder.getTxnKey(0);
        const credential = utils.getCredentialObj((await holder.getCredential(key)));
        assert.equal(credential._name, utils.createBadgeParams._name);
    });
    it("should delete a credential", async function() {
        await utils.issueCredential(issuer, holder);
        await holder.deleteCredential(utils.createBadgeParams._name);

        const count = await holder.getNumberOfCredentials();
        assert.equal(count, 0);
    });
    it("should recompute correct proof of integrity hash", async function() {
        await utils.issueCredential(issuer, holder);
        const key = await holder.getTxnKey(0);
        const credential = utils.getCredentialObj((await holder.getCredential(key)));
        const txn = utils.getTxn((await issuer.getTxn(credential._txKey)));
        const hash = await holder.recomputePOIHash(credential._txKey);
        assert.equal(txn._integrityHash, hash);
    });
});