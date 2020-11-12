// Lookup e-mail in users object and return user ID
function getUserByEmail(email, database) {
  for (const user of Object.keys(database)) {
    if (database[user].email === email) {
      return user;
    }
  }
  return undefined;
}

module.exports = { getUserByEmail };