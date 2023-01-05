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
  //create variable from user input email field
  const email = req.body.email;

  //creates object to communicate with mailchimp api user input fields
  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
    }]
  };

  //stringify json data from data object to send to mailchimp
  const jsonData = JSON.stringify(data);
  //url to post our https request to via mailchimp
  const url = `https://us12.api.mailchimp.com/3.0/lists/${listId}`;
  // options needed to authenticate Mailchimp post request to the correct API Key & Server location
  const options = {
    method: "POST",
    auth: apiKey,
  };

  //save request to variable & process logic for redirect pages. 
  const request = https.request(url, options, function(response) { 
    // opon receiving the JSON response from Mailchimp's api, parse that data to look for errors
    response.on("data", function(data) {
      const responseBack = JSON.parse(data);
      if (responseBack.errors[0]) { //if errors are present 
        console.log(responseBack.errors[0]);//log the errors 
        //if we receive the specific error that a contact already exists, send the contact exists failure page
        if(responseBack.errors[0].error_code === "ERROR_CONTACT_EXISTS") {
          res.sendFile(__dirname + "/failureContactExists.html"); 
        //otherwise, just send the normal failure page for all other errors
        } else {
          res.sendFile(__dirname + "/failure.html");
        }
      //if no errors are found, send the success page
      } else {
        console.log("No errors, contact added!");
        res.sendFile(__dirname + "/success.html");
      }
    });
  });
  //send our stringified JSON to mailchimp to post to their server
  request.write(jsonData);
  //end the request & stop page from infinitely looping
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

// Contact page form requests, same process as the post request for the home page.
app.post("/contact", (req, res) => {
  const email = req.body.email;

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

  //same process as above to redirect user to correct success vs. failure pages
  const request = https.request(url, options, function(response) {
    response.on("data", function(data) {
      const responseBack = JSON.parse(data);
      if (responseBack.errors[0]) {
        console.log(responseBack.errors[0]);
        if(responseBack.errors[0].error_code === "ERROR_CONTACT_EXISTS") {
          res.sendFile(__dirname + "/failureContactExists.html"); 
        } else {
          res.sendFile(__dirname + "/failure.html");
        }
      } else {
        res.sendFile(__dirname + "/success.html");
      }
    });
  });
  request.write(jsonData);
  request.end();
});

//starts server on PORT / localhost:3000
app.listen(process.env.PORT || 3000)
console.log("Server Started!")