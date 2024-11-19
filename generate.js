import crypto from 'crypto';
 
// Generate a random, secure ACCES_TOKEN_SECRET
const secret = crypto.randomBytes(15).toString('hex');
console.log(secret); // Ini akan menghasilkan string acak yang panjang

// Generate a random, secure REFRESH_TOKEN_SECRET
const refreshTokenSecret = crypto.randomBytes(15).toString('hex');
console.log(refreshTokenSecret);  // Copy this and use it as your REFRESH_TOKEN_SECRET