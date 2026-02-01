const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'vin_database.db');

let db = null;

const init = () => {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
            createTables().then(resolve).catch(reject);
        });
    });
};

const createTables = () => {
    return new Promise((resolve, reject) => {
        // Creăm tabelele mai întâi
        const tableQueries = [
            `CREATE TABLE IF NOT EXISTS vin_lookups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vin TEXT UNIQUE NOT NULL,
                make TEXT,
                model TEXT,
                year INTEGER,
                engine TEXT,
                transmission TEXT,
                color TEXT,
                mileage TEXT,
                accident_history TEXT,
                owner_count INTEGER,
                registration_date TEXT,
                last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
                raw_data TEXT
            )`,
            `CREATE TABLE IF NOT EXISTS lookup_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                vin TEXT NOT NULL,
                lookup_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                ip_address TEXT,
                success BOOLEAN
            )`
        ];

        // Creăm index-urile după ce tabelele sunt create
        const indexQueries = [
            `CREATE INDEX IF NOT EXISTS idx_vin ON vin_lookups(vin)`,
            `CREATE INDEX IF NOT EXISTS idx_lookup_date ON lookup_history(lookup_date)`
        ];

        let completed = 0;
        const totalQueries = tableQueries.length + indexQueries.length;

        // Creăm mai întâi tabelele
        tableQueries.forEach((query, index) => {
            db.run(query, (err) => {
                if (err) {
                    console.error(`Error creating table ${index}:`, err);
                    reject(err);
                    return;
                }
                completed++;
                // După ce toate tabelele sunt create, creăm index-urile
                if (completed === tableQueries.length) {
                    indexQueries.forEach((indexQuery, idx) => {
                        db.run(indexQuery, (err) => {
                            if (err) {
                                console.error(`Error creating index ${idx}:`, err);
                                reject(err);
                                return;
                            }
                            completed++;
                            if (completed === totalQueries) {
                                resolve();
                            }
                        });
                    });
                }
            });
        });
    });
};

const getConnection = () => {
    if (!db) {
        throw new Error('Database not initialized');
    }
    return db;
};

const close = () => {
    return new Promise((resolve, reject) => {
        if (db) {
            db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Database connection closed');
                    resolve();
                }
            });
        } else {
            resolve();
        }
    });
};

module.exports = {
    init,
    getConnection,
    close
};
