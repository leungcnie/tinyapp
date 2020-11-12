const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const { urlDatabase, users, generateRandomString, lookupEmail, urlsForUser } = require('./data_helpers');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// ROUTES

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"] || null;
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
  const userId = req.cookies["user_id"] || null;
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
  const userId = req.cookies["user_id"] || null;
  if (!userId) {
    return res.render("urls_show", { shortURL: null, longURL: null, user: null });
  }
  if (urlDatabase[shortURL].userID !== userId) {
    return res.status(403).send("You cannot view this URL");
  }
  const user = users[userId];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

// Click on short URL -> redirected to long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Delete URL resource
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"] || null;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You cannot delete this URL");
  }
  console.log(`${urlDatabase[shortURL].longURL} deleted`);
  delete urlDatabase[shortURL];
  res.redirect("/urls");
})

// Redirect to urls_show for editing 
app.post("/urls/:shortURL/edit", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"] || null;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You cannot edit this URL");
  }
  res.redirect(`/urls/${shortURL}`);
})

// Edit long URL to new one
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL; // req.body => {longURL: URL}
  const userID = req.cookies["user_id"] || null;
  if (urlDatabase[shortURL].userID !== userID) {
    return res.status(403).send("You cannot edit this URL");
  }
  console.log(`${urlDatabase[shortURL].longURL} updated to ${longURL}`);
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect("/urls");
})

// Login
app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { user };
  res.render("login", templateVars);
})

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
  if (!bcrypt.compareSync(password, users[userKey].password)) {
    return res.status(403).send("Password incorrect")
  }
  
  res.cookie("user_id", userKey);
  res.redirect("/urls");
})

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// Register
app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { user };
  res.render("register", templateVars);
})

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const plainPassword = req.body.password;
  const password = bcrypt.hashSync(plainPassword, 10); // Hashed password
  console.log(password);

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


// START SERVER
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});