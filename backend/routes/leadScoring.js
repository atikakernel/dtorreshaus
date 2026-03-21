const express = require('express');
const router = express.Router();
const leadScoringService = require('../services/leadScoring.service');

// POST /api/lead-scoring
router.post('/', async (req, res) => {
  try {
    const { interactions } = req.body;
    
    if (!interactions || !Array.isArray(interactions)) {
      return res.status(400).json({ error: 'Se requiere un arreglo de interactions' });
    }

    const scoringResult = await leadScoringService.classifyUserInteractions(interactions);
    
    return res.json({
      success: true,
      scoring: scoringResult
    });
  } catch (error) {
    console.error('Error en ruta lead-scoring:', error);
    return res.status(500).json({ success: false, error: 'Error interno analizando interacciones' });
  }
});

module.exports = router;
