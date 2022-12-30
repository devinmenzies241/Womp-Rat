//App setup section
require("dotenv").config();
const express = require("express");
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const request = require("request");