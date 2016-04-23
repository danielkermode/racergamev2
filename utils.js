//generate a random upper case letter (used in client code and server code)
function randLetter() {
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return possible.charAt(Math.floor(Math.random() * possible.length));
}
exports.randLetter = randLetter;