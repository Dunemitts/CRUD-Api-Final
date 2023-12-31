var listOfLists = [];
let listCounter = 0;

const showBookDetails = (index) => {
    const book = myLibrary[index];
    const bookCard = document.getElementById(`book-${index}`);
    const bookTitle = bookCard.querySelector('.book-title');
    const bookAuthor = bookCard.querySelector('.book-author');
  
    bookTitle.textContent = `Title: ${book.title}`;
    bookAuthor.textContent = `Author: ${book.author_name}`;
  
    bookCard.classList.toggle('flipped');
  };
   
const getBooks = () => {
  let query = $("#bookQuery").val();
  $.getJSON(`https://openlibrary.org/search.json?title=${query}&limit=12`, successfullyExecutedAPI);
};

function createList() {
  listCounter++;
  let areaOfInfo = $("#list-contents");
  areaOfInfo.empty();
  let listTitle = $("#list-title-name").val();
  let listDescription = $("#list-content").val();
  let para = $(`<p class="list"; margin-bottom: 2.5%" data-index="${listCounter}">
    <strong>${listTitle}</strong><br>${listDescription}<br>
    <button class="open-list-btn">Open List</button>
    <button class="mod-list-btn">Modify List</button>
    <button class="delete-list-btn">Delete List</button>
  </p>`);
  para.appendTo($("#list-board"));
  let newList = [listTitle, listDescription];
  listOfLists.push(newList);

  let listIndex = listCounter - 1;
  para.find(".open-list-btn").click(() => openList(listIndex));
  para.find(".mod-list-btn").click(() => modListInfo(listIndex));
  para.find(".delete-list-btn").click(() => deleteList(listIndex));
}


function addToList(book, listIndex) {
  let list = listOfLists[listIndex];
  list.push(book);
  console.log(`Added ${book.title} by ${book.author_name} to ${list[0]}`);
}

function openList(index) {
  let selectedList = listOfLists[index];
  let listContents = $(`<p></p>`);
  let areaOfInfo = $("#list-contents");
  areaOfInfo.empty();
  console.log(`Opening list ${selectedList} with index of ${index}`)

  for (let i = 2; i < selectedList.length; i+=2) {
    const book = selectedList[i];
    const bookDetails = document.createElement('div');
    bookDetails.innerHTML = `
      <h4>Title: ${book.title}</h4>
      <p>Author: ${book.author_name}</p>
      <p><a href="https://openlibrary.org/${book.key}" style="color:white;">Link to ${book.title}</a></p>
    `;
    listContents.append(bookDetails);
  }
  
  listContents.appendTo(areaOfInfo);
}

function modListInfo(index) {
  let list = listOfLists[index];
  let newTitle = prompt("Update List Name", list[0]);
  let newDescription = prompt("Update List Description", list[1]);

  if (newTitle !== null && newDescription !== null) {
    list[0] = newTitle;
    list[1] = newDescription;
    $(`#list-board .list:eq(${index})`).find("strong").text(newTitle);
    let firstBr = $(`#list-board .list:eq(${index})`).find("br:first");
    $(`#list-board .list:eq(${index})`).contents().filter(function() {
      return this.nodeType === Node.TEXT_NODE && $(this).prevAll().is(firstBr);
    }).remove();
    firstBr.after(`${newDescription}`);
  }
}


function deleteList(index) {
  console.log(`Deleting index: ${index} + ${index + 1}`)
  $(`#list-board p`).eq(index).remove();
  listOfLists.splice(index, 1);
  let areaOfInfo = $("#list-contents");
  areaOfInfo.empty();

  $("#list-board p").each(function(index) {
    $(this).attr("data-index", index);
  });

  $("#list-board p.list").each(function() {
    let listIndex = parseInt($(this).attr("data-index"));
    $(this).find(".open-list-btn").off().click(() => openList(listIndex));
    $(this).find(".mod-list-btn").off().click(() => modListInfo(listIndex));
    $(this).find(".delete-list-btn").off().click(() => deleteList(listIndex));
  });

  listCounter = $("#list-board p").length;
}

const process = (books) => {
  let allBooks = ""; 
  books.docs.forEach(function (book) {
    let dropdownId = `${book.key}`;
    dropdownId = dropdownId.replace(/[^\w\s]|works/g, "");
    let titleCleared = `${book.title}`;
    titleCleared = titleCleared.replace(/[^a-zA-Z ]/g, "");
    let authorCleared = `${book.author_name}`;
    authorCleared = authorCleared.replace(/[^a-zA-Z ]/g, "");
    console.log(`Tracking ${book.title}, by ${book.author_name}. Key is ${dropdownId}`)
    let nextBook = `<div class="flip-card">
      <div class="flip-card-inner">
        <div class="flip-card-front">
        <img src="${book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : 'Cover Not Found.jpg'}"></div>
        <div class="flip-card-back">
          <div class="title" style="position: relative; text-align: center;font-size: x-large; top: 20px">${book.title}</div>
          <div class="autorName" style="position: relative; text-align: center;font-size: x-large; top: 30px">Author: ${book.author_name}</div>
          <div class="dropdown">
            <button onclick="discoverMenu('${titleCleared}', '${authorCleared}', '${book.key}', '${dropdownId}'); dropdownInteract('${dropdownId}')" class="dropbtn">Select A List</button>
            <div id='${dropdownId}' class="dropdown-content"></div>
          </div>
          <div class="link" style="position: absolute; text-align: center; bottom: 2.5%; color black"><a href="https://openlibrary.org/${book.key}" style="color:white;">Link to ${book.title}</a></div>
          </div>
      </div>
    </div>`;
    allBooks += nextBook;
  });
  return allBooks;
};

function discoverMenu(title, author, link, dropdownId) {
  let dropdownMenu = $(`#${dropdownId}`);
  dropdownMenu.empty();
    for (let i = 0; i < listOfLists.length; i++) {
      let list = listOfLists[i];
      let listTitle = list[0];
      let dropdownItem = $(`<a href="#">${listTitle}</a>`);
      dropdownItem.on("click", function() {
        let book = {title: title, author_name: author, key: link};
        list.push(book);
        addToList(book, i);
      });
    dropdownItem.appendTo(dropdownMenu);
  }
}
function dropdownInteract(dropdownId) {
  document.getElementById(dropdownId).classList.toggle("show");
}

window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

const successfullyExecutedAPI = (data) => {
  if (data.num_Found = 0){
    console.log("unsuccessfulAPI ", data);
    let markup = `<h4>No Books Found</h4>`;
    $("#bookList").html(markup);
  }else{
    console.log("successAPI ", data);
    let markup = process(data);
    $("#bookList").html(markup); 
  }
};

const searchBooks = () => {
  getBooks();
};

const setupPage = () => {
  $("#searchButton").click(searchBooks);
};

$(document).ready(setupPage);