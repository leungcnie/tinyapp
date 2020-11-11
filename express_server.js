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

// ROUTES ----------------------------------------------------------

// POST /login
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
})

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
})

// Submit new URL to database
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new");
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
  const templateVars = { 
    shortURL: shortURL, 
    longURL: urlDatabase[shortURL],
    username: req.cookies["username"],
  };
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
  // console.log(req.params); // {shortURL: b2xVn2}
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL; // req.body => {longURL: URL}
  console.log(`${urlDatabase[shortURL]} updated to ${newLongURL}`);
  urlDatabase[shortURL] = newLongURL;
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
    if (randomNum <= 9) { // numbers
      output += randomNum;
    } else if (randomNum > 9 && randomNum <= 35) { // calculate ASCII uppercase letters
      output += String.fromCharCode(randomNum - 10 + 65);
    } else if (randomNum > 35) { // calculate ASCII lowercase letters
      output += String.fromCharCode(randomNum - 10 - 26 + 97);
    }
  }
  return output;
}