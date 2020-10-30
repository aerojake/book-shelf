const express = require("express");
const fetch = require("node-fetch");

//search for book
function Book() {

    var listOfBooks = [];
    //take in a search term
    //return an object with results
    async function searchTitle(title) {
        console.log(`searching for title: ${title}`);

        //GET https://www.googleapis.com/books/v1/volumes/volumeIdHere
        //GET https://www.googleapis.com/books/v1/volumes?q=quilting
        return fetch(`https://www.googleapis.com/books/v1/volumes?q=${title}`)
            .then((res) => res.json())
            .then((searchResults) => {
                //console.log(searchResults);
                //console.log(searchResults.items[0].volumeInfo.title);
                //id
                //data.items[0].id
                //data.items[0].volumeInfo.title
                //data.items[0].volumeInfo.subtitle
                //data.items[0].volumeInfo.authors[]
                //data.items[0].volumeInfo.description
                //data.items[0].volumeInfo.averageRating
                //data.items[0].volumeInfo.imageLinks.thumbnail
                //console.log(searchResults.items);
                //summarizeSearch(searchResults.items);
                searchResults.items;

            });
    }

    function summarizeSearch(searchResults) {
        console.log(`in summarizeSearch: ${searchResults}`);
        // let resultSummary = [];

        // for (let i = 0; i < searchResults.length; i++) {
        //     resultSummary.push(
        //         {
        //             id: searchResults[i].id,
        //             title: searchResults[i].volumeInfo.title,
        //             subtitle: searchResults[i].volumeInfo.subtitle,
        //             authors: searchResults[i].volumeInfo.authors,
        //             description: searchResults[i].volumeInfo.description,
        //             averageRating: searchResults[i].volumeInfo.averageRating,
        //             thumbnail: searchResults[i].volumeInfo.imageLinks.thumbnail
        //         });
        // }
        // console.log(`Result Summary: ${resultSummary}`);
        // return resultSummary;
    }


    var bookAPI = {
        print() {
            console.log("hello");
        },
        printFunny() {
            console.log("hahahah");
        },
        search(searchTerm) {
            searchTitle(searchTerm)
                .then((seachResults) => {
                    console.log(searchResults);
                });


        }
    }

    return bookAPI;
}

module.exports = Book;