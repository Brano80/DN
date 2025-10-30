import http from 'http'; // Changed from require
import querystring from 'querystring'; // Changed from require

// --- CONFIGURATION ---
// 1. Get the LATEST transaction ID from your browser!
const transactionId = "txn_f45419fb-0bf0-4622-a18c-47c3c8629ab6"; // <--- REPLACE THIS

// 2. Define the wallet data as a JavaScript object
const walletData = {
  given_name: "Jan", // Using names without diacritics
  family_name: "Novacek"
};
// --- END CONFIGURATION ---


// Convert wallet data to a JSON string
const vpTokenString = JSON.stringify(walletData);

// Prepare the form data (URL-encoded)
const postData = querystring.stringify({
  state: transactionId,
  vp_token: vpTokenString
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/verify-callback',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log(`Sending POST to http://localhost:3000/api/v1/verify-callback`);
console.log(`Body: ${postData}\n`);

const req = http.request(options, (res) => {
  console.log(`StatusCode: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response Body:', data);
    try {
        // Try parsing response as JSON for better readability
        console.log('Parsed Response:', JSON.parse(data));
    } catch (e) {
        // Ignore if not JSON
    }
  });
});

req.on('error', (error) => {
  console.error('Error sending request:', error);
});

// Send the request body
req.write(postData);
req.end();