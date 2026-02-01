const db = require('../database/db');
const vinAPI = require('./vinAPI');

const getCachedVIN = (vin) => {
    return new Promise((resolve, reject) => {
        const connection = db.getConnection();
        connection.get(
            'SELECT * FROM vin_lookups WHERE vin = ?',
            [vin.toUpperCase()],
            (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            }
        );
    });
};

const saveVINData = (vin, data) => {
    return new Promise((resolve, reject) => {
        const connection = db.getConnection();
        const {
            make,
            model,
            year,
            engine,
            transmission,
            color,
            mileage,
            accident_history,
            owner_count,
            registration_date,
            raw_data
        } = data;

        connection.run(
            `INSERT OR REPLACE INTO vin_lookups 
            (vin, make, model, year, engine, transmission, color, mileage, 
             accident_history, owner_count, registration_date, raw_data, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                vin.toUpperCase(),
                make,
                model,
                year,
                engine,
                transmission,
                color,
                mileage,
                accident_history,
                owner_count,
                registration_date,
                JSON.stringify(raw_data)
            ],
            function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            }
        );
    });
};

const logLookup = (vin, ip, success) => {
    return new Promise((resolve, reject) => {
        const connection = db.getConnection();
        connection.run(
            'INSERT INTO lookup_history (vin, ip_address, success) VALUES (?, ?, ?)',
            [vin.toUpperCase(), ip, success ? 1 : 0],
            (err) => {
                if (err) {
                    console.error('Error logging lookup:', err);
                    // Don't reject, just log the error
                }
                resolve();
            }
        );
    });
};

const lookupVIN = async (vin, ip) => {
    const normalizedVIN = vin.toUpperCase();
    
    // NU mai verificăm cache - verificăm mereu de pe site-uri
    // Fetch from API și scraping - MEREU
    try {
        const apiData = await vinAPI.fetchVINData(normalizedVIN);
        
        // Returnează rezultatele CHIAR DACĂ nu sunt complete
        // NU MAI SALVĂM ÎN BAZA DE DATE
        if (apiData && apiData.sources && apiData.sources.length > 0) {
            // NU mai salvăm în database
            // await saveVINData(normalizedVIN, { ...apiData.data, raw_data: apiData.sources || apiData.data?.raw_data });
            // await logLookup(normalizedVIN, ip, apiData.success);
            
            // Returnează rezultatele cu toate datele de la sursele cu succes
            return {
                success: apiData.success || false,
                cached: false,
                data: apiData.data || {},
                sources: apiData.sources || [],
                successfulSources: apiData.sources.filter(s => s.success) || [] // Doar sursele cu succes
            };
        } else {
            // await logLookup(normalizedVIN, ip, false);
            return {
                success: false,
                cached: false,
                error: apiData?.error || 'Nu s-au putut obține date pentru acest VIN',
                sources: apiData?.sources || [],
                successfulSources: [],
                data: {} // Returnează obiect gol pentru a afișa sursele
            };
        }
    } catch (error) {
        // await logLookup(normalizedVIN, ip, false);
        // Chiar dacă există eroare, returnează ce am găsit
        return {
            success: false,
            cached: false,
            error: error.message,
            sources: [],
            successfulSources: [],
            data: {}
        };
    }
};

const getLookupHistory = () => {
    return new Promise((resolve, reject) => {
        const connection = db.getConnection();
        connection.all(
            'SELECT * FROM lookup_history ORDER BY lookup_date DESC LIMIT 100',
            [],
            (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        );
    });
};

module.exports = {
    lookupVIN,
    getCachedVIN,
    getLookupHistory
};
