// seed.js — Part III only (Articles 12–35)
// Compatible with existing routes/schema (modules, module_translations, scenarios, scenario_translations, scenario_options)
const pool = require('./db');

const PART_III_MODULES = [
  { id: 'general-definition', icon: '📘',
    translations: {
      en: { title: 'Definitions & Law (Art. 12–13)', description: 'Who is the “State”; laws inconsistent with Part III', badge: 'Constitution Reader' },
      hi: { title: 'परिभाषाएँ और विधि (अनु. 12–13)', description: '“राज्य” कौन; भाग III के विरुद्ध कानून', badge: 'Constitution Reader' }
    }
  },
  { id: 'equality', icon: '⚖️',
    translations: {
      en: { title: 'Right to Equality (Art. 14–18)', description: 'Equality before law; no discrimination; abolition of untouchability & titles', badge: 'Equality Advocate' },
      hi: { title: 'समानता का अधिकार (अनु. 14–18)', description: 'कानून के समक्ष समानता; भेदभाव निषेध; अस्पृश्यता व उपाधियाँ समाप्त', badge: 'Equality Advocate' }
    }
  },
  { id: 'freedom', icon: '🕊️',
    translations: {
      en: { title: 'Right to Freedom (Art. 19–22)', description: 'Freedoms of Art.19; protection in criminal cases; life & personal liberty; safeguards on arrest', badge: 'Freedom Defender' },
      hi: { title: 'स्वतंत्रता का अधिकार (अनु. 19–22)', description: 'अनु.19 की स्वतंत्रताएँ; आपराधिक संरक्षण; जीवन/स्वतंत्रता; गिरफ्तारी पर सुरक्षा', badge: 'Freedom Defender' }
    }
  },
  { id: 'exploitation', icon: '🛡️',
    translations: {
      en: { title: 'Right Against Exploitation (Art. 23–24)', description: 'Prohibition of trafficking, forced labour, hazardous child labour', badge: 'Protector' },
      hi: { title: 'शोषण के विरुद्ध अधिकार (अनु. 23–24)', description: 'मानव तस्करी, जबरन श्रम, खतरनाक बाल श्रम निषेध', badge: 'Protector' }
    }
  },
  { id: 'religion', icon: '🕉️',
    translations: {
      en: { title: 'Freedom of Religion (Art. 25–28)', description: 'Freedom of conscience & religion; manage religious affairs; no compulsory instruction in certain institutions', badge: 'Religious Rights Ally' },
      hi: { title: 'धार्मिक स्वतंत्रता (अनु. 25–28)', description: 'अंतरात्मा व धर्म की स्वतंत्रता; धार्मिक प्रबंधन; कुछ संस्थानों में अनिवार्य धार्मिक शिक्षा नहीं', badge: 'Religious Rights Ally' }
    }
  },
  { id: 'cultural-educational', icon: '🎨',
    translations: {
      en: { title: 'Cultural & Educational Rights (Art. 29–30)', description: 'Conserve language/script/culture; minorities’ institutions', badge: 'Culture Keeper' },
      hi: { title: 'सांस्कृतिक व शैक्षिक अधिकार (अनु. 29–30)', description: 'भाषा/लिपि/संस्कृति का संरक्षण; अल्पसंख्यक संस्थान', badge: 'Culture Keeper' }
    }
  },
  { id: 'constitutional-remedies', icon: '📜',
    translations: {
      en: { title: 'Constitutional Remedies & Limits (Art. 32, 33–35)', description: 'Move Supreme Court for FR enforcement; special limits/powers', badge: 'Writ Champion' },
      hi: { title: 'संवैधानिक उपचार व सीमाएँ (अनु. 32, 33–35)', description: 'मौलिक अधिकार प्रवर्तन हेतु सर्वोच्च न्यायालय; विशेष सीमाएँ/शक्तियाँ', badge: 'Writ Champion' }
    }
  }
];

