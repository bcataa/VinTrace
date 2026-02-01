require('dotenv').config();
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const testVIN = 'W0LJC7E89GB611600';

const testFreeVINDecoder = async () => {
    console.log('Testing freevindecoder.eu in detail...\n');
    
    try {
        const response = await axios.get('https://www.freevindecoder.eu/', {
            params: { vin: testVIN },
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml'
            },
            timeout: 15000
        });

        const $ = cheerio.load(response.data);
        
        // Salvează HTML-ul pentru analiză
        fs.writeFileSync('freevindecoder-html.html', response.data);
        console.log('HTML saved to freevindecoder-html.html');
        
        // Caută toate elementele care conțin VIN-ul
        const vinElements = [];
        $('*').each((i, elem) => {
            const text = $(elem).text();
            if (text.includes(testVIN)) {
                vinElements.push({
                    tag: elem.name,
                    class: $(elem).attr('class'),
                    id: $(elem).attr('id'),
                    text: text.substring(0, 200)
                });
            }
        });
        
        console.log(`\nFound ${vinElements.length} elements containing VIN:`);
        vinElements.slice(0, 10).forEach((el, i) => {
            console.log(`${i + 1}. <${el.tag}> class="${el.class}" id="${el.id}"`);
            console.log(`   Text: ${el.text.substring(0, 100)}...`);
        });
        
        // Caută tabele sau liste cu date
        console.log('\n\nLooking for tables and data structures:');
        $('table, .table, [class*="result"], [class*="data"], [class*="info"]').each((i, elem) => {
            const text = $(elem).text();
            if (text.length > 50 && text.length < 500) {
                console.log(`\nElement ${i + 1}:`);
                console.log(`Class: ${$(elem).attr('class')}`);
                console.log(`Text preview: ${text.substring(0, 150)}...`);
            }
        });
        
        // Caută script tags cu date JSON
        console.log('\n\nLooking for JSON data in scripts:');
        $('script').each((i, elem) => {
            const content = $(elem).html();
            if (content && (content.includes('make') || content.includes('model') || content.includes(testVIN))) {
                console.log(`\nScript ${i + 1}:`);
                console.log(content.substring(0, 500));
            }
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testFreeVINDecoder();
