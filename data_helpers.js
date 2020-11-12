const bcrypt = require('bcrypt');

// DATA 

const urlDatabase = {
  test01: { longURL: "https://www.tsn.ca", userID: "rand01" },
  test02: { longURL: "https://www.google.ca", userID: "rand02" },
};

const users = { 
  "rand01": {
    id: "rand01", 
    email: "a@a.com", 
    password: bcrypt.hashSync("123", 10)
  },
 "rand02": {
    id: "rand02", 
    email: "b@b.com", 
    password: bcrypt.hashSync("234", 10)
  },
}

// HELPER FUNCTIONS 

// Generate random string for shortURL
function generateRandomString() {
  let output = "";
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor((Math.random() * 61) + 0); // 62 alphanumeric characters
    if (randomNum <= 9) { // directly map numbers
      output += randomNum;
    } else if (randomNum > 9 && randomNum <= 35) { // calculate ASCII uppercase letters
      output += String.fromCharCode(randomNum - 10 + 65);
    } else if (randomNum > 35) { // calculate ASCII lowercase letters
      output += String.fromCharCode(randomNum - 36 + 97);
    }
  }
  return output;
}

// Lookup e-mail in users object and return user ID
function lookupEmail(email) {
  for (const userKey of Object.keys(users)) {
    if (users[userKey].email === email) {
      return userKey;
    }
  }
  return null;
}

// Filter urlDatabase using id and return new database
function urlsForUser(id) {
  let newDatabase = {}
  for (const key of Object.keys(urlDatabase)) {
    if (urlDatabase[key].userID === id) {
      newDatabase[key] = urlDatabase[key];
    }
  }
  return newDatabase;
}

module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  lookupEmail,
  urlsForUser,
};