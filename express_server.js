const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.set("view engine", "ejs");


const generateRandomString = () => {
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXTZ0123456789abcdefghiklmnopqrstuvwxyz";
  let lengthString = 6;
  let randomString = '';
  for (let i = 0; i < lengthString; i++) {
    let rnum = Math.floor(Math.random() * characters.length);
    randomString += characters[rnum];
  }
  return randomString;
};


let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// Generate a short URL and get Long URL and push it in DB. After that redirect to a new page with a shortURL.
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Create a new short URL.
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Render a page with a new-created shortURL.
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});


// After clicking on the short URL: 1) check if this URL exists in DB and then redirect to a long URL.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) {
    res.send("<html><body>URL doesn't exist.</></body></html>\n");
  } else {
    res.redirect(longURL);
  }
});

// Home page.
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page that shows existing in DB URLs.
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Hello page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Delete URL
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});