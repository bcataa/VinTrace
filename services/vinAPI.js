const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape de la FreeVINDecoder.eu
 * Singura sursă de date pentru VIN decoding
 */
const scrapeFreeVINDecoder = async (vin) => {
    try {
        const url = `https://www.freevindecoder.eu/?vin=${vin}`;
        const response = await axios.get(url, {
            timeout: 20000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
            }
        });
        
        const $ = cheerio.load(response.data);
        const data = {};
        
        // Extrage datele din pagină - caută în tabele și elemente cu date VIN
        $('table tr, .vin-data, [class*="vin"], [class*="data"], div, span, p').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text.includes(':')) {
                const [label, ...valueParts] = text.split(':');
                const value = valueParts.join(':').trim();
                if (label && value && value.length < 200) {
                    const key = label.toLowerCase()
                        .replace(/[^\w\s]/g, '')
                        .replace(/\s+/g, '_')
                        .replace(/ă/g, 'a').replace(/â/g, 'a')
                        .replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't');
                    
                    // Ignoră câmpurile invalide sau duplicate
                    if (key && key.length > 2 && key.length < 50 && 
                        !key.startsWith('_') && 
                        !key.includes('cookie') &&
                        !key.includes('javascript') &&
                        !key.includes('function') &&
                        !key.includes('twitter') &&
                        !key.includes('facebook') &&
                        !key.includes('google') &&
                        (!data[key] || data[key] === '')) {
                        data[key] = value;
                    }
                }
            }
        });
        
        // Filtrează câmpurile care conțin cod JavaScript sau sunt invalide
        const cleanData = {};
        Object.keys(data).forEach(key => {
            const value = data[key];
            // Ignoră câmpurile care conțin cod JavaScript sau sunt prea lungi
            if (key && value && typeof value === 'string' && 
                value.length < 500 && 
                !value.includes('documentreadyfunction') &&
                !value.includes('twitter-circle') &&
                !value.includes('function(') &&
                !value.includes('javascript:') &&
                !value.includes('onclick') &&
                !value.includes('onerror')) {
                cleanData[key] = value;
            }
        });
        
        // Formatează datele într-un format standard
        const formatted = {
            make: cleanData.make || cleanData.manufacturer || cleanData.brand || cleanData.marca || null,
            model: cleanData.model || cleanData.modelul || null,
            year: cleanData.year || cleanData.model_year || cleanData.anul || cleanData.an || null,
            engine: cleanData.engine || cleanData.engine_code || cleanData.motor || cleanData.motorul || null,
            transmission: cleanData.transmission || cleanData.transmisie || null,
            body_type: cleanData.body_type || cleanData.body_style || cleanData.caroserie || null,
            fuel_type: cleanData.fuel_type || cleanData.fuel || cleanData.combustibil || null,
            doors: cleanData.doors || cleanData.usile || null,
            seats: cleanData.seats || cleanData.scaune || null,
            vin: vin.toUpperCase()
        };
        
        // Adaugă toate celelalte câmpuri curate
        Object.keys(cleanData).forEach(key => {
            if (!formatted[key] && 
                key !== 'make' && key !== 'model' && key !== 'year' && 
                key !== 'engine' && key !== 'transmission' && key !== 'body_type' && 
                key !== 'fuel_type' && key !== 'doors' && key !== 'seats' &&
                key !== 'vin' && key !== 'marca' && key !== 'modelul' && 
                key !== 'anul' && key !== 'an' && key !== 'motor' && key !== 'motorul' &&
                key !== 'transmisie' && key !== 'caroserie' && key !== 'combustibil' &&
                key !== 'usile' && key !== 'scaune') {
                formatted[key] = cleanData[key];
            }
        });
        
        // Verifică dacă avem date valide (cel puțin 3 câmpuri populate)
        const validFields = Object.keys(formatted).filter(k => 
            formatted[k] !== null && 
            formatted[k] !== '' && 
            formatted[k] !== undefined
        );
        
        if (validFields.length > 3) {
            return {
                success: true,
                data: formatted,
                raw: cleanData
            };
        }
        
        return { 
            success: false, 
            error: 'No valid data extracted from FreeVINDecoder' 
        };
    } catch (error) {
        console.error('FreeVINDecoder error:', error.message);
        return { 
            success: false, 
            error: error.message || 'Failed to fetch data from FreeVINDecoder' 
        };
    }
};

/**
 * Funcția principală care obține datele VIN
 * Folosește doar FreeVINDecoder.eu
 */
const fetchVINData = async (vin) => {
    try {
        const result = await scrapeFreeVINDecoder(vin);
        
        const sources = [{
            source: 'freevindecoder',
            success: result.success || false,
            data: result.data || null,
            raw: result.raw || null,
            error: result.error || null
        }];
        
        // Returnează rezultatele
        return {
            success: result.success || false,
            data: result.data || {},
            sources: sources,
            error: result.success ? null : (result.error || 'Nu s-au putut obține date de la FreeVINDecoder')
        };
    } catch (error) {
        console.error('Error in fetchVINData:', error.message);
        return {
            success: false,
            data: {},
            sources: [{
                source: 'freevindecoder',
                success: false,
                error: error.message || 'Unknown error'
            }],
            error: error.message || 'Eroare la obținerea datelor VIN'
        };
    }
};

module.exports = {
    fetchVINData,
    scrapeFreeVINDecoder
};
