const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {
  // 48-57 nums
  // 65-90
  // 97-122
  let output = "";
  // 62 alphanumeric characters in total
  for (i = 0; i < 6; i++) {
    let randomNum = Math.floor((Math.random() * 61) + 0);
    if (randomNum <= 9) {
      output += randomNum;
    } else if (randomNum > 9 && randomNum <= 35) {
      output += String.fromCharCode(randomNum - 10 + 65);
    } else if (randomNum > 35) {
      output += String.fromCharCode(randomNum - 10 - 26 + 97);
    }
  }
  return output;
}

console.log(generateRandomString());

app.set("view engine", "ejs"); // tells app to use EJS as template engine

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// organize routes from most specific to least
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

// submit new URL
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
})

app.post("/urls", (req, res) => {
  // console.log(req.body);  // {longURL: URL}
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.send(urlDatabase);         // Respond with 'Ok' (we will replace this)
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
