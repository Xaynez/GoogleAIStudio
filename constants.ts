import type { MarketplaceListing, MarketplaceCategory, Conversation, Locale, Post, OpportunityTeaser, FeedItem, Notification, NetworkUser, Reaction } from './types';

// A comprehensive list of locales for robust internationalization support.
export const SUPPORTED_LOCALES: Locale[] = [
    { code: 'en-US', cldr: 'en', name: 'English (US)', flag: '🇺🇸', dialCode: '+1', currency: 'USD' },
    { code: 'ar-SA', cldr: 'ar', name: 'العربية (السعودية)', flag: '🇸🇦', dialCode: '+966', currency: 'SAR' },
    { code: 'cs-CZ', cldr: 'cs', name: 'Čeština (Česká republika)', flag: '🇨🇿', dialCode: '+420', currency: 'CZK' },
    { code: 'da-DK', cldr: 'da', name: 'Dansk (Danmark)', flag: '🇩🇰', dialCode: '+45', currency: 'DKK' },
    { code: 'de-DE', cldr: 'de', name: 'Deutsch (Deutschland)', flag: '🇩🇪', dialCode: '+49', currency: 'EUR' },
    { code: 'el-GR', cldr: 'el', name: 'Ελληνικά (Ελλάδα)', flag: '🇬🇷', dialCode: '+30', currency: 'EUR' },
    { code: 'es-ES', cldr: 'es', name: 'Español (España)', flag: '🇪🇸', dialCode: '+34', currency: 'EUR' },
    { code: 'fi-FI', cldr: 'fi', name: 'Suomi (Suomi)', flag: '🇫🇮', dialCode: '+358', currency: 'EUR' },
    { code: 'fr-FR', cldr: 'fr', name: 'Français (France)', flag: '🇫🇷', dialCode: '+33', currency: 'EUR' },
    { code: 'he-IL', cldr: 'he', name: 'עברית (ישראל)', flag: '🇮🇱', dialCode: '+972', currency: 'ILS' },
    { code: 'hi-IN', cldr: 'hi', name: 'हिन्दी (भारत)', flag: '🇮🇳', dialCode: '+91', currency: 'INR' },
    { code: 'hu-HU', cldr: 'hu', name: 'Magyar (Magyarország)', flag: '🇭🇺', dialCode: '+36', currency: 'HUF' },
    { code: 'id-ID', cldr: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩', dialCode: '+62', currency: 'IDR' },
    { code: 'it-IT', cldr: 'it', name: 'Italiano (Italia)', flag: '🇮🇹', dialCode: '+39', currency: 'EUR' },
    { code: 'ja-JP', cldr: 'ja', name: '日本語 (日本)', flag: '🇯🇵', dialCode: '+81', currency: 'JPY' },
    { code: 'ko-KR', cldr: 'ko', name: '한국어 (대한민국)', flag: '🇰🇷', dialCode: '+82', currency: 'KRW' },
    { code: 'ms-MY', cldr: 'ms', name: 'Bahasa Melayu', flag: '🇲🇾', dialCode: '+60', currency: 'MYR' },
    { code: 'nl-NL', cldr: 'nl', name: 'Nederlands (Nederland)', flag: '🇳🇱', dialCode: '+31', currency: 'EUR' },
    { code: 'no-NO', cldr: 'no', name: 'Norsk (Norge)', flag: '🇳🇴', dialCode: '+47', currency: 'NOK' },
    { code: 'pl-PL', cldr: 'pl', name: 'Polski (Polska)', flag: '🇵🇱', dialCode: '+48', currency: 'PLN' },
    { code: 'pt-BR', cldr: 'pt', name: 'Português (Brasil)', flag: '🇧🇷', dialCode: '+55', currency: 'BRL' },
    { code: 'ro-RO', cldr: 'ro', name: 'Română (România)', flag: '🇷🇴', dialCode: '+40', currency: 'RON' },
    { code: 'ru-RU', cldr: 'ru', name: 'Русский (Россия)', flag: '🇷🇺', dialCode: '+7', currency: 'RUB' },
    { code: 'sv-SE', cldr: 'sv', name: 'Svenska (Sverige)', flag: '🇸🇪', dialCode: '+46', currency: 'SEK' },
    { code: 'th-TH', cldr: 'th', name: 'ไทย (ประเทศไทย)', flag: '🇹🇭', dialCode: '+66', currency: 'THB' },
    { code: 'tr-TR', cldr: 'tr', name: 'Türkçe (Türkiye)', flag: '🇹🇷', dialCode: '+90', currency: 'TRY' },
    { code: 'uk-UA', cldr: 'uk', name: 'Українська (Україна)', flag: '🇺🇦', dialCode: '+380', currency: 'UAH' },
    { code: 'vi-VN', cldr: 'vi', name: 'Tiếng Việt (Việt Nam)', flag: '🇻🇳', dialCode: '+84', currency: 'VND' },
    { code: 'zh-CN', cldr: 'zh', name: '简体中文 (中国)', flag: '🇨🇳', dialCode: '+86', currency: 'CNY' },
].sort((a, b) => {
    if (a.code === 'en-US') return -1;
    if (b.code === 'en-US') return 1;
    return a.name.localeCompare(b.name);
});

export const MOCK_EXCHANGE_RATES: Record<string, number> = {
    USD: 1.0,
    EUR: 0.92,
    JPY: 157.0,
    GBP: 0.79,
    CAD: 1.37,
    CNY: 7.25,
    RUB: 91.0,
    BRL: 5.15,
    KRW: 1378.0,
    INR: 83.5,
};

export const NEW_MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
    'Investments',
    'Investors',
    'Partnerships',
    'Business for Sale',
    'Real Estate',
    'Suppliers & Logistics',
    'Intellectual Property',
    'Assets',
    'Fundraising',
    'C-level Jobs',
    'Events',
    'Courses',
];

