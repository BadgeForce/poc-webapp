//initial params for testing address _issuer, string _name, string _url, address _token
const issuerInitialParams = {
  _adminWalletAddr: 0x0,
  _name: "BadgeForce",
  _url: "https://github.com/BadgeForce",
  _token: 0x0
};

//string _description, string _name,string _image,string _version, string _json
const createBadgeParams = {
    _description: "This badge is super cool",
    _name: "Cool badge",
    _image: "http://some/image/url",
    _version: "1"
}

const getCredentialObj = (data) => {
    let credential = {};
    ({0:credential._issuer, 1:credential._description, 2:credential._name, 3:credential._image, 
        4:credential._version, 5:credential._expires, 6:credential._recipient, 7: credential._txKey, 8:credential._active} = data);
    return credential;
}

const getBadgeObj = (data) => {
    let badge = {};
    ({0:badge._issuer, 1:badge._description, 2:badge._name, 3:badge._image, 4:badge._version} = data);
    return badge;
}

const getTxn = (data) => {
    // bytes32 key; 
    // bytes32 integrityHash;
    // address recipient;
    // bool revoked;
    let txn = {};
    ({0: txn._key, 1:txn._integrityHash, 2:txn._recipient, 3:txn._revoked} = data);
    return txn;
}

const issueCredential = async (issuer, holder) => {
    await issuer.createBadge(...Object.values(createBadgeParams));
    await holder.addTrustedIssuer(issuer.address);
    const issueParams = {
        _badgeName: createBadgeParams._name,
        _recipient: holder.address,
        _expires: 0,
    }
    await issuer.issue(...Object.values(issueParams));
}

const issueCredentialManual = async (issuer, holder, badge) => {
    await issuer.createBadge(...Object.values(badge));
    await holder.addTrustedIssuer(issuer.address);
    const issueParams = {
        _badgeName: badge._name,
        _recipient: holder.address,
        _expires: 0,
    }
    await issuer.issue(...Object.values(issueParams));
}

module.exports = {
    issuerInitialParams, 
    createBadgeParams,
    getCredentialObj,
    getBadgeObj,
    getTxn,
    issueCredential,
    issueCredentialManual
}