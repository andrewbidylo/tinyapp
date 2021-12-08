const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
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

// DATA
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "123"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "123"
  }
};

const findUserByEmail = (email) => {
  for (let userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null;
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
  const newUser = users[req.cookies["user_id"]];
  const templateVars = { user: newUser };
  res.render("urls_new", templateVars);
});

// Render a page with a new-created shortURL.
app.get("/urls/:shortURL", (req, res) => {
  const newUser = users[req.cookies["user_id"]];
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: newUser };
  res.render("urls_show", templateVars);
});

// Login form
app.get('/login', (req, res) => {
  res.render('login_page');
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let foudUser = findUserByEmail(email);
  if (!foudUser) {
    return res.status(403).send('E-mail cannot be found');
  }
  if (foudUser.password !== password) {
    return res.status(403).send('Password is not correct');
  }
  res.cookie('user_id', foudUser.id);
  res.redirect('/urls');

});

// Registration
app.get("/register", (req, res) => {
  const newUser = users[req.cookies["user_id"]];
  const templateVars = { user: newUser };
  res.render("registration_page", templateVars);
});
app.post('/register', (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Email or Password cannot be blank');
  }
  if (findUserByEmail(email)) {
    return res.status(400).send('Email already exists');
  }
  users[userId] = {
    id: userId,
    email,
    password,
  };
  res.cookie('user_id', userId);
  res.redirect('/urls');
});

// Editing a LongURL
app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id] = newLongURL;
  res.redirect('/urls');
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
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
  const newUser = users[req.cookies["user_id"]];
  const templateVars = { urls: urlDatabase, user: newUser };
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