export const CURRENCIES = ['USD', 'EUR', 'JPY', 'GBP', 'CAD', 'AUD'];

export const LANGUAGES = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'ja', name: 'Japanese' },
  { code: 'zh-CN', name: 'Chinese (Simplified)' },
];

export const DUMMY_LISTING = `
For Sale: High-Growth SaaS Company in FinTech Space
Listing ID: SaaS-FT-8812

Location: San Francisco, CA, USA

Description:
We are offering a unique opportunity to acquire a profitable, bootstrapped SaaS company specializing in automated expense tracking for small to medium-sized businesses. Founded in 2018, our platform has seen consistent 40% year-over-year growth with a strong base of 5,000+ paying customers. The technology is built on a scalable, modern stack (React, Node.js, AWS) and features a user-friendly interface that customers love.

Financials:
- Annual Recurring Revenue (ARR): $1.2 Million
- Profit Margin: 35%
- Customer Lifetime Value (LTV): $2,500
- Customer Acquisition Cost (CAC): $450

Asking Price: 4,800,000 USD

Included in Sale:
- Full ownership of the proprietary source code and intellectual property.
- All customer contracts and associated revenue streams.
- Brand assets, domain names, and social media accounts.
- A small, highly-skilled remote team of 3 engineers and 2 support staff willing to transition.

Reason for Selling:
Founders are moving on to a new venture in the renewable energy sector. We are looking for a buyer who can take this solid foundation to the next level. Minimal documentation available until NDA is signed. Serious inquiries only. Contact via platform messenger.
`;

