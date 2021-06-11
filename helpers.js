// helper function: ID generator
const generateRandomID = function() {
  let key = "";
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    key += char[Math.floor(Math.random() * char.length)];
  }
  return key;
};

// helper function: checks if email given already exists in database "users"
const ifEmailExists = function(email, users) {
  for (let userID of Object.keys(users)) {
    if (email === users[userID]['email']) {
      return true;
    }
  }
  return false;
};

// helper function: get userID by email
const getUserIDByEmail = function(email, users) {
  for (let userID of Object.keys(users)) {
    if (email === users[userID]['email']) {
      return userID;
    }
  }
  return false;
};

// helper function: returns URLs unique to creator (userID)
const urlsForUser = function(id, urlDatabase) {
  let urlList = { };
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL]['userID'] === id) {
      urlList[shortURL] = {...urlDatabase[shortURL]};
    }
  }
  return urlList;
};

module.exports = {
  generateRandomID,
  ifEmailExists,
  getUserIDByEmail,
  urlsForUser,
};
