require('dotenv').config();
const axios = require('axios');

const testVIN = 'W0LJC7E89GB611600';

// Testează diferite endpoint-uri posibile
const endpoints = [
    `https://www.freevindecoder.eu/api/decode?vin=${testVIN}`,
    `https://www.freevindecoder.eu/api/vin/${testVIN}`,
    `https://www.freevindecoder.eu/decode?vin=${testVIN}`,
    `https://www.freevindecoder.eu/decode/${testVIN}`,
    `https://api.freevindecoder.eu/decode?vin=${testVIN}`,
    `https://bimmer.work/api/decode?vin=${testVIN}`,
    `https://bimmer.work/decode?vin=${testVIN}`,
    `https://www.decodethevin.com/api/decode?vin=${testVIN}`,
];

const testEndpoint = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/html'
            },
            timeout: 10000,
            validateStatus: () => true // Acceptă toate status codes
        });
        
        if (response.status === 200) {
            console.log(`✅ ${url}`);
            console.log(`   Status: ${response.status}`);
            console.log(`   Content-Type: ${response.headers['content-type']}`);
            if (response.data && typeof response.data === 'object') {
                console.log(`   Data: ${JSON.stringify(response.data).substring(0, 200)}...`);
            } else {
                console.log(`   Data preview: ${String(response.data).substring(0, 200)}...`);
            }
            return true;
        } else {
            console.log(`❌ ${url} - Status: ${response.status}`);
        }
    } catch (error) {
        // Ignoră erorile
    }
    return false;
};

(async () => {
    console.log('Testing API endpoints...\n');
    for (const endpoint of endpoints) {
        await testEndpoint(endpoint);
    }
})();
