const axios = require('axios');

const CAR_API_BASE_URL = 'https://carapi.app/api';

// Cache pentru JWT token
let jwtToken = null;
let tokenExpiry = null;

/**
 * Configurare API-uri
 */
const API_CONFIG = {
    primary: {
        baseUrl: CAR_API_BASE_URL,
        apiKey: process.env.CAR_API_KEY,
        apiSecret: process.env.CAR_API_SECRET,
        getAuthHeader: (key, secret) => ({
            'X-API-Key': key,
            'X-API-Secret': secret
        })
    },
    secondary1: {
        baseUrl: process.env.CAR_API_URL_2 || '',
        apiKey: process.env.CAR_API_KEY_2 || '',
        apiSecret: process.env.CAR_API_SECRET_2 || '',
        getAuthHeader: (key, secret) => {
            // Adaptați în funcție de formatul cerut de API-ul secundar 1
            if (secret) {
                return { 'X-API-Key': key, 'X-API-Secret': secret };
            }
            return { 'Authorization': `Bearer ${key}` };
        }
    },
    secondary2: {
        baseUrl: process.env.CAR_API_URL_3 || '',
        apiKey: process.env.CAR_API_KEY_3 || '',
        apiSecret: process.env.CAR_API_SECRET_3 || '',
        getAuthHeader: (key, secret) => {
            // Adaptați în funcție de formatul cerut de API-ul secundar 2
            if (secret) {
                return { 'X-API-Key': key, 'X-API-Secret': secret };
            }
            return { 'Authorization': `Bearer ${key}` };
        }
    }
};

/**
 * Apelează un API specific pentru makes
 */
const fetchMakesFromAPI = async (apiConfig, limit, page, apiName) => {
    if (!apiConfig.baseUrl || !apiConfig.apiKey) {
        return null;
    }

    try {
        const params = {};
        if (limit !== null && limit !== undefined) {
            params.limit = limit;
        }
        if (page !== null && page !== undefined) {
            params.page = page;
        }

        const response = await axios.get(`${apiConfig.baseUrl}/makes`, {
            params: params,
            headers: {
                ...apiConfig.getAuthHeader(apiConfig.apiKey, apiConfig.apiSecret),
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        return {
            success: true,
            data: response.data,
            source: apiName
        };
    } catch (error) {
        console.error(`Error fetching makes from ${apiName}:`, error.message);
        return null;
    }
};

/**
 * Obține lista de makes (mărci) de la CarAPI cu fallback la API-uri secundare
 * @param {number} limit - Numărul de rezultate per pagină
 * @param {number} page - Numărul paginii
 * @returns {Promise<Object>} Răspunsul de la API
 */
const getMakes = async (limit = null, page = null) => {
    // Verifică dacă există cel puțin un API configurat
    if ((!API_CONFIG.primary.apiKey && !API_CONFIG.primary.apiSecret) && 
        (!API_CONFIG.secondary1.apiKey) && 
        (!API_CONFIG.secondary2.apiKey)) {
        throw {
            status: 500,
            message: 'Niciun API nu este configurat. Verificați .env'
        };
    }

    // Încearcă API-ul principal
    if (API_CONFIG.primary.apiKey) {
        const result = await fetchMakesFromAPI(API_CONFIG.primary, limit, page, 'primary');
        if (result && result.success) {
            return result;
        }
        console.log('Primary API failed, trying secondary APIs...');
    }

    // Încearcă API-ul secundar 1
    if (API_CONFIG.secondary1.apiKey) {
        const result = await fetchMakesFromAPI(API_CONFIG.secondary1, limit, page, 'secondary1');
        if (result && result.success) {
            return result;
        }
        console.log('Secondary API 1 failed, trying secondary API 2...');
    }

    // Încearcă API-ul secundar 2
    if (API_CONFIG.secondary2.apiKey) {
        const result = await fetchMakesFromAPI(API_CONFIG.secondary2, limit, page, 'secondary2');
        if (result && result.success) {
            return result;
        }
    }

    // Toate API-urile au eșuat
    throw {
        status: 503,
        message: 'Toate API-urile sunt indisponibile momentan'
    };
};

/**
 * Obține JWT token de la CarAPI folosind api_token și api_secret
 */
const getJWTToken = async () => {
    // Verifică dacă token-ul există și nu a expirat
    if (jwtToken && tokenExpiry && new Date() < tokenExpiry) {
        return jwtToken;
    }

    const apiToken = process.env.CAR_API_KEY;
    const apiSecret = process.env.CAR_API_SECRET;

    if (!apiToken || !apiSecret) {
        throw new Error('CAR_API_KEY și CAR_API_SECRET trebuie să fie configurate în .env');
    }

    try {
        const response = await axios.post(`${CAR_API_BASE_URL}/auth/login`, {
            api_token: apiToken,
            api_secret: apiSecret
        }, {
            headers: {
                'Accept': 'text/plain',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        // JWT token este returnat ca text plain
        jwtToken = response.data;
        
        // Setează expirarea la 23 de ore (token-urile JWT de obicei expiră după 24h)
        tokenExpiry = new Date(Date.now() + 23 * 60 * 60 * 1000);

        return jwtToken;
    } catch (error) {
        console.error('Error getting JWT token:', error.message);
        if (error.response) {
            throw new Error(`Autentificare eșuată: ${error.response.data || error.message}`);
        }
        throw error;
    }
};

/**
 * Obține datele VIN de la CarAPI
 */
const getVINData = async (vin) => {
    try {
        // Obține JWT token
        const token = await getJWTToken();

        const response = await axios.get(`${CAR_API_BASE_URL}/vin/${vin}`, {
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            timeout: 15000
        });

        return {
            success: true,
            data: response.data,
            source: 'carapi'
        };
    } catch (error) {
        console.error('Error fetching VIN data from CarAPI:', error.message);
        
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 401) {
                // Token expirat, încearcă să obțină unul nou
                jwtToken = null;
                tokenExpiry = null;
                return await getVINData(vin); // Retry once
            }
            
            if (status === 404) {
                return {
                    success: false,
                    error: 'VIN-ul nu a fost găsit în baza de date CarAPI',
                    status: status
                };
            }
            
            return {
                success: false,
                error: data?.message || data?.error || `Eroare ${status} de la CarAPI`,
                status: status
            };
        }
        
        return {
            success: false,
            error: error.message || 'Eroare la conectarea la CarAPI'
        };
    }
};

module.exports = {
    getMakes,
    getVINData,
    getJWTToken
};
