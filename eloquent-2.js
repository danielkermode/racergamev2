//Looping a triangle
for(var i = 0; i < 8; i++) {
  console.log(Array(i+1).join('#'));
}

// FizzBuzz
for(var i = 1; i <= 100; i++) {
 if(i%3 == 0 && i%5 == 0) {
   console.log("FizzBuzz");
   //equivalent to else if
   continue;
 }
 if(i%3 == 0) {
   console.log("Fizz");
   continue;
 }
 if(i%5 == 0) {
   console.log("Buzz");
   continue;
 }
 console.log(i);
}