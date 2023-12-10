const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const app = express();
app.use(express.json());

const fs = require("fs");
const data = fs.readFileSync("./users.json", "utf8");
const users = JSON.parse(data);
 
  // Endpoint for generating and returning a JWT token
  app.post("/login", (req, res) => {
    // In a real-world scenario, you would typically validate the user's credentials here
    const { username } = req.body;
    const user = users.find((el) => el.username === username);
    // Check if the username and password are correct
    if (user) {
      // Generate a JWT token
      const token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: "4h" });

      // Return the token to the client
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid username or email" });
    }
  });

// Protected endpoint that requires a valid JWT token
app.get("/protected", authenticateToken, (req, res) => {
  res.json({
    message: "You are authorized to access this protected resource.",
  });
});

// Middleware for authenticating JWT token
function authenticateToken(req, res, next) {
  // Extract the token from the Authorization header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify and decode the token
  jwt.verify(token,  process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Add the decoded user information to the request object
    req.user = decoded;
    next();
  });
}

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