export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
    // Approved Listings
    {
        id: 'inv-001',
        category: 'Investments',
        title: { originalLang: 'en-US', originalText: 'Seed Round for AI-Powered Logistics Platform' },
        location: 'Austin, TX',
        summary: { originalLang: 'en-US', originalText: 'Seeking $500K for 20% equity in a disruptive logistics startup using AI to optimize supply chains.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/inv-001/800/400' }],
        amount: 500000,
        currency: 'USD',
        documents: [{ name: 'Pitch_Deck_LogiAI.pdf', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'Our proprietary AI model predicts shipping delays with 95% accuracy, saving clients an average of 15% on operational costs. Funds will be used for market expansion and hiring key engineering talent. We have 3 pilot customers and a strong pipeline.' },
            keyMetrics: [
                { label: 'Valuation', value: '$2.5M Post-Money' },
                { label: 'Target Market', value: 'North American Freight' },
                { label: 'Founding Team', value: 'Ex-Google & Uber Logistics' },
            ],
        },
        status: 'Approved',
        submittedBy: 'Jane Doe',
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        aiRiskScore: 15,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        sponsorshipDetails: {
            plan: 'monthly',
            boost: true,
            cost: 250,
        }
    },
    {
        id: 'biz-001',
        category: 'Business for Sale',
        title: { originalLang: 'en-US', originalText: 'Profitable E-Commerce Brand in Home Goods' },
        location: 'Remote',
        summary: { originalLang: 'en-US', originalText: 'Acquire a 5-year-old e-commerce business with $1.2M in annual revenue and strong brand recognition.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/biz-001/800/400' }],
        amount: 2500000,
        currency: 'USD',
        documents: [{ name: 'Financials_Overview_Q2.xlsx', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'This business has a loyal customer base and a highly optimized supply chain. It is fully relocatable and can be managed by a small team. Sale includes all digital assets, inventory, and supplier relationships.' },
            keyMetrics: [
                { label: 'Annual Revenue', value: '$1.2M' },
                { label: 'Net Profit', value: '$400K' },
                { label: 'Website Traffic', value: '150K monthly uniques' },
            ],
        },
        status: 'Approved',
        submittedBy: 'John Smith',
        submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        aiRiskScore: 10,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
        sponsorshipDetails: {
            plan: 'daily',
            boost: false,
            cost: 5,
        }
    },
    {
        id: 'log-001',
        category: 'Suppliers & Logistics',
        title: { originalLang: 'en-US', originalText: 'Global Cold Chain Logistics Partner' },
        location: 'Global',
        summary: { originalLang: 'en-US', originalText: 'End-to-end refrigerated shipping solutions for pharmaceutical and perishable goods.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/log-001/800/400' }],
        amount: 0, // Service-based, no direct price
        currency: 'USD',
        documents: [{ name: 'Service_Catalog.pdf', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'We offer a fleet of GDP-compliant refrigerated containers and real-time temperature monitoring. Our network covers over 120 countries.' },
            keyMetrics: [
                { label: 'Fleet Size', value: '5,000+ Containers' },
                { label: 'Certifications', value: 'GDP, ISO 9001' },
                { label: 'On-time Delivery', value: '99.2%' },
            ],
        },
        status: 'Approved',
        submittedBy: 'Global Freeze Inc.',
        submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        aiRiskScore: 5,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
        id: 'ip-001',
        category: 'Intellectual Property',
        title: { originalLang: 'en-US', originalText: 'Patent Portfolio for Novel Battery Technology' },
        location: 'Palo Alto, CA',
        summary: { originalLang: 'en-US', originalText: 'Portfolio of 12 granted patents covering solid-state battery chemistry, increasing energy density by 40%.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/ip-001/800/400' }],
        amount: 15000000,
        currency: 'USD',
        documents: [{ name: 'Patent_List.pdf', url: '#' }],
        details: {
            description: { originalLang: 'en-US', originalText: 'This technology is a breakthrough for EV and consumer electronics. The patents have been granted in the US, EU, and China. Licensing or full acquisition available.' },
            keyMetrics: [
                { label: 'Patents Granted', value: '12' },
                { label: 'Priority Date', value: '2019' },
                { label: 'Key Markets', value: 'US, EU, China' },
            ],
        },
        status: 'Approved',
        submittedBy: 'Tech Innovations LLC',
        submittedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        aiRiskScore: 20,
        aiFlags: [],
        reviewedBy: 'Compliance Officer',
        reviewedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    },
    // Listings Pending Review
    {
        id: 're-002',
        category: 'Real Estate',
        title: { originalLang: 'en-US', originalText: 'High-Value Commercial Tower' },
        location: 'New York, NY',
        summary: { originalLang: 'en-US', originalText: 'For sale: 50-story commercial skyscraper in downtown Manhattan. High-value deal requiring review.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/re-002/800/400' }],
        amount: 850000000,
        currency: 'USD',
        documents: [],
        details: {
            description: { originalLang: 'en-US', originalText: 'This is a landmark property with 98% occupancy. Financials available upon signing an NDA. This is a highly sensitive and large-scale transaction.' },
            keyMetrics: [
                { label: 'Cap Rate', value: '4.5%' },
                { label: 'Building Size', value: '1.2M sq. ft.' },
                { label: 'Occupancy', value: '98%' },
            ],
        },
        status: 'Pending Review',
        submittedBy: 'Emily White',
        submittedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        aiRiskScore: 78,
        aiFlags: ['High-value transaction requires manual sign-off', 'International buyer interest', 'Complex legal structure'],
    },
    {
        id: 'sup-002',
        category: 'Partnerships',
        title: { originalLang: 'en-US', originalText: 'Bulk PPE Supplier - Vague Details' },
        location: 'Unknown',
        summary: { originalLang: 'en-US', originalText: 'Supplier of masks, gloves, and other PPE. Best prices. Contact for details.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/sup-002/800/400' }],
        amount: 0,
        currency: 'USD',
        documents: [],
        details: {
            description: { originalLang: 'en-US', originalText: 'We can supply large quantities of PPE. Very cheap. Wire transfer only. No website available, contact on this platform only.' },
            keyMetrics: [
                { label: 'Certifications', value: 'Not specified' },
                { label: 'Lead Time', value: 'Varies' },
            ],
        },
        status: 'Pending Review',
        submittedBy: 'Anonymous User',
        submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        aiRiskScore: 95,
        aiFlags: ['Anonymous user', 'Vague location', 'Unusual payment terms (wire only)', 'Lack of documentation/website'],
    },
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: 'conv-1',
        participant: { id: 'user-2', name: 'Dr. Alisha Chen', title: 'Chief Medical Officer, InnovateHealth' },
        lastMessage: 'Perfect, I\'ve attached the preliminary research. Let me know your thoughts.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        unreadCount: 1,
        messages: [
            { id: 'msg-1-1', senderId: 'user-2', senderName: 'Dr. Alisha Chen', text: { originalLang: 'en-US', originalText: 'Regarding the Series B for our med-tech venture, are you available for a brief sync tomorrow?' }, isOwn: false, timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
            { id: 'msg-1-2', senderId: 'user-1', senderName: 'Me', text: { originalLang: 'en-US', originalText: 'Absolutely. 10 AM EST works for me. Happy to discuss the potential synergies.' }, isOwn: true, timestamp: new Date(Date.now() - 3600000 * 2.5).toISOString() },
            { id: 'msg-1-3', senderId: 'user-2', senderName: 'Dr. Alisha Chen', text: { originalLang: 'en-US', originalText: 'Perfect, I\'ve attached the preliminary research. Let me know your thoughts.' }, isOwn: false, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
        ]
    },
    {
        id: 'conv-2',
        participant: { id: 'user-3', name: 'Marcus Thorne', title: 'Founder & CEO, QuantumLeap AI' },
        lastMessage: 'The cap table looks solid. My team will have the term sheet over by EOD Friday.',
        timestamp: new Date(Date.now() - 86400000 * 1).toISOString(),
        unreadCount: 0,
        messages: [
            { id: 'msg-2-1', senderId: 'user-3', senderName: 'Marcus Thorne', text: { originalLang: 'en-US', originalText: 'The cap table looks solid. My team will have the term sheet over by EOD Friday.' }, isOwn: false, timestamp: new Date(Date.now() - 86400000 * 1).toISOString() },
        ]
    },
];

