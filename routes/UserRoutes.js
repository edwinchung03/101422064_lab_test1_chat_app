// First, import all necessary libraries
const express = require('express');
const http = require('http');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = express();
const server = http.createServer(app);
const User = require('../models/User');
const { body } = require('express-validator');
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/signup', [
  // validating errors with express-validator
  body("username").notEmpty().withMessage("Username is required"),
  body("firstname").notEmpty().withMessage("Please provide a first name"),
  body("lastname").notEmpty().withMessage("Please provide your last name"),
  body("password").isLength(6).withMessage("Password must have at least 6 characters")],
  async (req, res) => {
  // my requested bodies for /signup
  const { username, firstname, lastname, password } = req.body;
  
  try {
    let user = await User.findOne({ username });
    if (user) {
      // sample error response if user already exists
      return res.status(400).json({ 
        status: false,
        message: "User already exists" 
      });
    }

    // Process of hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
  
    // add new user into the database with my datas
    user = new User({
      username,
      firstname,
      lastname,
      password: hashedPassword,
    });
  
    await user.save();

    // sample output
    return res.status(201).json({
      message: "User created successfully",
      user_id: user._id,
    });

  } catch (err) {
        
    // proper error messages for my code
    console.log(err.message);
    return res.status(500).send("Server error: check your console");
  }
});

const io = require('socket.io')(server);

router.post( '/login', [
  // validating errors with express-validator
  body("username").notEmpty().withMessage("Please provide a valid username"),
  body("password").notEmpty().withMessage("Password must have at least 6 characters")],
  async (req, res) => {
  // email & password :  requested bodies
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });
    // if user doesn't exist
    if (!user) {
      return res.status(404).json({ 
        status: false,
        message: "User doesn't exist" 
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    // if email and password doesn't match
    if (!isMatch) {
      return res.status(400).json({ 
        status: false,
        message: "Invalid Password" 
      });
    }
    const payload = {
      user: {
        id: user.id,
        username: user.username,
      },
    };

    const JWT_SECRET = 'MySecretJWTToken';

    // for the jwt token
    jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" }, (err, token) => {
        if (err){
            console.error('Error generating token:', err);
            return res.status(500).json({ message: 'Error generating token', error: err });
        }

        io.on('connection', (socket) => {
            socket.emit('user_logged_in', { id: user.id, username: user.username });
        });
        
        return res.status(200).json({
            message: "Login successful",
            username: user.username,
            userId: user._id,
            jwt_token: token,
        });
    });

    } catch (err) {
      console.log(err.message);
      return res.status(500).send("Server error : check your console");
    }
});

module.exports = router;