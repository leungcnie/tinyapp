// DATA --------------------------------------------------
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
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
  for (const user of Object.keys(users)) {
    if (users[user].email === email) {
      return true;
    }
  }
  return false;
}

module.exports = {
  urlDatabase,
  users,
  generateRandomString,
  lookupEmail
};