const MOCK_AUTHORS = {
    'user-1': { id: 'user-1', name: 'Alex Thornton', title: 'CEO, Quantum Dynamics Inc.', company: 'Quantum Dynamics Inc.', verified: true, profileImageUrl: 'https://i.pravatar.cc/150?u=user-1' },
    'user-2': { id: 'user-2', name: 'Dr. Alisha Chen', title: 'Chief Medical Officer, InnovateHealth', company: 'InnovateHealth', verified: true, profileImageUrl: 'https://i.pravatar.cc/150?u=user-2' },
    'user-3': { id: 'user-3', name: 'Marcus Thorne', title: 'Founder & CEO, QuantumLeap AI', company: 'QuantumLeap AI', verified: false, profileImageUrl: 'https://i.pravatar.cc/150?u=user-3' },
    'user-4': { id: 'user-4', name: 'Jean-Pierre Dubois', title: 'Head of EMEA, Global Logistics', company: 'Global Logistics', verified: true, profileImageUrl: 'https://i.pravatar.cc/150?u=user-4' },
    'corp-1': { id: 'corp-1', name: 'Quantum Dynamics Inc.', title: 'Official Sponsor', company: 'Quantum Dynamics Inc.', verified: true, profileImageUrl: 'https://i.pravatar.cc/150?u=corp-1' }
};

