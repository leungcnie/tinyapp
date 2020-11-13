const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["ajsdhjaksdh", "ad8fgu88isjuu"]
}));

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

// ROUTES
app.get("/", (req, res) => {
  const userID = req.session.user_id || null;
  if (userID) {
    return res.redirect("/urls")
  }
  res.redirect("/login");
})

app.get("/urls", (req, res) => {
  const userId = req.session.user_id || null;
  if (!userId) {
    return res.render("urls_index", {urls: null, user: null});
  }
  const user = users[userId];
  const filteredDatabase = urlsForUser(userId);
  const templateVars = {
    urls: filteredDatabase,
    user,
  };
  res.render("urls_index", templateVars);
})

// Add new URL to database
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id || null;
  if (!userId) {
    return res.redirect("/login");
  }
  const user = users[userId];
  const templateVars = { user };
  res.render("urls_new", templateVars);
})

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  const userID = req.session.user_id || null;
  if (!userID) {
    return res.status(400).send("You must be logged in to create new URL");
  }
  urlDatabase[shortURL] = { longURL, userID };
  console.log(`New TinyURL ${shortURL} created for ${longURL} for user ${userID}`);
  res.redirect(`/urls/${shortURL}`);
});

// Displays urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("That URL does not exist");
  }
  const longURL = urlDatabase[shortURL].longURL;
  const userId = req.session.user_id || null;
  if (urlDatabase[shortURL].userID !== userId) {
    return res.status(403).send("You cannot view this URL");
  }
  if (!userId) {
    return res.render("urls_show", { shortURL: null, longURL: null, user: null });
  }
  const user = users[userId];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

// Click on short URL -> redirected to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    return res.status(404).send("That URL does not exist");
  }
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Delete URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id || null;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You cannot delete this URL");
  }
  console.log(`${urlDatabase[shortURL].longURL} for user ${userID} deleted`);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// Redirect to urls_show for editing 
// app.post("/urls/:shortURL/edit", (req, res) => {
//   const shortURL = req.params.shortURL;
//   const userID = req.session.user_id || null;
//   if (urlDatabase[shortURL].userID !== userID) {
//     return res.status(403).send("You cannot edit this URL");
//   }
//   res.redirect(`/urls/${shortURL}`);
// })

// Edit long URL to new one
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL; // req.body => {longURL: URL}
  const userID = req.session.user_id || null;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You cannot edit this URL");
  }
  console.log(`${urlDatabase[shortURL].longURL} updated to ${longURL}`);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect("/urls");
})

// Login
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    return res.redirect("/urls");
  }
  const user = users[userID];
  const templateVars = { user };
  res.render("login", templateVars);
})

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("Cannot have empty email and password fields")
  }
  if (!user) {
    return res.status(403).send("Account not found");
  }
  if (!bcrypt.compareSync(password, users[user].password)) {
    return res.status(403).send("Password incorrect")
  }
  
  req.session.user_id = user;
  res.redirect("/urls");
})

// Logout
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
})

// Register
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = { user };
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const plainPassword = req.body.password;
  const password = bcrypt.hashSync(plainPassword, 10); // Hashed password
  // console.log(password);

  if (!email || !password) {
    return res.status(400).send("Cannot have empty email and password fields")
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send("Email already registered")
  }

  users[id] = { id, email, password };
  req.session.user_id = id;
  console.log("req.session", req.session);
  console.log("req.session.user_id", req.session.user_id);
  // console.log("USERS", users);
  res.redirect("/urls");
})


// START SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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