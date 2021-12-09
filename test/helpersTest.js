const { assert } = require('chai');

const { findUserByEmail } = require('../helpers');

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

describe('getUserByEmail', () => {
  it('should return a user with valid email', () => {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return undefined if we pass in an email that is not in our users database', () => {

    const user = findUserByEmail("use32r@example.com", testUsers);
    // Write your assert statement here
    assert.isUndefined(user, 'user.id has not been defined');
  });


});
