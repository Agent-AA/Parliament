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

module.exports = {
  save,
  read
}