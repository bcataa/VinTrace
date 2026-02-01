const express = require('express');
const router = express.Router();
const vinService = require('../services/vinService');

// Lookup VIN
router.post('/lookup', async (req, res) => {
    try {
        const { vin } = req.body;
        
        // Validare minimă - doar lungime (NU mai verificăm validitatea caracterelor)
        // Verificăm ORICE VIN pentru a vedea ce date găsește
        if (!vin || vin.length !== 17) {
            return res.status(400).json({ 
                error: 'VIN trebuie să aibă exact 17 caractere.' 
            });
        }

        const result = await vinService.lookupVIN(vin, req.ip);
        res.json(result);
    } catch (error) {
        console.error('Error in VIN lookup:', error);
        res.status(500).json({ 
            error: 'Eroare la căutarea VIN-ului',
            details: error.message 
        });
    }
});

// Get lookup history
router.get('/history', async (req, res) => {
    try {
        const history = await vinService.getLookupHistory();
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ error: 'Eroare la obținerea istoricului' });
    }
});

// Get cached VIN data
router.get('/:vin', async (req, res) => {
    try {
        const { vin } = req.params;
        const data = await vinService.getCachedVIN(vin);
        
        if (!data) {
            return res.status(404).json({ error: 'VIN nu a fost găsit în baza de date' });
        }
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching VIN:', error);
        res.status(500).json({ error: 'Eroare la obținerea datelor' });
    }
});

module.exports = router;
