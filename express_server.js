const express = require("express");
const app = express();
const PORT = 8080;
const { generateRandomID, ifEmailExists, getUserIDByEmail, urlsForUser } = require('./helpers.js');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// database of URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// database of users
const users = { };

// server ON
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// page for users to create new tiny link
// must be above route for /urls/:shortURL,
// otherwise express will believe that urls_new is a new route parameter
app.get("/urls/new", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    const templateVars = {
      user,
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// shows all URLs in database, basically home page if logged in
app.get("/urls", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.redirect("/notLoggedIn");
  }
  const user = users[userID];
  const userUrls = urlsForUser(user.id, urlDatabase);
  const templateVars = {
    urls: userUrls,
    user,
  };
  res.render("urls_index", templateVars);
});

// shows edit page for :shortURL
app.get("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  if (!userID) {
    return res.redirect("/notLoggedIn");
  }
  if (userID !== urlDatabase[req.params.shortURL]['userID']) {
    return res.redirect("/errorPage");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]['longURL'],
    user: urlDatabase[req.params.shortURL]['userID']
  };
  res.render("urls_show", templateVars);
});

// redirects from tiny link to long URL associated with :shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]['longURL'];
  res.redirect(longURL);
});


// edits longURL
app.post("/urls/:shortURL", (req, res) => {
  const userID = req.session["user_id"];
  const user = users[userID];
  const shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = { 'longURL': longURL, 'userID': user.id };
  res.redirect(`/urls/${shortURL}`);
});

// adds new long URL to the database with the associated shortURL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomID();
  const userID = req.session["user_id"];
  const user = users[userID];
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = {'longURL' : longURL, 'userID': user.id  };
  res.redirect(`/urls/${shortURL}`);
});

// deletes shortURL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  
  if (!userID) {
    return res.redirect("/notLoggedIn");
  }

  if (userID !== urlDatabase[req.params.shortURL]['userID']) {
    return res.redirect("/errorPage");
  }

  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

// allows user to login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = "";

  // if user with email cannot be found
  if (!ifEmailExists(email, users)) {
    return res.status(403).send("Whoops! Something doesn't match. Please try again.");
  }
  // if either email or password field(s) is/are empty
  if (!email || !password) {
    return res.status(400).send("Whoops! Please provide your email and password.");
  }
  // if user with email is located, but password does not match
  if (ifEmailExists(email, users)) {
    userID = getUserIDByEmail(email, users);
    if (!bcrypt.compareSync(password, users[userID]['password'])) {
      return res.status(403).send("Whoops! Something doesn't match. Please try again.");
    }
  }
  req.session['user_id'] = userID;
  res.redirect("/urls");
});

// logs user out
app.post("/logout", (req, res) => {
  req.session['user_id'] = null;
  res.redirect("/urls");
});


// shows registration page
app.get("/register", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("register", templateVars);
});

// allows user to create new account
// salts and hashes password
// sets cookies for user and adds info to database
app.post("/register", (req, res) => {
  const userID = generateRandomID();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Whoops! Please provide your email and password.");
  }
  if (ifEmailExists(email, users)) {
    return res.status(400).send("Sorry, an account already exists for this email.");
  }
  users[userID] = {
    id: userID,
    email,
    password: bcrypt.hashSync(password, saltRounds),
  };
  req.session['user_id'] = userID;
  res.redirect("/urls");
});

// shows login page
app.get("/login", (req, res) => {
  const user = users[req.session["user_id"]];
  if (user) {
    return res.redirect("/urls");
  }
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});

// redirects '/' to the urls list
app.get("/", (req, res) => {
  res.redirect('/notLoggedIn');
});

// shows not logged in page
app.get("/notLoggedIn", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = {
    user,
  };
  res.render("notLoggedIn", templateVars);
});

// shows incorrect user page
app.get("/errorPage", (req, res) => {
  const user = users[req.session["user_id"]];
  const templateVars = {
    user,
  };
  res.render("errorPage", templateVars);
});


