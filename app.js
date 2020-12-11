//const {MONGO_USERNAME, MONGO_PASSWORD} = require("./secrets.js");
const {insert, findById, findMany} = require("./database.js");
const {seed} = require("./seed.js");
const express = require("express");
const app = express();
const axios = require("axios");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static("public"));

//seed database
seed();

let MAX_BOOKS_PER_SHELF = 5;

//index
app.get('/', (req, res) => {

    findMany({}, function renderLibraryPage(data){
        res.render("home", {
            myLibrary: data,
            maxBooksPerShelf: MAX_BOOKS_PER_SHELF
        });
    });

});

//show my library book
app.get('/myBook/:id', (req, res) => {

    findById(req.params.id, function renderBookPage(data){
        res.render("book", {
            bookData: data,
            inMyLibrary: true
        });
    });

});

//show google book
app.get('/book/:id', async (req, res) => {

    const googleBookID = req.params.id;
    const url = `https://www.googleapis.com/books/v1/volumes/${googleBookID}`;

    try {
        let response = await axios.get(url);
        let bookData = formatBookDataFromGoogle(response.data);

        res.render("book", { bookData: bookData, inMyLibrary: false });

    } catch (err) {
        console.log("HTTP error: ", err);
    }

});

//write
app.post('/book', async (req, res) => {
    const googleBookID = req.body.bookID;
    const url = `https://www.googleapis.com/books/v1/volumes/${googleBookID}`;

    try {
        let response = await axios.get(url);
        let bookData = formatBookDataFromGoogle(response.data);

        insert(bookData, function redirectToLibrary(){
            res.redirect("/");
        });

    } catch (err) {
        console.log("Error inserting book", err);
        res.redirect("/");
    }
});


const port = process.env.PORT || 3000;
app.listen(port, function startServer() {
    console.log("jReads running");
});


function formatBookDataFromGoogle(data) {
    let extractedData = {};

    extractedData.id = data.id;
    extractedData.title = data.volumeInfo.title;
    extractedData.subtitle = data.volumeInfo.subtitle;
    extractedData.authors = data.volumeInfo.authors;
    extractedData.publisher = data.volumeInfo.publisher;
    extractedData.publishedDate = data.volumeInfo.publishedDate;
    extractedData.description = data.volumeInfo.description;
    extractedData.pageCount = data.volumeInfo.pageCount;
    extractedData.categories = data.volumeInfo.categories;
    extractedData.averageRating = data.volumeInfo.averageRating;
    extractedData.ratingsCount = data.volumeInfo.ratingsCount;
    extractedData.imageLinks = data.volumeInfo.imageLinks;

    return extractedData;
}