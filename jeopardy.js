const numCateg = 6;
const numClues = 5;
let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
    const res = await axios.get('https://jservice.io/api/categories', {params: { count : 100 }});
    console.log(res.data);
    const categoryIds = res.data.map(result => result.id);
    // .map() creates a new array populated with the results of calling a provided function on eveery element in the calling array. 

     return _.sampleSize(categoryIds, numCateg);  //Lodash  _.sampleSize(array, n) method
    // Gets one or n random elements at unique keys from collection up to the size of collection. Pass in categoryIds array. Specify n with NUM_Categories. The _.sampleSize() method is used to give an array of n random elements from the given array.
}

/** Return object with data about a category:
 *  Returns { title: "Math", clues: clue-array }
 */
async function getCategory(catId) {
    const res = await axios.get('https://jservice.io/api/category', {params: { id : catId }})
    
    let cluesList = res.data.clues;
    let randomClues = _.sampleSize(cluesList, numClues);
    // will make total of 6 reqests from API (numClues = 5);

    let clues = randomClues.map(clue => ({
        question: clue.question,
        answer: clue.answer,
        showing: null,
    }));

    console.log({title: res.data.title, clues });
   return { title: res.data.title, clues };
//    returns an object with title of a category and its array of clues
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable() {
    // const board = document.querySelector('#game-board');
    // board.innerHTML = '';
    // prevents window from creating extra boards on screen when player resets the game. 
    $('#game-board').empty();

    $('#game-board')
        .append($('<thead>').attr('id', 'top-row'))
        .append($('<tbody>').attr('id', 'main-board'));

    // Create cells for the top row of the board
    for (let x = 0; x < numCateg; x++){
        $('thead').append($('<th>').attr('id', x).text((categories[x].title).toUpperCase()));
    }
    // categories[x].title
    $('#game-board').append($('thead'));
    // Creates main board with dimensions numCategories(width) & numClues(height)
    for (let y = 0; y < numClues; y++){
        $('tbody').append($('<tr>').attr('id', y));

        for (let x = 0; x < numCateg; x++){
            $(`#${y}`).append($('<td>').attr('id',`${x}-${y}`).text('?'));
        }
    }
  }

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(e) {
    let id = e.target.id;
    console.log(id);
    let [y, x] = id.split('-');
        //Splits id into two parts with .split method. Assign them to an array. 

    let clue = categories[y].clues[x];
    console.log(clue);

    let msg; //create empty msg variable.  

    if (!clue.showing){
        msg = clue.question;
        clue.showing = "question";
        // if currently ?, show question(clue). 
    }
    else if (clue.showing === "question"){
        msg = clue.answer;
        clue.showing = "answer";
        // if curently question(clue), show answer.
    }
    else {
        return // returns nothing if the cell is currently "Answer", ignores click.
    }
    // Updates text of cell
    $(`#${y}-${x}`).html(msg);
} 

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */
function showLoadingView() {
    $('#loader').show(2500, hideLoadingView);
    setupAndStart();
    $('#game-board').hide();
    $('#startBtn').hide();
}

/** Remove the loading spinner and update the button used to fetch data. */
function hideLoadingView() {
    $('#loader').hide();
    $('#game-board').show();
    $('#startBtn').text('Restart').show();
}

/** Start game:
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    const catIds = await getCategoryIds();
    categories = [];

    for (let id of catIds){
        categories.push(await getCategory(id));
    }

    fillTable();
}

/** On click of start / restart button, set up game. */
$('#startBtn').on('click', showLoadingView);

/** On page load, add event handler for clicking clues */
$('#game-board').on('click', 'td', handleClick);




