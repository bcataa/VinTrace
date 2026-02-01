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
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.freevindecoder.eu/'
            }
        });
        
        const $ = cheerio.load(response.data);
        const data = {};
        
        // Metoda 1: Caută în tabele (cel mai comun format)
        $('table tr').each((i, elem) => {
            const cells = $(elem).find('td, th');
            if (cells.length >= 2) {
                const label = $(cells[0]).text().trim();
                const value = $(cells[1]).text().trim();
                if (label && value && value.length < 300 && !value.includes('function(')) {
                    const key = label.toLowerCase()
                        .replace(/[^\w\s]/g, '')
                        .replace(/\s+/g, '_')
                        .replace(/ă/g, 'a').replace(/â/g, 'a')
                        .replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't');
                    
                    if (key && key.length > 1 && key.length < 50 && 
                        !key.includes('cookie') && !key.includes('javascript') &&
                        !key.includes('twitter') && !key.includes('facebook') &&
                        (!data[key] || data[key] === '')) {
                        data[key] = value;
                    }
                }
            }
        });
        
        // Metoda 2: Caută în div-uri și span-uri cu pattern "Label: Value"
        $('div, span, p, li').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text.includes(':') && text.length < 200) {
                const parts = text.split(':');
                if (parts.length >= 2) {
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    if (label && value && value.length > 0 && value.length < 200) {
                        const key = label.toLowerCase()
                            .replace(/[^\w\s]/g, '')
                            .replace(/\s+/g, '_')
                            .replace(/ă/g, 'a').replace(/â/g, 'a')
                            .replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't');
                        
                        if (key && key.length > 1 && key.length < 50 &&
                            !key.includes('cookie') && !key.includes('javascript') &&
                            !key.includes('twitter') && !key.includes('facebook') &&
                            !key.includes('google') && !key.includes('privacy') &&
                            (!data[key] || data[key] === '')) {
                            data[key] = value;
                        }
                    }
                }
            }
        });
        
        // Metoda 3: Caută în elemente cu clase specifice
        $('[class*="vin"], [class*="data"], [class*="info"], [class*="detail"]').each((i, elem) => {
            const text = $(elem).text().trim();
            if (text.includes(':') && text.length < 200) {
                const parts = text.split(':');
                if (parts.length >= 2) {
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    if (label && value && value.length > 0) {
                        const key = label.toLowerCase()
                            .replace(/[^\w\s]/g, '')
                            .replace(/\s+/g, '_')
                            .replace(/ă/g, 'a').replace(/â/g, 'a')
                            .replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't');
                        
                        if (key && key.length > 1 && key.length < 50 &&
                            !data[key] || data[key] === '') {
                            data[key] = value;
                        }
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
        
        // Verifică dacă avem date valide (cel puțin 2 câmpuri populate, inclusiv VIN)
        const validFields = Object.keys(formatted).filter(k => 
            formatted[k] !== null && 
            formatted[k] !== '' && 
            formatted[k] !== undefined &&
            formatted[k] !== 'null' &&
            formatted[k] !== 'N/A' &&
            formatted[k] !== 'n/a'
        );
        
        // Log pentru debugging (doar în development)
        if (process.env.NODE_ENV !== 'production') {
            console.log('Extracted data:', {
                totalFields: Object.keys(cleanData).length,
                validFields: validFields.length,
                sample: Object.keys(cleanData).slice(0, 10)
            });
        }
        
        // Dacă avem cel puțin 2 câmpuri valide (inclusiv VIN), considerăm succes
        if (validFields.length >= 2) {
            return {
                success: true,
                data: formatted,
                raw: cleanData
            };
        }
        
        // Dacă nu avem date, returnează totuși ce am găsit (poate sunt date în raw)
        if (Object.keys(cleanData).length > 0) {
            return {
                success: true,
                data: formatted,
                raw: cleanData
            };
        }
        
        return { 
            success: false, 
            error: 'No valid data extracted from FreeVINDecoder',
            debug: {
                extractedKeys: Object.keys(cleanData).length,
                formattedKeys: Object.keys(formatted).length
            }
        };
    } catch (error) {
        console.error('FreeVINDecoder error:', error.message);
        console.error('Error details:', {
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url
        });
        return { 
            success: false, 
            error: error.message || 'Failed to fetch data from FreeVINDecoder',
            details: error.response?.status ? `HTTP ${error.response.status}` : 'Network error'
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
