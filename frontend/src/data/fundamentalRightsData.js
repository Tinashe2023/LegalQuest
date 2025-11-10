// src/data/fundamentalRightsData.js
export const FUNDAMENTAL_RIGHTS = {
    general: {
      id: 'general-definition',
      icon: '📘',
      articles: '12-13',
      translations: {
        en: { title: 'Definitions & Law (Art.12-13)', description: 'Who is "the State" and laws inconsistent with Part III' },
        hi: { title: 'परिभाषाएँ और विधि (अनु.12-13)', description: '“राज्य” कौन; भाग III के विरुद्ध कानून' }
      }
    },
    equality: {
      id: 'equality',
      icon: '⚖️',
      articles: '14-18',
      translations: {
        en: { title: 'Right to Equality', description: 'Articles 14-18' },
        hi: { title: 'समानता का अधिकार', description: 'अनु.14-18' }
      }
    },
    freedom: {
      id: 'freedom',
      icon: '🕊️',
      articles: '19-22',
      translations: {
        en: { title: 'Right to Freedom', description: 'Articles 19-22' },
        hi: { title: 'स्वतंत्रता का अधिकार', description: 'अनु.19-22' }
      }
    },
    exploitation: {
      id: 'exploitation',
      icon: '🛡️',
      articles: '23-24',
      translations: {
        en: { title: 'Right Against Exploitation', description: 'Articles 23-24' },
        hi: { title: 'शोषण के विरुद्ध अधिकार', description: 'अनु.23-24' }
      }
    },
    religion: {
      id: 'religion',
      icon: '🕉️',
      articles: '25-28',
      translations: {
        en: { title: 'Freedom of Religion', description: 'Articles 25-28' },
        hi: { title: 'धार्मिक स्वतंत्रता', description: 'अनु.25-28' }
      }
    },
    cultural: {
      id: 'cultural-educational',
      icon: '🎨',
      articles: '29-30',
      translations: {
        en: { title: 'Cultural & Educational Rights', description: 'Articles 29-30' },
        hi: { title: 'सांस्कृतिक और शैक्षिक अधिकार', description: 'अनु.29-30' }
      }
    },
    remedies: {
      id: 'constitutional-remedies',
      icon: '📜',
      articles: '32-35',
      translations: {
        en: { title: 'Constitutional Remedies & Limits', description: 'Article 32 & Articles 33-35' },
        hi: { title: 'संवैधानिक उपचार व सीमाएँ', description: 'अनु.32 तथा अनु.33-35' }
      }
    }
  };
  
  // Minimal local game data (only used if you want quick local play)
  export const SNAKES_LADDERS_SCENARIOS = {
    equality: [
      { id: 'eq_ladder_1', type: 'ladder', en: { text: 'Equal pay for equal work', article: 'Art.14/16', points: 10 }, hi: { text: 'समान काम = समान वेतन', article: 'अनु.14/16', points: 10 } },
      { id: 'eq_snake_1', type: 'snake', en: { text: 'Refused job for caste', article: 'Art.15 violation', points: -10 }, hi: { text: 'जाति के कारण नौकरी से इंकार', article: 'अनु.15 उल्लंघन', points: -10 } }
    ],
    freedom: [
      { id: 'fr_ladder_1', type: 'ladder', en: { text: 'Held peaceful assembly', article: 'Art.19(1)(b)', points: 10 }, hi: { text: 'शांतिपूर्ण सभा', article: 'अनु.19(1)(b)', points: 10 } },
      { id: 'fr_snake_1', type: 'snake', en: { text: 'Detained without grounds', article: 'Art.22 violation', points: -10 }, hi: { text: 'बिना कारण हिरासत', article: 'अनु.22 उल्लंघन', points: -10 } }
    ]
  };
  
  export const SCENARIO_SNAP_CARDS = [
    {
      id: 'snap_1',
      category: 'freedom',
      scenario: { en: 'Arrested without being told why', hi: 'बिना कारण बताये गिरफ्तार' },
      right: { en: 'Article 22: Safeguards on arrest', hi: 'अनु.22: गिरफ्तारी पर सुरक्षा' }
    },
    {
      id: 'snap_2',
      category: 'equality',
      scenario: { en: 'Denied service because of caste', hi: 'जाति के कारण सेवा अस्वीकृति' },
      right: { en: 'Article 15: Prohibition of discrimination', hi: 'अनु.15: भेदभाव का निषेध' }
    }
  ];
  
  export const WHEEL_QUESTIONS = {
    equality: [
      { en: { q: 'Which article guarantees equality before law?', a: 'Article 14', options: ['Article 12','Article 14','Article 19','Article 21'] },
        hi: { q: 'कौन सा अनु. कानून के समक्ष समानता देता है?', a: 'अनु.14', options: ['अनु.12','अनु.14','अनु.19','अनु.21'] } }
    ],
    freedom: [
      { en: { q: 'Which article protects freedom of speech?', a: 'Article 19', options: ['Article 19','Article 20','Article 21','Article 14'] },
        hi: { q: 'कौन सा अनु. भाषण की स्वतंत्रता देता है?', a: 'अनु.19', options: ['अनु.19','अनु.20','अनु.21','अनु.14'] } }
    ]
  };
  