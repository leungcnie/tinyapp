// DATA --------------------------------------------------
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  test01: { longURL: "http://example.com", userID: "1"}
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
  "1": {
    id: "1",
    email: "a@a.com",
    password: "123"
  },
}

// HELPER FUNCTIONS -------------------------------------------

// Generate random string for shortURL
function generateRandomString() {
  let output = "";
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor((Math.random() * 61) + 0); // 62 alphanumeric characters in total
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

// Lookup e-mail in users object
function lookupEmail(email) {
  for (const userKey of Object.keys(users)) {
    if (users[userKey].email === email) {
      return userKey;
    }
  }
  return false;
}

// Filter urlDatabase using id
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