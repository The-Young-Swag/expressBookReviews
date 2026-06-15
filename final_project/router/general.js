const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = 'http://localhost:5000';   // Full base URL with port 5000

// ---------- Internal API endpoints ----------
public_users.get('/api/books', (req, res) => {
    return res.json(books);
});

public_users.get('/api/books/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) return res.json(book);
    else return res.status(404).json({ message: "Book not found" });
});

public_users.get('/api/books/author/:author', (req, res) => {
    const author = req.params.author;
    const matches = Object.values(books).filter(b => b.author === author);
    if (matches.length) return res.json(matches);
    else return res.status(404).json({ message: "No books by this author" });
});

public_users.get('/api/books/title/:title', (req, res) => {
    const title = req.params.title;
    const matches = Object.values(books).filter(b => b.title === title);
    if (matches.length) return res.json(matches);
    else return res.status(404).json({ message: "No books with this title" });
});

// ---------- Registration ----------
public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Username and password are required." });
    if (users.some(u => u.username === username)) return res.status(409).json({ message: "Username already exists." });
    users.push({ username, password });
    return res.status(201).json({ message: "User registered successfully." });
});

// ---------- Task 10: Get all books (async + Axios) ----------
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/api/books`);
        return res.json(response.data);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching books" });
    }
});

// ---------- Task 11: Get book by ISBN (async + Axios) ----------
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;
        const response = await axios.get(`${BASE_URL}/api/books/isbn/${encodeURIComponent(isbn)}`);
        return res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "Book not found" });
        }
        return res.status(500).json({ message: "Error fetching book details" });
    }
});

// ---------- Task 12: Get books by author (async + Axios) ----------
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author;
        const response = await axios.get(`${BASE_URL}/api/books/author/${encodeURIComponent(author)}`);
        return res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "No books by this author" });
        }
        return res.status(500).json({ message: "Error fetching books by author" });
    }
});

// ---------- Task 13: Get books by title (async + Axios) ----------
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        const response = await axios.get(`${BASE_URL}/api/books/title/${encodeURIComponent(title)}`);
        return res.json(response.data);
    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "No books with this title" });
        }
        return res.status(500).json({ message: "Error fetching books by title" });
    }
});

// ---------- Book review ----------
public_users.get('/review/:isbn', function (req, res) {
    const book = books[req.params.isbn];
    if (book) return res.json(book.reviews || {});
    else return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
