const { assert } = require('chai');

const { getUserIDByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// tests for getUserIDByEmail

describe('getUserIDByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserIDByEmail("user@example.com", testUsers);
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });

  it('should return undefined when looking for an email not in our users database', function() {
    const user = getUserIDByEmail("notreal@veryfake.com", testUsers);
    assert.equal(user, undefined);
  });
});