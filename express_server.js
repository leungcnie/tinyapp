const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { urlDatabase, users, generateRandomString, lookupEmail } = require('./data_helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTES ----------------------------------------------------------

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
})

// Submit new URL to database
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"] || false;
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
  const userID = req.cookies["user_id"];
  urlDatabase[shortURL] = { longURL, userID };
  console.log(`New TinyURL ${shortURL} created for ${longURL}`);
  res.redirect(`/urls/${shortURL}`);
});

// Displays urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Remove URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  console.log(`${urlDatabase[shortURL]} deleted`);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// Redirect to urls_show when Edit button pressed
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(`/urls/${shortURL}`);
})

// Edit URL resource: update with new longURL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL; // req.body => {longURL: URL}
  const userID = req.cookies["user_id"];
  console.log(`${urlDatabase[shortURL]} updated to ${newLongURL}`);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect("/urls");
})

// POST /login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userKey = lookupEmail(email) || false;

  if (!email || !password) {
    return res.status(400).send("Cannot have empty email and password fields")
  }

  if (!userKey) {
    return res.status(403).send("Account not found");
  }
  
  // console.log("lookup email value:", lookupEmail(email));
  if (users[userKey].password !== password) {
    return res.status(403).send("Password incorrect")
  }
  
  res.cookie("user_id", userKey);
  res.redirect("/urls");
})

// POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// GET /register
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { user };
  res.render("register", templateVars);
})

// POST /register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Cannot have empty email and password fields")
  }

  if (lookupEmail(email)) {
    return res.status(400).send("Email already registered")
  }

  users[id] = { id, email, password };
  res.cookie("user_id", id);
  // console.log("USERS", users);
  res.redirect("/urls");
})

// GET /login
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { user };
  res.render("login", templateVars);
})

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});