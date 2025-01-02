/**
 * Writes the specified session object to a file named
 * with the session's id, specifically in the format "{session-id}.json"
 *
 * @param {Object} session - The session object to save to a file.
 */
const save = session => {
  const fs = require('fs');
  const jsonData = JSON.stringify(session);
  fs.writeFileSync( "sessions/" + session.id + '.json', jsonData);
}

/**
 * Returns the session object with the specified id.
 *
 * @param {string} id - The id of the session object to read.
 */
const read = sessionID => {
  try {
    const fs = require('fs');
    const jsonData = fs.readFileSync("sessions/" + sessionID + '.json');
    return JSON.parse(jsonData);
  } catch (err) {
    return {
      "error": "No sesion found"
    };
  }
}

const sortQueue = (queue, type) => {
  
  if (type == "aff" || type == "neg") {

    // sort by speaking precedence
    queue = session.speaking.precedence.filter(a => queue.includes(a[0]));
    
      // Now sort speaking order by index in speaking recency
      queue.sort((a, b) => {
          if (a[1] == b[1]) {
              let aIndex = session.speaking.recency.indexOf(a[0]);
              let bIndex = session.speaking.recency.indexOf(b[0]);
              return aIndex - bIndex;
          } else {
              return 1;
          }
      });

      return queue.map(a => a[0]);
  } else {
    
      // sort by questioning precedence
      queue = session.questioning.precedence.filter(a => queue.includes(a[0]));

        // Now sort speaking order by index in speaking recency
        queue.sort((a, b) => {
            if (a[1] == b[1]) {
                let aIndex = session.questioning.recency.indexOf(a[0]);
                let bIndex = session.questioning.recency.indexOf(b[0]);
                return aIndex - bIndex;
            } else {
                return 1;
            }
        });

        return queue.map(a => a[0]);
  }
}

module.exports = {
  save,
  read,
  sortQueue
}