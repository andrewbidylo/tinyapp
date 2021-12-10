const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { findUserByEmail, generateRandomString, urlsForUser } = require('./helpers');
const { urlDatabase, users } = require('./database');


app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));


/*
* Create a new short URL
*/

// Generate a short URL and get Long URL and push it to DB. After that redirect to a new page with a shortURL.
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  const user = users[req.session["user_id"]];
  urlDatabase[shortURL] = { 'longURL': longURL, 'userID': user.id };
  if (typeof user === 'undefined') {
    return res.status(403).send('You do not have an access to this page!');
  }
  res.redirect(`/urls/${shortURL}`);
});


// Create a new short URL.
app.get("/urls/new", (req, res) => {
  const newUser = users[req.session["user_id"]];
  const templateVars = { user: newUser };
  if (!newUser) {
    res.redirect('/login');
  }
  res.render("urls_new", templateVars);
});

// Render a page with a new-created shortURL.
app.get("/urls/:shortURL", (req, res) => {
  const newUser = users[req.session["user_id"]];
  if (!users[req.session["user_id"]]) {
    return res.status(403).send('You do not have access to this ID');
  }
  let ownUrl = urlsForUser(newUser.id, urlDatabase);
  if (!ownUrl[req.params.shortURL]) {
    return res.status(403).send('You do not have access to this ID');
  }

  const templateVars = { shortURL: req.params.shortURL, longURL: ownUrl[req.params.shortURL]['longURL'], user: newUser };
  res.render("urls_show", templateVars);
});


/*
* Login / Logout
*/

app.get('/login', (req, res) => {
  res.render('login_page');
});

app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let foudUser = findUserByEmail(email, users);

  if (!foudUser) {
    return res.status(400).send('E-mail cannot be found');
  }
  const passwordCheck = bcrypt.compareSync(password, foudUser.password);
  if (!passwordCheck) {
    return res.status(403).send('Password is not correct');
  }

  req.session['user_id'] = foudUser.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

/*
* Registration
*/

app.get("/register", (req, res) => {
  const newUser = users[req.session["user_id"]];
  const templateVars = { user: newUser };
  res.render("registration_page", templateVars);
});
app.post('/register', (req, res) => {
  let userId = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  if (!email || !hashedPassword) {
    return res.status(400).send('Email or Password cannot be blank');
  }
  if (findUserByEmail(email, users)) {
    return res.status(400).send('Email already exists');
  }
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  };
  req.session['user_id'] = userId;
  res.redirect('/urls');
});


/*
* Editing a LongURL
*/

app.post('/urls/:id', (req, res) => {
  const newDB = urlsForUser(req.session["user_id"], urlDatabase);
  const id = req.params.id;
  if (!id) {
    return res.status(400).send('ID does not exist');
  }
  if (newDB[id]) {
    const newLongURL = req.body.longURL;
    urlDatabase[id]['longURL'] = newLongURL;
    return res.redirect('/urls');
  } else {
    return res.status(400).send('Please login');
  }
});


/*
* Delete a URL
*/

app.post('/urls/:shortURL/delete', (req, res) => {
  const newDB = urlsForUser(req.session["user_id"], urlDatabase);
  const shortURL = req.params.shortURL;
  if (newDB[shortURL]) {
    delete urlDatabase[shortURL];
    return res.redirect('/urls');
  } else {
    return res.status(400).send('Please log in');
  }
});


/*
* Redirect to a long URL
*/

// After clicking on the short URL: check if this URL exists in DB and then redirect to a long URL.
app.get("/u/:shortURL", (req, res) => {
  let shortURL = urlDatabase[req.params.shortURL];

  if (shortURL === undefined) {
    return res.status(400).send('URL does not exist');
  } else {
    const longURL = shortURL['longURL'];
    res.redirect(longURL);
  }
});


/*
* Home page
*/

app.get("/", (req, res) => {
  const newUser = users[req.session["user_id"]];
  if (!newUser) {
    return res.redirect('/login');
  } else {
    res.redirect('/urls');
  }
});


/*
* URLs page
*/

app.get("/urls", (req, res) => {
  const newUser = users[req.session["user_id"]];
  if (!newUser) {
    return res.status(403).send('Please log in or register first!');
  }
  let ownURLs = urlsForUser(newUser.id, urlDatabase);
  const templateVars = { urls: ownURLs, user: newUser };
  res.render("urls_index", templateVars);
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});