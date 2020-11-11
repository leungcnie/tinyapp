const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

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
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { user };
  res.render("urls_new", templateVars);
})

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(`New TinyURL ${shortURL} created for ${req.body.longURL}`);
  res.redirect(`/urls/${shortURL}`);
});

// Displays urls_show page
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const userId = req.cookies["user_id"];
  const user = users[userId];
  const templateVars = { shortURL, longURL, user };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
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
  const newLongURL = req.body.longURL; // req.body => {longURL: URL}
  console.log(`${urlDatabase[shortURL]} updated to ${newLongURL}`);
  urlDatabase[shortURL] = newLongURL;
  res.redirect("/urls");
})

// POST /login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie("user_id", username);
  res.redirect("/urls");
})

// POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
})

// GET /register
app.get("/register", (req, res) => {
  const user = req.cookies["user_id"];
  const templateVars = { user };
  res.render("urls_register", templateVars);
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
  console.log("USERS", users);
  res.redirect("/urls");
})

// Start server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

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