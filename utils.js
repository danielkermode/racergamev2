//generate a random upper case letter (used in client code and server code)
export function randLetter() {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return possible.charAt(Math.floor(Math.random() * possible.length));
}