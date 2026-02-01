require('dotenv').config();
const axios = require('axios');

const testVIN = 'W0LJC7E89GB611600';

const testSite = async (url, name) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing: ${name}`);
    console.log(`URL: ${url}`);
    console.log('='.repeat(60));
    
    try {
        const response = await axios.get(url, {
            params: { vin: testVIN },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml'
            },
            timeout: 15000
        });

        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        console.log(`Content Length: ${response.data.length} bytes`);
        
        // Caută indicii de date VIN în HTML
        const html = response.data;
        const vinMatches = html.match(new RegExp(testVIN, 'gi'));
        console.log(`VIN found in HTML: ${vinMatches ? vinMatches.length : 0} times`);
        
        // Caută JSON în HTML
        const jsonMatches = html.match(/\{[^{}]*"vin"[^{}]*\}/gi);
        if (jsonMatches) {
            console.log(`JSON found: ${jsonMatches.length} matches`);
            console.log('Sample JSON:', jsonMatches[0].substring(0, 200));
        }
        
        // Caută cuvinte cheie
        const keywords = ['make', 'model', 'year', 'manufacturer', 'engine'];
        keywords.forEach(keyword => {
            const matches = html.match(new RegExp(keyword, 'gi'));
            if (matches) {
                console.log(`${keyword}: found ${matches.length} times`);
            }
        });
        
        // Salvează primul fragment de HTML pentru analiză
        const sample = html.substring(0, 2000);
        console.log('\nFirst 2000 chars of HTML:');
        console.log(sample);
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
        }
    }
};

(async () => {
    await testSite('https://www.freevindecoder.eu/', 'freevindecoder.eu');
    await testSite('https://bimmer.work/', 'bimmer.work');
    await testSite('https://www.decodethevin.com/', 'decodethevin.com');
})();
