if (!(typeof module === "undefined")) {
    const fetchBooks = require("./bookapi.js");
}

const BASE_PATH  = ""; //"/jreads";
const MAX_SEARCH_RESULT = 10;
const searchInput = document.querySelector(".search input");
const searchBtn = document.querySelector(".search button");
const searchResults = document.querySelector(".searchResults");
const searchDropDown = document.querySelector("#searchDropDown");

document.addEventListener("DOMContentLoaded", () => {
    //DOMContentLoaded used for jest test:  call after dom is loaded to avoid error
    searchBtn.addEventListener("click",
        function searchBtnClick() {
            searchBox(searchInput.value);
        });

    searchInput.addEventListener("keyup",
        function executeSearchOnEnter(event){
            if(event.key === "Enter"){
                searchBox(searchInput.value);
            }
        });

    const onSearchInput = debouncer(()=>{
        searchBox(searchInput.value);
    }, 500);
    searchInput.addEventListener("input", onSearchInput);
        
});

function searchBox(term) {
    if (term == "") {
        clearChildrenOf(searchResults);
        return;
    }

    let getBooks = fetchBooks();
    getBooks.searchByTerm(term)
        .then(books => dropDownForSearchResults(books));
}

function dropDownForSearchResults(books) {
    clearChildrenOf(searchResults);
    searchDropDown.setAttribute("class", "is-active");
    for (let i = 0; i < books.length && i < MAX_SEARCH_RESULT; i++) {
        createOneDropDownItem(books[i]);
        if(i < MAX_SEARCH_RESULT-1){
            let dividerLine = document.createElement("hr");
            dividerLine.setAttribute("class", "dropdown-divider");
            searchResults.appendChild(dividerLine);
        }
    }
    clickAwayToClose(searchResults, searchInput);
}

function clearChildrenOf(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function clickAwayToClose(...ignoreElements) {
    let listenWindowClick = function (clickedElement) {
        for (let element of ignoreElements) {
            if (clickedElement.target === element) return;
        }
        searchDropDown.removeAttribute("is-active");
        searchDropDown.setAttribute("class", "dropdown-menu");
        clearChildrenOf(searchResults);
        window.removeEventListener("click", listenWindowClick);
    }
    window.addEventListener("click", listenWindowClick);
}

function createOneDropDownItem(book) {
    let bookItem = document.createElement("li");
    let link = document.createElement("a");
    let media = document.createElement("div");
    let mediaLeft = document.createElement("div");
    let image = document.createElement("img");
    let mediaContent = document.createElement("div");
    let content = document.createElement("div");
    let title = document.createElement("p");
    let authors = document.createElement("p");

    bookItem.setAttribute("class", "dropdown-item")
    link.setAttribute("class", "searchResult"); //searchResult
    link.setAttribute("href", `${BASE_PATH}/findBook/${book.id}`);
    media.setAttribute("class", "media");

    if (book.imageLinks !== undefined) {
        image.setAttribute("src", book.imageLinks.smallThumbnail);
    }
    if (book.title !== undefined) {
        title.innerText = book.title;
    }
    if (book.authors !== undefined) {
        authors.innerText = formatAuthorList(book.authors);
    }

    image.setAttribute("class", "searchImage");
    mediaContent.setAttribute("class", "media-content");
    content.setAttribute("class", "content");
    title.setAttribute("class", "searchTitle");
    authors.setAttribute("class", "searchAuthors");

    bookItem.appendChild(link);
    link.appendChild(media);
    media.appendChild(mediaLeft);
    mediaLeft.appendChild(image);
    media.appendChild(mediaContent);
    mediaContent.appendChild(content);
    content.appendChild(title);
    content.appendChild(authors);
    searchResults.appendChild(bookItem);
}

function formatAuthorList(authorList) {
    let authorText = "";

    if (authorList === undefined || authorList.length == 0) {
        authorText = "By: unknown";
    } else {
        authorText = `By: ${authorList[0]}`;
        for (let i = 1; i < authorList.length; i++) {
            authorText.concat(`, ${authorList[i]}`);
        }
    }
    return authorText;
}

function fetchBookByID(id) {
    if (id == "") {
        return;
    }

    let getBookData = fetchBooks();
    return getBookData.fetchById(id);
}

//NOT USING CURRENTLY
//display's book results on current page.
// function displayBookDetails(data) {
//     const bookDisplay = document.querySelector(".bookDetails");
//     clearChildrenOf(bookDisplay);

//     let title = document.createElement("h3");
//     let subtitle = document.createElement("h4");
//     let authors = document.createElement("p");
//     let publishedDate = document.createElement("p");
//     let coverArt = document.createElement("img");
//     let description = document.createElement("p");
//     let pageCount = document.createElement("p");
//     let averageRating = document.createElement("p");

//     if (data.title !== undefined) {
//         title.innerText = data.title;
//     }
//     if (data.subtitle !== undefined) {
//         subtitle.innerText = data.subtitle;
//     }
//     if (data.authors !== undefined) {
//         authors.innerText = formatAuthorList(data.authors);
//     }
//     if (data.publishedDate !== undefined) {
//         publishedDate.innerText = `Published: ${data.publishedDate}`;
//     }
//     if (data.imageLinks.thumbnail !== undefined) {
//         coverArt.setAttribute("src", data.imageLinks.thumbnail);
//     }
//     if (data.description !== undefined) {
//         description.innerText = data.description;
//     }
//     if (data.pageCount !== undefined) {
//         pageCount.innerText = `Page Count: ${data.pageCount}`;
//     }
//     if (data.averageRating !== undefined) {
//         averageRating.innerText = `Rating: ${data.averageRating} out of 5`;
//     }


//     bookDisplay.appendChild(title);
//     bookDisplay.appendChild(subtitle);
//     bookDisplay.appendChild(authors);
//     bookDisplay.appendChild(publishedDate);
//     bookDisplay.appendChild(coverArt);
//     bookDisplay.appendChild(description);
//     bookDisplay.appendChild(pageCount);
//     bookDisplay.appendChild(averageRating);

// }

if (!(typeof module === "undefined")) {
    //for testing
    module.exports.getBook = fetchBookByID;
    module.exports.displaySingleBookResult = createOneDropDownItem;
}

