const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all modules with translations AND scenarios
router.get('/', async (req, res) => {
  try {
    // Get modules with translations
    const modulesResult = await pool.query(`
      SELECT 
        m.id, 
        m.icon,
        json_object_agg(mt.language_code, 
          json_build_object(
            'title', mt.title,
            'description', mt.description,
            'badge', mt.badge_name
          )
        ) as translations
      FROM modules m
      LEFT JOIN module_translations mt ON m.id = mt.module_id
      GROUP BY m.id, m.icon
    `);

    // Get all scenarios
    const scenariosResult = await pool.query(`
      SELECT 
        s.id,
        s.module_id,
        s.correct_answer as "correctAnswer"
      FROM scenarios s
      ORDER BY s.order_index
    `);

    // Get scenario translations
    const translationsResult = await pool.query(`
      SELECT 
        st.scenario_id,
        st.language_code,
        st.concept,
        st.explanation,
        st.story,
        st.feedback_correct as "feedbackCorrect",
        st.feedback_incorrect as "feedbackIncorrect"
      FROM scenario_translations st
    `);

    // Get options
    const optionsResult = await pool.query(`
      SELECT 
        scenario_id,
        option_id,
        language_code,
        option_text
      FROM scenario_options
      ORDER BY scenario_id, language_code, option_id
    `);

    // Build translations object for each scenario
    const scenarios = scenariosResult.rows.map(scenario => {
      const translations = {};
      
      // Group by language
      const scenarioTranslations = translationsResult.rows.filter(t => t.scenario_id === scenario.id);
      
      scenarioTranslations.forEach(trans => {
        const options = optionsResult.rows
          .filter(o => o.scenario_id === scenario.id && o.language_code === trans.language_code)
          .map(o => ({
            id: o.option_id,
            text: o.option_text
          }));

        translations[trans.language_code] = {
          concept: trans.concept,
          explanation: trans.explanation,
          story: trans.story,
          feedbackCorrect: trans.feedbackCorrect,
          feedbackIncorrect: trans.feedbackIncorrect,
          options: options
        };
      });

      return {
        id: scenario.id,
        moduleId: scenario.module_id,
        correctAnswer: scenario.correctAnswer,
        translations: translations
      };
    });

    // Attach scenario IDs to modules
    const modules = modulesResult.rows.map(module => ({
      ...module,
      scenarios: scenarios
        .filter(s => s.moduleId === module.id)
        .map(s => s.id)
    }));

    res.json({
      modules,
      scenarios
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST new module (keep existing code)
router.post('/', async (req, res) => {
  const { id, icon, translations } = req.body;
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    await client.query(
      'INSERT INTO modules (id, icon) VALUES ($1, $2)',
      [id, icon]
    );
    
    for (const [lang, data] of Object.entries(translations)) {
      await client.query(
        'INSERT INTO module_translations (module_id, language_code, title, description, badge_name) VALUES ($1, $2, $3, $4, $5)',
        [id, lang, data.title, data.description, data.badge]
      );
    }
    
    await client.query('COMMIT');
    res.json({ success: true, message: 'Module added successfully' });
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to add module' });
  } finally {
    client.release();
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM modules WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Module deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

module.exports = router;