// Minimal, clean scenarios for each learning area (id, correct_answer in {a,b,c}, options per language)
const SCENARIOS = [
  // === GENERAL-DEFINITION (Art. 12–13)
  {
    id: 'general_state_1', module_id: 'general-definition', correct_answer: 'b', order_index: 1,
    translations: {
      en: {
        concept: 'Who is “the State”? (Art. 12)',
        explanation: 'Article 12 defines “the State” to include Government, Parliament/Legislature, and authorities under the control of Government.',
        story: 'A student alleges her Fundamental Right is violated by a government department. Does Part III apply?',
        options: [
          { id: 'a', text: 'No, Part III applies only to private bodies' },
          { id: 'b', text: 'Yes, Government departments are “State” under Article 12' },
          { id: 'c', text: 'Only if the President approves' }
        ],
        feedbackCorrect: 'Correct — Government departments are “State” (Art. 12).',
        feedbackIncorrect: 'Not quite — check Article 12’s definition of “State”.'
      },
      hi: {
        concept: '“राज्य” कौन है? (अनु. 12)',
        explanation: 'अनु.12 में “राज्य” में सरकार, संसद/विधानमंडल व सरकारी नियंत्रणाधीन प्राधिकरण शामिल हैं।',
        story: 'एक छात्रा कहती है कि उसका मौलिक अधिकार एक सरकारी विभाग ने तोड़ा। क्या भाग III लागू होगा?',
        options: [
          { id: 'a', text: 'नहीं, भाग III केवल निजी संस्थाओं पर लागू है' },
          { id: 'b', text: 'हाँ, सरकारी विभाग अनु.12 के तहत “राज्य” हैं' },
          { id: 'c', text: 'केवल राष्ट्रपति की स्वीकृति हो तो' }
        ],
        feedbackCorrect: 'सही — सरकारी विभाग “राज्य” हैं (अनु.12)।',
        feedbackIncorrect: 'पूरा सही नहीं — अनु.12 की परिभाषा देखें।'
      }
    }
  },

  // === EQUALITY (Art. 14–18)
  {
    id: 'equality_discrimination_1', module_id: 'equality', correct_answer: 'b', order_index: 1,
    translations: {
      en: {
        concept: 'Prohibition of discrimination (Art. 15)',
        explanation: 'State cannot discriminate on religion, race, caste, sex, place of birth.',
        story: 'A public college denies admission solely due to caste.',
        options: [
          { id: 'a', text: 'Article 21 (life & liberty)' },
          { id: 'b', text: 'Article 15 (prohibition of discrimination)' },
          { id: 'c', text: 'Article 27 (religious taxes)' }
        ],
        feedbackCorrect: 'Correct — Art. 15 forbids such discrimination.',
        feedbackIncorrect: 'Review Art. 15: specified grounds are prohibited.'
      },
      hi: {
        concept: 'भेदभाव का निषेध (अनु. 15)',
        explanation: 'राज्य धर्म, जाति, लिंग, जन्मस्थान आदि के आधार पर भेदभाव नहीं कर सकता।',
        story: 'एक सार्वजनिक कॉलेज जाति के आधार पर प्रवेश से इन्कार करता है।',
        options: [
          { id: 'a', text: 'अनु.21 (जीवन व स्वतंत्रता)' },
          { id: 'b', text: 'अनु.15 (भेदभाव निषेध)' },
          { id: 'c', text: 'अनु.27 (धार्मिक कर)' }
        ],
        feedbackCorrect: 'सही — अनु.15 ऐसा भेदभाव निषिद्ध करता है।',
        feedbackIncorrect: 'अनु.15 देखें — निर्दिष्ट आधार निषिद्ध हैं।'
      }
    }
  },
  {
    id: 'equality_untouchability_1', module_id: 'equality', correct_answer: 'c', order_index: 2,
    translations: {
      en: {
        concept: 'Abolition of untouchability (Art. 17)',
        explanation: 'Untouchability is abolished and its practice is an offence.',
        story: 'A shop refuses entry citing “traditional practice” against a community.',
        options: [
          { id: 'a', text: 'Article 16 (public employment)' },
          { id: 'b', text: 'Article 18 (titles)' },
          { id: 'c', text: 'Article 17 (abolition of untouchability)' }
        ],
        feedbackCorrect: 'Correct — Art. 17 abolishes untouchability.',
        feedbackIncorrect: 'Look at Art. 17 for this protection.'
      },
      hi: {
        concept: 'अस्पृश्यता का उन्मूलन (अनु. 17)',
        explanation: 'अस्पृश्यता समाप्त है और उसका अभ्यास अपराध है।',
        story: 'एक दुकान “परंपरा” के नाम पर एक समुदाय के लोगों को प्रवेश नहीं देती।',
        options: [
          { id: 'a', text: 'अनु.16 (सार्वजनिक रोजगार)' },
          { id: 'b', text: 'अनु.18 (उपाधियाँ)' },
          { id: 'c', text: 'अनु.17 (अस्पृश्यता उन्मूलन)' }
        ],
        feedbackCorrect: 'सही — अनु.17 अस्पृश्यता को समाप्त करता है।',
        feedbackIncorrect: 'इस सुरक्षा के लिए अनु.17 देखें।'
      }
    }
  },

  // === FREEDOM (Art. 19–22)
  {
    id: 'freedom_assembly_1', module_id: 'freedom', correct_answer: 'b', order_index: 1,
    translations: {
      en: {
        concept: 'Freedom of assembly (Art. 19(1)(b))',
        explanation: 'Peaceful assembly is protected; restrictions must be reasonable and lawful.',
        story: 'A peaceful rally is blanket-banned without reason.',
        options: [
          { id: 'a', text: 'No Fundamental Right involved' },
          { id: 'b', text: 'Article 19(1)(b)' },
          { id: 'c', text: 'Article 24' }
        ],
        feedbackCorrect: 'Correct — Art. 19(1)(b) protects peaceful assembly.',
        feedbackIncorrect: 'Think Art. 19 freedoms and reasonable restrictions.'
      },
      hi: {
        concept: 'सभा की स्वतंत्रता (अनु. 19(1)(b))',
        explanation: 'शांतिपूर्ण सभा संरक्षित है; प्रतिबंध विवेकपूर्ण व वैध होने चाहिए।',
        story: 'एक शांतिपूर्ण रैली पर बिना कारण समग्र प्रतिबंध लग गया।',
        options: [
          { id: 'a', text: 'कोई मौलिक अधिकार नहीं' },
          { id: 'b', text: 'अनु.19(1)(b)' },
          { id: 'c', text: 'अनु.24' }
        ],
        feedbackCorrect: 'सही — अनु.19(1)(b) शांतिपूर्ण सभा की रक्षा करता है।',
        feedbackIncorrect: 'अनु.19 की स्वतंत्रताओं पर विचार करें।'
      }
    }
  },
  {
    id: 'freedom_arrest_1', module_id: 'freedom', correct_answer: 'a', order_index: 2,
    translations: {
      en: {
        concept: 'Safeguards on arrest (Art. 22)',
        explanation: 'Prompt production before magistrate and right to know grounds of arrest.',
        story: 'A person is detained overnight without being told why or produced before a magistrate.',
        options: [
          { id: 'a', text: 'Article 22 safeguards' },
          { id: 'b', text: 'Article 14 equality' },
          { id: 'c', text: 'Article 25 religion' }
        ],
        feedbackCorrect: 'Correct — Art. 22 requires prompt production and grounds of arrest.',
        feedbackIncorrect: 'Check Art. 22 — arrest safeguards.'
      },
      hi: {
        concept: 'गिरफ्तारी पर सुरक्षा (अनु. 22)',
        explanation: 'शीघ्र मजिस्ट्रेट के सामने पेशी और कारण बताने का अधिकार।',
        story: 'बिना कारण बताए रात भर हिरासत, मजिस्ट्रेट के सामने पेश नहीं किया गया।',
        options: [
          { id: 'a', text: 'अनु.22 की सुरक्षा' },
          { id: 'b', text: 'अनु.14 समानता' },
          { id: 'c', text: 'अनु.25 धर्म' }
        ],
        feedbackCorrect: 'सही — अनु.22 शीघ्र पेशी व कारण बताने की मांग करता है।',
        feedbackIncorrect: 'अनु.22 देखें — गिरफ्तारी सुरक्षा।'
      }
    }
  },

  // === EXPLOITATION (Art. 23–24)
  {
    id: 'exploitation_forcedlabour_1', module_id: 'exploitation', correct_answer: 'a', order_index: 1,
    translations: {
      en: {
        concept: 'Forced labour & trafficking prohibited (Art. 23)',
        explanation: 'Traffic in human beings, begar and similar forms are prohibited.',
        story: 'Workers are compelled to work without pay under threat.',
        options: [
          { id: 'a', text: 'Article 23 prohibition' },
          { id: 'b', text: 'Article 30 minorities’ institutions' },
          { id: 'c', text: 'Article 18 titles' }
        ],
        feedbackCorrect: 'Correct — Art. 23 forbids forced labour & trafficking.',
        feedbackIncorrect: 'See Art. 23 for this prohibition.'
      },
      hi: {
        concept: 'जबरन श्रम व तस्करी निषेध (अनु. 23)',
        explanation: 'मानव तस्करी, बेगार व समान रूप निषिद्ध हैं।',
        story: 'मजदूरों को धमकाकर बिना वेतन काम करवाया जाता है।',
        options: [
          { id: 'a', text: 'अनु.23 का निषेध' },
          { id: 'b', text: 'अनु.30 अल्पसंख्यक संस्थान' },
          { id: 'c', text: 'अनु.18 उपाधियाँ' }
        ],
        feedbackCorrect: 'सही — अनु.23 जबरन श्रम/तस्करी निषिद्ध करता है।',
        feedbackIncorrect: 'इस निषेध के लिए अनु.23 देखें।'
      }
    }
  },
  {
    id: 'exploitation_childlabour_1', module_id: 'exploitation', correct_answer: 'a', order_index: 2,
    translations: {
      en: {
        concept: 'Hazardous child labour prohibited (Art. 24)',
        explanation: 'Employment of children in hazardous work is prohibited.',
        story: 'Children are found doing dangerous tasks in a factory.',
        options: [
          { id: 'a', text: 'Article 24 prohibition' },
          { id: 'b', text: 'Article 16 public employment' },
          { id: 'c', text: 'Article 27 religious taxes' }
        ],
        feedbackCorrect: 'Correct — Art. 24 bars hazardous child labour.',
        feedbackIncorrect: 'Article 24 targets hazardous child labour.'
      },
      hi: {
        concept: 'खतरनाक बाल श्रम निषिद्ध (अनु. 24)',
        explanation: 'खतरनाक कार्यों में बच्चों का रोजगार वर्जित है।',
        story: 'कारखाने में बच्चे खतरनाक काम करते मिले।',
        options: [
          { id: 'a', text: 'अनु.24 का निषेध' },
          { id: 'b', text: 'अनु.16 सार्वजनिक रोजगार' },
          { id: 'c', text: 'अनु.27 धार्मिक कर' }
        ],
        feedbackCorrect: 'सही — अनु.24 खतरनाक बाल श्रम रोकता है।',
        feedbackIncorrect: 'अनु.24 इसी पर केंद्रित है।'
      }
    }
  },

  // === RELIGION (Art. 25–28)
  {
    id: 'religion_instruction_1', module_id: 'religion', correct_answer: 'c', order_index: 1,
    translations: {
      en: {
        concept: 'No compulsory religious instruction (Art. 28)',
        explanation: 'Certain institutions cannot impart compulsory religious instruction.',
        story: 'A state-aided school makes one faith’s instruction compulsory.',
        options: [
          { id: 'a', text: 'Article 14 equality' },
          { id: 'b', text: 'Article 19 speech' },
          { id: 'c', text: 'Article 28 restriction on religious instruction' }
        ],
        feedbackCorrect: 'Correct — Art. 28 guards against compulsory religious instruction.',
        feedbackIncorrect: 'Consider Arts. 25–28; Art. 28 is specific here.'
      },
      hi: {
        concept: 'अनिवार्य धार्मिक शिक्षा नहीं (अनु. 28)',
        explanation: 'कुछ संस्थानों में अनिवार्य धार्मिक शिक्षा वर्जित है।',
        story: 'एक राज्य-सहायता प्राप्त स्कूल एक धर्म की शिक्षा अनिवार्य करता है।',
        options: [
          { id: 'a', text: 'अनु.14 समानता' },
          { id: 'b', text: 'अनु.19 भाषण' },
          { id: 'c', text: 'अनु.28 धार्मिक शिक्षा पर रोक' }
        ],
        feedbackCorrect: 'सही — अनु.28 अनिवार्य धार्मिक शिक्षा से बचाता है।',
        feedbackIncorrect: 'अनु.25–28 देखें; यहाँ अनु.28 लागू होता है।'
      }
    }
  },

  // === CULTURAL & EDUCATIONAL (Art. 29–30)
  {
    id: 'cultural_minorityinst_1', module_id: 'cultural-educational', correct_answer: 'b', order_index: 1,
    translations: {
      en: {
        concept: 'Minorities’ educational institutions (Art. 30)',
        explanation: 'Minorities have the right to establish and administer educational institutions.',
        story: 'A minority community seeks to run its own college.',
        options: [
          { id: 'a', text: 'Article 23 prohibition on trafficking' },
          { id: 'b', text: 'Article 30 minorities’ institutions' },
          { id: 'c', text: 'Article 17 abolition of untouchability' }
        ],
        feedbackCorrect: 'Correct — Art. 30 enables minority institutions.',
        feedbackIncorrect: 'This is protected under Art. 30.'
      },
      hi: {
        concept: 'अल्पसंख्यक शैक्षिक संस्थान (अनु. 30)',
        explanation: 'अल्पसंख्यकों को शैक्षिक संस्थान स्थापित/प्रबंधित करने का अधिकार।',
        story: 'एक अल्पसंख्यक समुदाय अपना कॉलेज चलाना चाहता है।',
        options: [
          { id: 'a', text: 'अनु.23 मानव तस्करी निषेध' },
          { id: 'b', text: 'अनु.30 अल्पसंख्यक संस्थान' },
          { id: 'c', text: 'अनु.17 अस्पृश्यता उन्मूलन' }
        ],
        feedbackCorrect: 'सही — अनु.30 अल्पसंख्यक संस्थानों को सक्षम करता है।',
        feedbackIncorrect: 'यह अधिकार अनु.30 में सुरक्षित है।'
      }
    }
  },

  // === REMEDIES & LIMITS (Art. 32, 33–35)
  {
    id: 'remedies_writ_1', module_id: 'constitutional-remedies', correct_answer: 'a', order_index: 1,
    translations: {
      en: {
        concept: 'Article 32 and writs',
        explanation: 'Move Supreme Court for FR enforcement; correct writ depends on violation.',
        story: 'A citizen is illegally detained without lawful order. Which writ applies?',
        options: [
          { id: 'a', text: 'Habeas Corpus (unlawful detention)' },
          { id: 'b', text: 'Mandamus (public duty performance)' },
          { id: 'c', text: 'Quo Warranto (question authority to hold office)' }
        ],
        feedbackCorrect: 'Correct — Habeas Corpus addresses unlawful detention (Art. 32).',
        feedbackIncorrect: 'Consider which writ targets unlawful detention.'
      },
      hi: {
        concept: 'अनु. 32 व रिट्स',
        explanation: 'मौलिक अधिकार प्रवर्तन हेतु सर्वोच्च न्यायालय; रिट उल्लंघन पर निर्भर।',
        story: 'किसी नागरिक को बिना वैध आदेश अवैध रूप से हिरासत में रखा गया है। कौन सा रिट उचित है?',
        options: [
          { id: 'a', text: 'हैबियस कॉर्पस (अवैध हिरासत)' },
          { id: 'b', text: 'मंडामस (सार्वजनिक दायित्व पूरा कराना)' },
          { id: 'c', text: 'क्वो वारंटो (पद धारण की वैधता पर प्रश्न)' }
        ],
        feedbackCorrect: 'सही — हैबियस कॉर्पस अवैध हिरासत के लिए (अनु. 32)।',
        feedbackIncorrect: 'सोचें — अवैध हिरासत के लिए कौन सा रिट है।'
      }
    }
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('🌱 Starting database seeding (Part III only)…');
    await client.query('BEGIN');

    // --- Clean out old fake modules (if present) in FK-safe order ---
    // Remove scenario options/translations for scenarios that belong to consumer/tenant
    await client.query(`
      DELETE FROM scenario_options
      WHERE scenario_id IN (SELECT id FROM scenarios WHERE module_id IN ('consumer','tenant'));
    `);
    await client.query(`
      DELETE FROM scenario_translations
      WHERE scenario_id IN (SELECT id FROM scenarios WHERE module_id IN ('consumer','tenant'));
    `);
    await client.query(`DELETE FROM scenarios WHERE module_id IN ('consumer','tenant');`);
    await client.query(`DELETE FROM module_translations WHERE module_id IN ('consumer','tenant');`);
    await client.query(`DELETE FROM modules WHERE id IN ('consumer','tenant');`);
    console.log('🧹 Removed legacy consumer/tenant content (if any).'); // old content your previous seed added :contentReference[oaicite:3]{index=3}

    // --- Insert Part III modules ---
    for (const m of PART_III_MODULES) {
      await client.query(
        `INSERT INTO modules (id, icon) VALUES ($1, $2) ON CONFLICT (id) DO NOTHING`,
        [m.id, m.icon]
      );
      for (const [lang, t] of Object.entries(m.translations)) {
        await client.query(
          `INSERT INTO module_translations (module_id, language_code, title, description, badge_name)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [m.id, lang, t.title, t.description, t.badge]
        );
      }
    }
    console.log('✅ Inserted Part III modules & translations.');

    // --- Insert scenarios + translations + options ---
    for (const s of SCENARIOS) {
      await client.query(
        `INSERT INTO scenarios (id, module_id, correct_answer, order_index)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO NOTHING`,
        [s.id, s.module_id, s.correct_answer, s.order_index]
      );

      for (const [lang, t] of Object.entries(s.translations)) {
        await client.query(
          `INSERT INTO scenario_translations
           (scenario_id, language_code, concept, explanation, story, feedback_correct, feedback_incorrect)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [s.id, lang, t.concept, t.explanation, t.story, t.feedbackCorrect, t.feedbackIncorrect]
        );

        // options array -> scenario_options rows
        for (const opt of t.options) {
          await client.query(
            `INSERT INTO scenario_options (scenario_id, option_id, language_code, option_text)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT DO NOTHING`,
            [s.id, opt.id, lang, opt.text]
          );
        }
      }
    }
    console.log('✅ Inserted scenarios, translations, and options.');

    await client.query('COMMIT');
    console.log('🎉 Seeding complete.');
    process.exit(0);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
  }
}

run();