const mockReactions: Reaction[] = [
    { user: MOCK_AUTHORS['user-2'], type: 'like' },
    { user: MOCK_AUTHORS['user-3'], type: 'insightful' },
    { user: MOCK_AUTHORS['user-4'], type: 'applaud' },
];

export const MOCK_FEED_POSTS: Post[] = [
    {
        id: 'post-sponsor-1',
        type: 'image',
        author: MOCK_AUTHORS['corp-1'],
        content: { originalLang: 'en-US', originalText: 'Experience the future of business intelligence with Quantum Dynamics. Our AI-driven platform provides unparalleled market insights to help you stay ahead of the curve. Visit our sponsored session at the Global Tech Summit.' },
        media: [{ type: 'image', url: 'https://picsum.photos/seed/sponsor1/800/400', name: 'quantum_dynamics_ad.jpg' }],
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        analytics: { allReactions: mockReactions.slice(0, 2), comments: 45, impressions: 55000, views: 12000, shares: 32, profileViews: 150, newConnections: 5 },
        currentUserReaction: undefined,
        comments: [],
        isSponsored: true,
        tags: ['AI', 'BusinessIntelligence', 'TechSummit'],
    },
    {
      id: 'post-1',
      type: 'text',
      author: MOCK_AUTHORS['user-1'],
      content: { 
          originalLang: 'en-US', 
          originalText: 'Excited to share our Q3 earnings report. We\'ve seen incredible growth in emerging markets, driven by our new product line. A huge thank you to the entire team for their hard work and dedication!',
          translations: {
              'es-ES': {
                  text: 'Emocionado de compartir nuestro informe de ganancias del T3. Hemos visto un crecimiento increíble en los mercados emergentes, impulsado por nuestra nueva línea de productos. ¡Un enorme agradecimiento a todo el equipo por su arduo trabajo y dedicación!',
                  confidence: 0.98,
              }
          }
      },
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      analytics: { allReactions: mockReactions, comments: 2, impressions: 12500, views: 4000, shares: 15, profileViews: 88, newConnections: 12 },
      currentUserReaction: 'like',
      tags: ['Earnings', 'Growth', 'EmergingMarkets'],
      comments: [
        { 
            id: 'comment-1', 
            author: MOCK_AUTHORS['user-3'], 
            text: { originalLang: 'en-US', originalText: 'Great update, Alex! The new product line is a game-changer.' }, 
            timestamp: new Date(Date.now() - 86400000 + 100000).toISOString(),
            allReactions: [{ user: MOCK_AUTHORS['user-2'], type: 'like' }],
            currentUserReaction: 'like',
            replies: [
                {
                    id: 'reply-1-1',
                    author: MOCK_AUTHORS['user-1'],
                    text: { originalLang: 'en-US', originalText: 'Thanks Marcus! Appreciate the support. We should connect next week to discuss potential synergies.' },
                    timestamp: new Date(Date.now() - 86400000 + 200000).toISOString(),
                    allReactions: [{ user: MOCK_AUTHORS['user-3'], type: 'love' }],
                }
            ]
        },
        { 
            id: 'comment-2', 
            author: MOCK_AUTHORS['user-2'], 
            text: { originalLang: 'en-US', originalText: 'Looking forward to the next steps.' }, 
            timestamp: new Date(Date.now() - 86400000 + 300000).toISOString(),
            allReactions: []
        }
      ]
    },
     {
      id: 'post-2',
      type: 'image',
      author: MOCK_AUTHORS['user-1'],
      content: { originalLang: 'en-US', originalText: 'Just returned from the Global Tech Summit in Tokyo. Incredible insights into the future of AI and quantum computing. The energy was palpable!' },
      media: [{ type: 'image', url: 'https://picsum.photos/seed/summit/800/400', name: 'tokyo_summit.jpg' }],
      timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
      analytics: { allReactions: [mockReactions[1]], comments: 15, impressions: 22000, views: 9800, shares: 40, profileViews: 210, newConnections: 25 },
      currentUserReaction: 'insightful',
      tags: ['AI', 'QuantumComputing', 'GTS2024'],
      comments: []
    },
    {
        id: 'post-3',
        type: 'text',
        author: MOCK_AUTHORS['user-2'],
        content: { originalLang: 'en-US', originalText: 'Fascinating article on the application of generative AI in personalized medicine. The potential for predictive diagnostics is a game-changer for the healthcare industry. Curious to hear other leaders\' thoughts on the ethical implications.' },
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        analytics: { allReactions: [], comments: 28, impressions: 8000, views: 2500, shares: 10, profileViews: 40, newConnections: 3 },
        currentUserReaction: undefined,
        tags: ['GenerativeAI', 'Healthcare', 'MedTech', 'Ethics'],
        comments: [],
    },
    {
        id: 'post-4',
        type: 'document',
        author: MOCK_AUTHORS['user-3'],
        content: { originalLang: 'en-US', originalText: 'For those interested in M&A strategy for 2025, my team has compiled a whitepaper on identifying undervalued tech assets. Happy to share our findings and discuss.' },
        media: [{ type: 'document', url: '#', name: '2025_MA_Strategy_Whitepaper.pdf' }],
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        analytics: { allReactions: [mockReactions[2]], comments: 5, impressions: 4500, views: 1800, shares: 22, profileViews: 35, newConnections: 8 },
        currentUserReaction: undefined,
        tags: ['MandA', 'Strategy', 'Tech'],
        comments: [],
    },
    {
        id: 'post-5',
        type: 'text',
        author: MOCK_AUTHORS['user-4'],
        content: { 
            originalLang: 'fr-FR', 
            originalText: 'L\'optimisation de la chaîne d\'approvisionnement européenne est confrontée à des défis uniques en raison de la fragmentation réglementaire. Nos derniers modèles d\'IA montrent une amélioration de 15% de l\'efficacité en consolidant les expéditions transfrontalières.',
            translations: {
                'en-US': {
                    text: 'The optimization of the Europe supply chain is facing unique challenges due to regulatory fragmentation. Our latest AI models show a 15% efficiency improvement in consolidating cross-border shipping.',
                    confidence: 0.55, // Low confidence to test the banner
                }
            }
        },
        timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
        analytics: { allReactions: [], comments: 12, impressions: 9800, views: 3200, shares: 8, profileViews: 12, newConnections: 1 },
        currentUserReaction: undefined,
        tags: ['Logistics', 'Europe', 'AI', 'SupplyChain'],
        comments: [],
    },
];


