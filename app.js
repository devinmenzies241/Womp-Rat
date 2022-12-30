//node modules
const express = require("express");
const request = require("request");
const https = require("https");
const mailchimp = require("@mailchimp/mailchimp_marketing");
const ejs = require("ejs");
const _ = require("lodash");

//env variables for Mailchimmp api key
require("dotenv").config();
let apiKey = process.env.API_KEY;
let listId = process.env.LIST_ID;

const app = express();

//sets up ejs (points at views folder)
app.set('view engine', 'ejs');

//allow for use of public folder for serving static files (not hosted outside of the site)
app.use(express.static("public"));

//setup express to activate body parser to get JSON jsonData
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));


//https get routes for each webpage
app.get("/", function(req, res) {
  res.render("index");
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.get("/music", function(req, res) {
  res.render("music");
});

app.get("/media", function(req, res) {
  res.render("media");
});

app.get("/shows", function(req, res) {
  res.render("shows");
});

app.get("/contact", function(req, res) {
  res.render("contact");
});


//post route sends email entered to mailchimp servers
app.post("/", (req, res) => {
  const email = req.body.email;

  //creates object to communicate with mailchimp api user input fields
  const data = {
    members: [{
      email_address: email,
      status: "subscribed"
    }]
  };

  //stringify json data to send to mailchimp
  const jsonData = JSON.stringify(data);
  //url to post our https request to via mailchimp
  const url = `https://us12.api.mailchimp.com/3.0/lists/${listId}`;
  // options needed to authenticate Mailchimp post request to the correct API Key & Server location
  const options = {
    method: "POST",
    auth: apiKey
  };

  //save request to variable
  const request = https.request(url, options, function(response) {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    });
  });
  //send our stringified JSON to mailchimp
  request.write(jsonData);
  //end the request & stop page loading
  request.end();
});


//setup success route
app.post("/success", function(req, res) {
  res.redirect("/");
});

//singup failure page route
app.post("/failure", function(req, res) {
  res.redirect("/");
});

// Contact page form requests
app.post("/contact", (req, res) => {
  const email = req.body.email;

  //creates object to communicate with mailchimp api user input fields
  const data = {
    members: [{
      email_address: email,
      status: "subscribed"
    }]
  };
  const jsonData = JSON.stringify(data);
  const url = `https://us12.api.mailchimp.com/3.0/lists/${listId}`;
  const options = {
    method: "POST",
    auth: apiKey
  };
  const request = https.request(url, options, function(response) {
    if (response.statusCode === 200) {
      res.sendFile(__dirname + "/success.html");
    } else {
      res.sendFile(__dirname + "/failure.html");
    }
    response.on("data", function(data) {
      console.log(JSON.parse(data));
    });
  });
  request.write(jsonData);
  request.end();
});

//starts server on heroku / localhost:3000
app.listen(process.env.PORT || 3000)
console.log("Server Started!")




