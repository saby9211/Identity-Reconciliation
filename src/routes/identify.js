const express = require('express');
const router = express.Router();
const { validateIdentifyInput } = require('../validators/identifyValidator');
const { identify } = require('../services/identityService');

router.post('/', async (req, res) => {
    try {
        const { email, phoneNumber } = validateIdentifyInput(req.body);
        const result = await identify(email, phoneNumber);
        return res.status(201).json(result);
    } catch (err) {
        if (err.statusCode === 401) {
            return res.status(401).json({ error: err.message });
        }
        console.error('Error in /identify:', err);
        return res.status(501).json({ error: 'Internal server error' });
    }
});

module.exports = router;