export const MOCK_OPPORTUNITY_TEASERS: OpportunityTeaser[] = [
    {
        id: 'teaser-1',
        itemType: 'opportunity',
        listingId: 'inv-001',
        category: 'Investments',
        title: { originalLang: 'en-US', originalText: 'Seed Round for AI-Powered Logistics Platform' },
        shortValuation: 500000,
        currency: 'USD',
        location: 'Austin, TX',
    },
    {
        id: 'teaser-2',
        itemType: 'opportunity',
        listingId: 'biz-001',
        category: 'Business for Sale',
        title: { 
            originalLang: 'en-US', 
            originalText: 'Profitable E-Commerce Brand in Home Goods',
            translations: {
                'es-ES': {
                    text: 'Marca Rentable de Comercio Electrónico de Artículos para el Hogar',
                    confidence: 0.99,
                }
            }
        },
        shortValuation: 2500000,
        currency: 'USD',
        location: 'Remote',
    },
];

export const MOCK_FEED_ITEMS: FeedItem[] = [...MOCK_FEED_POSTS, ...MOCK_OPPORTUNITY_TEASERS];

export const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        type: 'new_message',
        text: 'Dr. Alisha Chen sent you a new message.',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        isRead: false,
        link: { view: 'dashboard', itemId: 'conv-1' } // Opens messages
    },
    {
        id: 'notif-2',
        type: 'post_like',
        text: 'Marcus Thorne reacted to your post about the Global Tech Summit.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        isRead: false,
        link: { view: 'feed', itemId: 'post-2' }
    },
    {
        id: 'notif-3',
        type: 'new_listing',
        text: 'A new Investment opportunity in Austin, TX matches your interests.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        isRead: false,
        link: { view: 'marketplace', itemId: 'inv-001' }
    },
    {
        id: 'notif-4',
        type: 'post_comment',
        text: 'Marcus Thorne commented on your post: "Great update, Alex!..."',
        timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
        isRead: true,
        link: { view: 'feed', itemId: 'post-1' }
    },
    {
        id: 'notif-5',
        type: 'system',
        text: 'Welcome to EVOLVE! Complete your profile to get the best matches.',
        timestamp: new Date(Date.now() - 86400000 * 7).toISOString(),
        isRead: true,
    },
];


