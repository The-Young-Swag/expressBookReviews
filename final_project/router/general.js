const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';


public_users.get('/api/books', (req, res) => {
    return res.json(books);
});

public_users.get('/api/books/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.json(book);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

public_users.get('/api/books/author/:author', (req, res) => {
    const author = req.params.author;
    const matches = Object.values(books).filter(b => b.author === author);
    if (matches.length > 0) {
        return res.json(matches);
    } else {
        return res.status(404).json({ message: "No books by this author" });
    }
});

public_users.get('/api/books/title/:title', (req, res) => {
    const title = req.params.title;
    const matches = Object.values(books).filter(b => b.title === title);
    if (matches.length > 0) {
        return res.json(matches);
    } else {
        return res.status(404).json({ message: "No books with this title" });
    }
});


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." });
    }

    const userExists = users.some(user => user.username === username);
    if (userExists) {
        return res.status(409).json({ message: "Username already exists." });
    }

    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});


public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/books`);
        // Return the data in a nicely formatted way
        return res.json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});


public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`${BASE_URL}/api/books/isbn/${isbn}`);
        return res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(500).json({ message: "Error fetching book details" });
    }
});


public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        // encode the author name to handle spaces/special chars
        const response = await axios.get(`${BASE_URL}/api/books/author/${encodeURIComponent(author)}`);
        return res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "No books by this author" });
        }
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});


public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const response = await axios.get(`${BASE_URL}/api/books/title/${encodeURIComponent(title)}`);
        return res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "No books with this title" });
        }
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});


public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.json(book.reviews || {});
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;