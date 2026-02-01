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
        // Filtrează doar elementele care nu sunt copii (nu au copii cu același text)
        $('div, span, p, li, dt, dd').each((i, elem) => {
            const $elem = $(elem);
            const text = $elem.text().trim();
            
            // Ignoră dacă elementul are copii cu același text (probabil container)
            const childrenText = $elem.children().map((i, child) => $(child).text().trim()).get().join(' ');
            if (text === childrenText) return;
            
            if (text.includes(':') && text.length > 5 && text.length < 300) {
                const parts = text.split(':');
                if (parts.length >= 2) {
                    const label = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();
                    
                    // Verifică că label-ul nu este prea lung și value-ul nu este gol
                    if (label && label.length < 50 && value && value.length > 0 && value.length < 250) {
                        const key = label.toLowerCase()
                            .replace(/[^\w\s]/g, '')
                            .replace(/\s+/g, '_')
                            .replace(/ă/g, 'a').replace(/â/g, 'a')
                            .replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't');
                        
                        if (key && key.length > 1 && key.length < 50 &&
                            !key.includes('cookie') && !key.includes('javascript') &&
                            !key.includes('twitter') && !key.includes('facebook') &&
                            !key.includes('google') && !key.includes('privacy') &&
                            !key.includes('terms') && !key.includes('policy') &&
                            !value.includes('function(') && !value.includes('javascript:') &&
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
            // Dar fii mai permisiv - acceptă mai multe date
            if (key && value && typeof value === 'string' && 
                value.length > 0 && value.length < 500 && 
                !value.includes('documentreadyfunction') &&
                !value.includes('twitter-circle') &&
                !value.includes('function(') &&
                !value.includes('javascript:') &&
                !value.includes('onclick') &&
                !value.includes('onerror') &&
                !value.includes('undefined') &&
                value.trim() !== '') {
                cleanData[key] = value.trim();
            }
        });
        
        // Formatează datele într-un format standard
        // Caută în mai multe variante de nume pentru fiecare câmp
        const formatted = {
            make: cleanData.make || cleanData.manufacturer || cleanData.brand || cleanData.marca || 
                  cleanData.maker || cleanData.producer || cleanData.company || null,
            model: cleanData.model || cleanData.modelul || cleanData.model_name || null,
            year: cleanData.year || cleanData.model_year || cleanData.anul || cleanData.an || 
                  cleanData.production_year || cleanData.manufacturing_year || null,
            engine: cleanData.engine || cleanData.engine_code || cleanData.motor || cleanData.motorul || 
                    cleanData.engine_type || cleanData.engine_displacement || null,
            transmission: cleanData.transmission || cleanData.transmisie || cleanData.transmission_type || 
                         cleanData.gearbox || null,
            body_type: cleanData.body_type || cleanData.body_style || cleanData.caroserie || 
                      cleanData.body || cleanData.vehicle_type || null,
            fuel_type: cleanData.fuel_type || cleanData.fuel || cleanData.combustibil || 
                      cleanData.fuel_system || null,
            doors: cleanData.doors || cleanData.usile || cleanData.number_of_doors || null,
            seats: cleanData.seats || cleanData.scaune || cleanData.number_of_seats || null,
            vin: vin.toUpperCase()
        };
        
        // Dacă nu găsim în câmpurile standard, caută în toate cheile
        if (!formatted.make) {
            const makeKeys = Object.keys(cleanData).filter(k => 
                k.includes('make') || k.includes('manufacturer') || k.includes('brand') || 
                k.includes('marca') || k.includes('producer')
            );
            if (makeKeys.length > 0) {
                formatted.make = cleanData[makeKeys[0]];
            }
        }
        
        if (!formatted.model) {
            const modelKeys = Object.keys(cleanData).filter(k => 
                k.includes('model') && !k.includes('year')
            );
            if (modelKeys.length > 0) {
                formatted.model = cleanData[modelKeys[0]];
            }
        }
        
        if (!formatted.year) {
            const yearKeys = Object.keys(cleanData).filter(k => 
                k.includes('year') || k.includes('an')
            );
            if (yearKeys.length > 0) {
                formatted.year = cleanData[yearKeys[0]];
            }
        }
        
        // Adaugă TOATE celelalte câmpuri curate (nu doar cele standard)
        // Acest lucru asigură că toate datele extrase sunt disponibile
        Object.keys(cleanData).forEach(key => {
            // Adaugă doar dacă nu este deja în formatted și nu este o cheie duplicată
            if (!formatted[key] && 
                key !== 'marca' && key !== 'modelul' && 
                key !== 'anul' && key !== 'an' && 
                key !== 'motor' && key !== 'motorul' &&
                key !== 'transmisie' && key !== 'caroserie' && 
                key !== 'combustibil' && key !== 'usile' && key !== 'scaune') {
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
        
        // Log detaliat pentru debugging
        console.log('Scraping result:', {
            totalExtracted: Object.keys(cleanData).length,
            validFields: validFields.length,
            hasVIN: !!formatted.vin,
            hasMake: !!formatted.make,
            hasModel: !!formatted.model,
            sampleKeys: Object.keys(cleanData).slice(0, 5),
            sampleData: Object.keys(cleanData).slice(0, 5).reduce((acc, key) => {
                acc[key] = cleanData[key];
                return acc;
            }, {})
        });
        
        // Dacă avem cel puțin VIN (care este mereu setat), considerăm succes
        // Returnează date chiar dacă sunt puține
        if (validFields.length >= 1 || Object.keys(cleanData).length > 0) {
            // Dacă nu avem make/model dar avem alte date, le returnăm
            if (!formatted.make && !formatted.model && Object.keys(cleanData).length > 0) {
                // Adaugă toate datele din cleanData direct în formatted
                Object.keys(cleanData).forEach(key => {
                    if (!formatted[key] && key !== 'vin') {
                        formatted[key] = cleanData[key];
                    }
                });
            }
            
            return {
                success: true,
                data: formatted,
                raw: cleanData
            };
        }
        
        // Dacă chiar nu avem nimic, returnează eroare cu detalii
        return { 
            success: false, 
            error: 'No valid data extracted from FreeVINDecoder',
            debug: {
                extractedKeys: Object.keys(cleanData).length,
                formattedKeys: Object.keys(formatted).length,
                htmlLength: response.data.length,
                hasTables: $('table').length > 0
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
