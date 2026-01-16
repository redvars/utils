import * as bcrypt from "jsr:@std/crypto/bcrypt";

const password = "my_super_secret_password";

// 1. Hash the password
// The second argument is the 'cost' (default is 10).
// Higher = more secure but slower.
const hash = await bcrypt.hash(password);
console.log("Hashed Password:", hash);

// 2. Verify a password
const isMatch = await bcrypt.compare(password, hash);
const isWrong = await bcrypt.compare("wrong_password", hash);

console.log("Does it match?", isMatch); // true
console.log("Does the wrong one match?", isWrong); // false
