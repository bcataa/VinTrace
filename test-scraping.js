require('dotenv').config();
const scrapers = require('./services/scrapers');

const testVIN = 'W0LJC7E89GB611600';

const testScraping = async () => {
    console.log('Testing scraping for VIN:', testVIN);
    console.log('='.repeat(60));
    console.log('');

    // Test freevindecoder.eu
    console.log('1. Testing freevindecoder.eu...');
    try {
        const result1 = await scrapers.scrapeFreeVINDecoder(testVIN);
        console.log('Result:', JSON.stringify(result1, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('');

    // Test bimmer.work
    console.log('2. Testing bimmer.work...');
    try {
        const result2 = await scrapers.scrapeBimmerWork(testVIN);
        console.log('Result:', JSON.stringify(result2, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('');

    // Test decodethevin.com
    console.log('3. Testing decodethevin.com...');
    try {
        const result3 = await scrapers.scrapeDecodeTheVIN(testVIN);
        console.log('Result:', JSON.stringify(result3, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('');

    // Test mb.vin
    console.log('4. Testing mb.vin...');
    try {
        const result4 = await scrapers.scrapeMBVin(testVIN);
        console.log('Result:', JSON.stringify(result4, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
    console.log('');

    // Test teslaregister.org
    console.log('5. Testing teslaregister.org...');
    try {
        const result5 = await scrapers.scrapeTeslaRegister(testVIN);
        console.log('Result:', JSON.stringify(result5, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testScraping();
