//#region ----- NAME INPUT -----
// On page load, check if the user has a name stored in cookies
$(document).ready(() => {
    // Get name from cookies
    const name = document.cookie.split('; ').find(row => row.startsWith('name='));
    if (name) {
        // Set name in input
        $('#name-input').val(name.split('=')[1]);
    }
})

// When the user types in their name at the top, store the name in cookies
$('#name-input').on('input', () => {
    // Store name in cookies
    document.cookie = `name=${$('#name-input').val()}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
})
//#endregion

//#region ----- QUEUE BUTTONS -----
const buttons = [['#aff-button', 'Aff Speech'],
                 ['#neg-button', 'Neg Speech'],
                 ['#question-button', 'Questioning']];

buttons.forEach(element => {
    $(element[0]).click(() => {

        // If button is not already selected
        if (!$(element[0]).hasClass('selected')) {
            // Add 'selected class
            $(element[0]).addClass('selected');
            // Change text
            $(element[0]).text('Unqueue');

            // Send POST request to server
            $.post('/queue', {name: $('#name-input').val(), type: element[1]});

        } else {
            // Remove 'selected' class
            $(element[0]).removeClass('selected');
            // Change text
            $(element[0]).text('Queue for ' + element[1]);

            // Send POST request to server
            $.post('/unqueue', {name: $('#name-input').val(), type: element[1]});
        }
    });
});
//#endregion

//#region ----- LIVE POLLING -----
/**
 * Function to update the dasboard. Data is in the following JSON format:
 * {
 *  speaker: {
 *      name: string,
 *      disposition: string,
 *      timeRemaining: string,
 *      number: number,
 *  },
 *  aff: {
 *     totalSpeeches: number,
 *     lastSpeaker: string,
 *     speechTime: number
 *  },
 *  neg: {
 *    totalSpeeches: number,
 *    lastSpeaker: string,
 *    speechTime: number,
 *  },
 *  question: {
 *      totalBlocks: number,
 *      lastQuestioner: string
 *  }
 *  speakingOrder: {
 *     precedent: string[],
 *     recency: string[],
 *     queue: {
 *        aff: string[],
 *       neg: string[],
 *     }
 *  },
 *  questionOrder: {
 *    precedent: string[],
 *   recency: string[],
 *  queue: string[] 
 *  }
 * }
 */
// Function to constantly update the dashboard
function update() {
    $.get('/data', (data) => {
        // Update various elements
        $('#current-speaker').text(data.speaker.name);
        $('#disposition').text(data.speaker.disposition);
        $('#time-remaining').text(data.speaker.timeRemaining);
        
        if (data.disposition !== 'questioning') {
            $('#current-number').text('Speaker ' + data.speaker.number);
        } else {
            $('#current-number').text('Questioner ' + data.speaker.number);
        }
    })
}

// Run the update function every 1,000 milliseconds
setInterval(update, 1000);