const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer", session({secret:"fingerprint_customer", resave: true, saveUninitialized: true}))

// Authentication middleware for protected customer routes
app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if user is logged in and has valid access token
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        // Verify JWT token (using the same secret as in login)
        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;   // attach decoded payload (contains data & username)
                next();            // proceed to the protected route
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 3000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));