export const MOCK_NETWORK_USERS: NetworkUser[] = [
    {
        id: 'user-2',
        fullName: 'Dr. Alisha Chen',
        jobTitle: 'Chief Medical Officer',
        company: 'InnovateHealth',
        location: 'Boston, MA',
        profileImageUrl: 'https://i.pravatar.cc/150?u=user-2',
        industries: ['Healthcare', 'MedTech']
    },
    {
        id: 'user-3',
        fullName: 'Marcus Thorne',
        jobTitle: 'Founder & CEO',
        company: 'QuantumLeap AI',
        location: 'Palo Alto, CA',
        profileImageUrl: 'https://i.pravatar.cc/150?u=user-3',
        industries: ['Technology', 'AI', 'Finance']
    },
    {
        id: 'user-4',
        fullName: 'Jean-Pierre Dubois',
        jobTitle: 'Head of EMEA',
        company: 'Global Logistics',
        location: 'Paris, France',
        profileImageUrl: 'https://i.pravatar.cc/150?u=user-4',
        industries: ['Logistics', 'Finance']
    },
    {
        id: 'user-5',
        fullName: 'Sofia Rossi',
        jobTitle: 'Managing Partner',
        company: 'Verdant Ventures',
        location: 'Milan, Italy',
        profileImageUrl: 'https://i.pravatar.cc/150?u=user-5',
        industries: ['Finance', 'Consulting']
    }
];

export const SEARCH_CATEGORIES = ["All", "Groups", "Posts", "People", "Jobs", "Companies", "Schools", "Courses", "Events", "Products", "Services"];