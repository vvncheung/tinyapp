const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const morgan = require(morgan);
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

// database of URLs
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

// database of users
const users = {};

// turns on server
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// page for users to create new tiny link
// must be above route for /urls/:shortURL,
// otherwise express will believe that urls_new is a new route parameter
app.get("/urls/new", (req, res) => {
  const user = users[req.cookies["user_id"]];
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
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

// shows edit page for :shortURL
app.get("/urls/:shortURL", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user,
  };
  res.render("urls_show", templateVars);
});

// redirects from tiny link to long URL associated with :shortURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// shows confirmation after adding new url
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// helper function: ID generator
const generateRandomString = function() {
  //let key = Math.random().toString(36).substr(2, 8);
  let key = "";
  let char = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz";
  for (let i = 0; i < 6; i++) {
    key += char[Math.floor(Math.random() * char.length)];
  }
  return key;
};

// helper function: checks if email given already exists in database "users"
const isEmailExists = function(email) {
  for (let userID of Object.keys(users)) {
    if (email === users[userID]['email']) {
      return true;
    }
  }
  return false;
};

// helper function: get userID by email
const getUserIDByEmail = function(email) {
  for (let userID of Object.keys(users)) {
    if (email === users[userID]['email']) {
      return userID;
    }
  }
  return false;
};

// deletes :shortURL entry from database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

//
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    shortURL,
    longURL,
    user
  };
  res.render("urls_show", templateVars);
});

// allows user to login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = "";

  // if user with email cannot be found
  if (!isEmailExists(email)) {
    return res.status(403).send("Whoops! Please try again.");
  }
  // if user with email is located, but password does not match
  if (isEmailExists(email)) {
    userID = getUserIDByEmail(email);
    if (password !== users[userID]['password']) {
      return res.status(403).send("Whoops! Please try the password.");
    }
  }

  res.cookie('user_id', userID);
  res.redirect("/urls");
});

// logs user out
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


// shows registration page
app.get("/register", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
  };
  res.render("register", templateVars);
});

// allows user to input data to register page
// if email or password fields are empty, returns 404
// if email is duplicate, returns 404
// else, creates new account
app.post("/register", (req, res) => {
  const userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Whoops! Please try again.");
  }
  if (isEmailExists(email)) {
    return res.status(400).send("Whoops! Please try again.");
  }

  users[userID] = { "id": userID, "email": email, "password": password };
  console.log(users);
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

// shows login page
app.get("/login", (req, res) => {
  const user = users[req.cookies["user_id"]];
  const templateVars = {
    user,
  };
  res.render("login", templateVars);
});



