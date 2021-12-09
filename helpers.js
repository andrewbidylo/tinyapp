const findUserByEmail = (email, users) => {
  for (let userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = () => {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZ0123456789abcdefghiklmnopqrstuvwxyz";
  let lengthString = 6;
  let randomString = '';
  for (let i = 0; i < lengthString; i++) {
    let rnum = Math.floor(Math.random() * characters.length);
    randomString += characters[rnum];
  }
  return randomString;
};


const urlsForUser = (id, urlDatabase) => {
  let ownURLs = {};
  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl]['userID'] === id) {
      ownURLs[shortUrl] = urlDatabase[shortUrl];
    }
  }
  return ownURLs;
};


module.exports = { findUserByEmail, generateRandomString, urlsForUser };