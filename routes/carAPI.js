const express = require('express');
const router = express.Router();
const carAPI = require('../services/carAPI');

/**
 * GET /api/makes
 * Obține lista de makes (mărci) de la CarAPI
 * Query parameters:
 *   - limit: Numărul de rezultate per pagină (opțional)
 *   - page: Numărul paginii (opțional)
 */
router.get('/makes', async (req, res) => {
    try {
        // Extrage parametrii din query string
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const page = req.query.page ? parseInt(req.query.page) : null;

        // Validare parametri
        if (limit !== null && (isNaN(limit) || limit < 1)) {
            return res.status(400).json({
                error: 'Parametrul "limit" trebuie să fie un număr pozitiv'
            });
        }

        if (page !== null && (isNaN(page) || page < 1)) {
            return res.status(400).json({
                error: 'Parametrul "page" trebuie să fie un număr pozitiv'
            });
        }

        const result = await carAPI.getMakes(limit, page);
        
        // Adaugă informație despre sursa API-ului folosit
        const response = {
            ...result.data,
            _meta: {
                source: result.source || 'primary',
                timestamp: new Date().toISOString()
            }
        };
        
        res.json(response);
    } catch (error) {
        console.error('Error in /api/makes:', error);
        
        const status = error.status || 500;
        const message = error.message || 'Eroare la obținerea makes de la CarAPI';
        
        res.status(status).json({
            error: message,
            details: error.data || null
        });
    }
});

module.exports = router;
