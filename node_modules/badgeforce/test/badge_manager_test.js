const BadgeManager = artifacts.require("./BadgeManager.sol");
const utils = require("./test-utils");

contract('BadgeManager', function (accounts) {

  let badgeManager;
  //create new smart contract instances before each test method
  beforeEach(async function () {
    badgeManager = await BadgeManager.new(accounts[0]);
  });
  it("should retrieve number of badges", async function() {
    const numOfBadges = await badgeManager.getNumberOfBadges();
    assert.equal(numOfBadges, 0);
  });
  it("should create badge and retrieve it", async function() {
    await badgeManager.createBadge(...Object.values(utils.createBadgeParams));
    const badgeNameHash = await badgeManager.getNameByIndex(0);
    const data = await badgeManager.getBadge(badgeNameHash);
    const badge = utils.getBadgeObj(data);
    assert.equal(badge._issuer, badgeManager.address);
    assert.equal(badge._description, utils.createBadgeParams._description);
    assert.equal(badge._name, utils.createBadgeParams._name);
    assert.equal(badge._image, utils.createBadgeParams._image);
    assert.equal(badge._version, utils.createBadgeParams._version);
  });
  it("should return true for unique badge name", async function() {
    const unique = await badgeManager.isUnique(utils.createBadgeParams._name);
    assert.equal(unique, true);
  });
  it("should delete badge", async function() {
    await badgeManager.createBadge(...Object.values(utils.createBadgeParams));
    await badgeManager.deleteBadge(utils.createBadgeParams._name);
    const numOfBadges = await badgeManager.getNumberOfBadges();
    assert.equal(numOfBadges, 0);
  });
});
