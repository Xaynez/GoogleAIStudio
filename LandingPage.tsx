import React, { useState, useRef, useEffect } from 'react';
import { Pricing } from './Pricing';
import type { PricingTier, AppView } from '../types';
import { Menu, X } from 'lucide-react';
import { useTranslation } from '../i18n';
import { TermsOfUsePage } from './components/terms/TermsOfUsePage';
import { PrivacyPolicyPage } from './components/privacy/PrivacyPolicyPage';
import { GovernancePolicyPage } from './components/governance/GovernancePolicyPage';
import { DevelopmentPage } from './development/DevelopmentPage';
import { LanguageSelector } from './common/LanguageSelector';
import { FAQPage } from './faq/FAQPage';
import { LandingPageChatBot } from './ai/LandingPageChatBot';

// --- Page Components ---

const SectionWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
    <section className={`py-24 min-h-screen flex items-center justify-center ${className}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </div>
    </section>
);

const PageTitle: React.FC<{ children: React.ReactNode, "data-i18n"?: string }> = ({ children, "data-i18n": dataI18n }) => (
     <h2 className="text-3xl font-extrabold text-center sm:text-4xl lg:text-5xl heading-gradient" data-i18n={dataI18n}>
        {children}
    </h2>
);

const PageContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="mt-8 text-lg text-center text-text-secondary">
        {children}
    </div>
);


const HomePage: React.FC = () => {
    const { t } = useTranslation();
    return (
        <section id="home" className="relative text-center py-16 px-4 min-h-screen flex flex-col justify-center items-center overflow-hidden bg-surface-bg">
            {/* Background elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Particles */}
                <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-brand-cyan rounded-full opacity-20" style={{ filter: 'blur(2rem)', animation: 'particle-float-1 20s infinite ease-in-out' }}></div>
                <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-brand-violet rounded-full opacity-10" style={{ filter: 'blur(3rem)', animation: 'particle-float-2 25s infinite ease-in-out' }}></div>
                <div className="absolute bottom-1/4 left-1/3 w-6 h-6 bg-brand-cyan rounded-full opacity-10" style={{ filter: 'blur(2rem)', animation: 'particle-float-3 18s infinite ease-in-out' }}></div>
                <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-brand-violet rounded-full opacity-15" style={{ filter: 'blur(3rem)', animation: 'particle-float-1 22s infinite ease-in-out 3s' }}></div>
                {/* Light Beam */}
                <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-brand-cyan/0 via-brand-cyan/20 to-brand-violet/0" style={{ animation: 'light-beam-anim 15s infinite linear 5s' }}></div>
            </div>
            <div className="relative z-10">
                <div className="logo-container animate-slide-in-up" style={{ animationDelay: '100ms' }}>
                    <div className="logo-text">
                        <span>EV</span>
                        <div className="logo-o logo-glow">
                           <div className="logo-o-inner">
                            <svg width="32" height="32" viewBox="0 0 24 24" className="logo-symbol">
                                <defs>
                                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.5" fill="none" filter="url(#glow)"/>
                                <path d="M 4.5 20 L 12 10 L 19.5 20" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
                            </svg>
                           </div>
                        </div>
                        <span>LVE</span>
                    </div>
                    <p className="logo-tagline">AI-NATIVE ECOSYSTEM FOR LEADERS</p>
                </div>
                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tighter heading-gradient mb-6 whitespace-pre-line animate-slide-in-up" style={{ animationDelay: '200ms' }} data-i18n="homepage_title">
                    {t('homepage_title')}
                </h1>
                <p className="max-w-2xl mx-auto text-lg md:text-xl text-text-secondary animate-slide-in-up" style={{ animationDelay: '400ms' }} data-i18n="homepage_subtitle">
                    {t('homepage_subtitle')}
                </p>
            </div>
        </section>
    );
};

const OverviewPage: React.FC = () => (
    <SectionWrapper>
        <PageTitle>About EVOLVE</PageTitle>
        <PageContent>
            <div className="text-left space-y-6">
                <div>
                    <h3 className="text-xl font-bold mb-2 heading-gradient">Mission</h3>
                    <p>EVOLVE connects forward-thinking leaders, organizations, and innovators within one intelligent, trusted environment. Its mission is to simplify how businesses plan, analyze, and grow through verified data, generative insights, and ethical AI collaboration.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2 heading-gradient">Vision</h3>
                    <p>EVOLVE believes every organization should operate with clarity, speed, and trust. Its vision is a globally connected executive ecosystem where governance, creativity, and automation work together—delivering precision without sacrificing responsibility.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2 heading-gradient">What EVOLVE Is</h3>
                    <p>EVOLVE is a secure AI-native workspace that merges Google AI Studio, Workspace APIs, and real-time governance oversight into one integrated platform. It empowers leaders to generate business plans, pitch decks, data visuals, and compliance documentation in minutes, validated for accuracy and aligned with global policy frameworks.</p>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-2 heading-gradient">Why EVOLVE Matters</h3>
                    <p>EVOLVE bridges technology and leadership, enabling decision-makers to harness AI responsibly while fostering transparency, security, and innovation.</p>
                </div>
            </div>
        </PageContent>
    </SectionWrapper>
);

const EcosystemPage: React.FC = () => {
    const layers = [
        {
            number: 1,
            title: "AI Foundation Layer",
            description: "The intelligence core built on Google Gemini Nano, Gemini Reasoning API, and Chrome AI Studio. It powers real-time insight generation, contextual understanding, multi-language responses, and adaptive creative output.",
            modules: [
                { name: "Gemini Nano", desc: "embedded reasoning and summarization" },
                { name: "Gemini Image API", desc: "creative rendering and visual synthesis" },
                { name: "Gemini Voice", desc: "speech-to-command interaction" },
                { name: "Chrome Built-in AI APIs", desc: "contextual search and content interpretation" }
            ]
        },
        {
            number: 2,
            title: "Collaboration Layer",
            description: "Integrated Google Workspace suite with enhanced automation, transcription, and translation capabilities. All Workspace tools are AI-augmented for efficiency and compliance.",
            modules: [
                { name: "Google Docs API", desc: "Generate structured reports, plans, and proposals." },
                { name: "Google Sheets API", desc: "Synchronize live data for analysis and financial modeling." },
                { name: "Google Slides API", desc: "Auto-build pitch decks and visual presentations." },
                { name: "Google Meet & Chat", desc: "Real-time AI transcription and smart summary features." },
                { name: "Google Calendar API", desc: "AI-scheduled workflow optimization." }
            ]
        },
        {
            number: 3,
            title: "Data & Visualization Layer",
            description: "Empowering leaders to interpret and visualize information instantly.",
            modules: [
                { name: "Google Charts API", desc: "Create dynamic, branded visuals." },
                { name: "Looker Studio API", desc: "Build interactive dashboards." },
                { name: "Google Search API", desc: "Access curated, context-aware research data." },
                { name: "Financial Visualizer", desc: "Transform uploaded data into live charts and projections." }
            ]
        },
        {
            number: 4,
            title: "Creative & Media Layer",
            description: "AI-driven media generation for business storytelling.",
            modules: [
                { name: "Imagen 3", desc: "High-fidelity image generation for marketing and design." },
                { name: "VEO 3", desc: "Video generation for dynamic storytelling and visual campaigns." },
                { name: "AI Note Taker & Recorder", desc: "Transcribe meetings, extract summaries, and create structured notes." },
                { name: "AI Audio Studio", desc: "Generate background voiceovers and sound design for presentations." }
            ]
        },
        {
            number: 5,
            title: "Governance & Compliance Layer",
            description: "Embedded trust and transparency.",
            modules: [
                { name: "Continuous policy enforcement", desc: "through the Governance & Compliance Hub." },
                { name: "Automated auditing", desc: "of all connected APIs." },
                { name: "Full adherence to GDPR, HIPAA, PIPEDA, and ISO/IEC 27701", desc: "standards." },
                { name: "Human oversight enabled", desc: "for every AI-driven decision." }
            ]
        },
        {
            number: 6,
            title: "Performance & Infrastructure Layer",
            description: "Every connected API and module runs through EVOLVE’s transparent audit and monitoring framework.",
            modules: [
                { name: "Google Cloud Functions", desc: "Secure orchestration of real-time processes." },
                { name: "Google Translate API", desc: "Full dynamic multilingual translation across the entire interface." },
                { name: "API Status Dashboard", desc: "Live uptime, frequency, and compliance indicators for every service." }
            ]
        },
        {
            number: 7,
            title: "Business Intelligence & Planning Layer",
            description: "",
            modules: [
                { name: "Business Plan Generator", desc: "Generates complete structured plans using Gemini reasoning." },
                { name: "Pitch Deck Generator", desc: "Auto-builds investor-ready decks from business data." },
                { name: "Financial Visualizer", desc: "Branded graphs and trend analytics from Google Sheets or CSV imports." },
                { name: "Research & Refinement Suite", desc: "Uses Google Search API to refine and summarize verified information." }
            ]
        }
    ];

    const LayerCard: React.FC<typeof layers[0]> = ({ number, title, description, modules }) => (
        <div className="bg-surface-card/50 p-6 rounded-2xl border border-border-subtle backdrop-blur-sm animate-fade-in">
            <h3 className="text-2xl font-bold mb-3">
                <span className="heading-gradient">{number}. {title}</span>
            </h3>
            {description && <p className="text-text-secondary mb-4">{description}</p>}
            <ul className="space-y-3">
                {modules.map(module => (
                    <li key={module.name} className="flex items-start gap-3">
                        <div className="mt-1.5 w-2 h-2 rounded-full bg-brand-cyan flex-shrink-0"></div>
                        <div>
                            <strong className="text-text-primary">{module.name}</strong>
                            <span className="text-text-secondary text-sm"> – {module.desc}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <section className="py-32">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <PageTitle>The EVOLVE Ecosystem</PageTitle>
                <PageContent>
                    <p className="max-w-3xl mx-auto">
                        EVOLVE is the first executive ecosystem fully powered by Google-native AI and Workspace APIs. It merges Gemini reasoning, Workspace productivity, and Governance oversight into one seamless environment that connects people, data, and tools with unmatched speed, compliance, and intelligence.
                    </p>
                </PageContent>
                <div className="mt-16 text-left max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12 heading-gradient">Core Architectural Layers</h2>
                    <div className="space-y-8">
                        {layers.map(layer => <LayerCard key={layer.number} {...layer} />)}
                    </div>
                </div>
            </div>
        </section>
    );
};

const MarketplaceLandingPage: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
    const { t } = useTranslation();
    return (
    <section className="relative overflow-hidden bg-surface-bg text-text-primary py-24 min-h-screen flex items-center justify-center font-sans">
       {/* Background glow effects */}
       <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-brand-violet/20 rounded-full filter blur-3xl opacity-50 dark:opacity-50 opacity-30"></div>
       <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full filter blur-3xl opacity-50 dark:opacity-50 opacity-30"></div>
       
       <div className="relative z-10 max-w-4xl mx-auto px-4 text-center animate-slide-in-up">
           <h1 className="text-4xl md:text-5xl font-extrabold heading-gradient mb-8 font-display" data-i18n="menu_marketplace">
               {t('menu_marketplace')}
           </h1>
           
           <div className="space-y-6 text-lg text-text-secondary max-w-3xl mx-auto text-left md:text-center">
               <p>
                   The EVOLVE Marketplace is a secure, AI-powered business environment where executives, founders, and innovators connect to exchange verified opportunities, partnerships, and investments. It operates at the core of the EVOLVE ecosystem, powered by Gemini 2.5 Pro and Google Workspace integrations to provide intelligent discovery, real-time compliance, and multilingual connectivity across every transaction.
               </p>
               <p>
                   Through the Marketplace, users can discover, evaluate, and engage in opportunities across investments, partnerships, intellectual property, real estate, logistics, and executive hiring. Each listing and interaction is authenticated through the Governance and Compliance Hub, ensuring transparent, ethical, and traceable collaboration worldwide.
               </p>
               <p>
                   Gemini 2.5 Pro drives contextual recommendations and verified matching between listings, while Workspace APIs streamline document collaboration, meetings, and secure file exchange. Imagen and Veo 3 provide AI-generated visuals and media support to elevate professional presentations and digital assets for every listing.
               </p>
               <p className="font-semibold text-text-primary pt-4">
                   With its governance-first architecture, EVOLVE transforms traditional deal-making into an intelligent, compliance-verified experience designed for modern leadership.
               </p>
           </div>

           <div className="mt-12">
               <button 
                   onClick={onEnter}
                   className="inline-block px-10 py-4 text-lg font-semibold text-text-inverted bg-gradient-to-r from-brand-violet to-brand-cyan rounded-lg shadow-lg shadow-cyan-500/30 hover:shadow-xl hover:shadow-cyan-500/50 transition-all transform hover:-translate-y-1"
                   data-i18n="cta_enter_marketplace"
               >
                   {t('cta_enter_marketplace')}
               </button>
           </div>
       </div>
   </section>
)};

const PricingPage: React.FC<{ onSelectPlan: (tier: PricingTier) => void }> = ({ onSelectPlan }) => (
    <Pricing onSelectPlan={onSelectPlan} />
);

const LanguagesPage: React.FC = () => {
    const { t } = useTranslation();
    return (
     <SectionWrapper>
        <PageTitle data-i18n="menu_languages">{t('menu_languages')}</PageTitle>
        <PageContent>
            <p className="max-w-xl mx-auto">Choose your language. EVOLVE adapts instantly across every page, module, and message. Your selection is saved to your profile.</p>
            <div className="mt-8 max-w-sm mx-auto">
                <LanguageSelector />
            </div>
        </PageContent>
    </SectionWrapper>
)};

const ContactPage: React.FC = () => {
    const { t } = useTranslation();
    return (
     <SectionWrapper>
        <PageTitle data-i18n="menu_contact">{t('menu_contact')}</PageTitle>
        <PageContent>
            <p>For inquiries, partnerships, or support, please reach out to our team. We are available 24/7 to assist our global members. Email us at <a href="mailto:support@evolve.net" className="text-link hover:underline">support@evolve.net</a>.</p>
        </PageContent>
    </SectionWrapper>
)};


// --- Navigation Components ---

const PinnedDropdownMenu: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const menuItems = [
        { name: t('menu_home'), view: 'home', key: 'menu_home' },
        { name: t('menu_overview'), view: 'overview', key: 'menu_overview' },
        { name: t('menu_ecosystem'), view: 'ecosystem', key: 'menu_ecosystem' },
        { name: t('development'), view: 'development', key: 'development' },
        { name: t('menu_marketplace'), view: 'marketplace', key: 'menu_marketplace' },
        { name: t('menu_pricing'), view: 'pricing', key: 'menu_pricing' },
        { name: t('menu_languages'), view: 'languages', key: 'menu_languages' },
        { name: t('faq_title'), view: 'faq', key: 'faq_title' },
        { name: t('menu_governance'), view: 'governance', key: 'menu_governance' },
        { name: t('menu_contact'), view: 'contact', key: 'menu_contact' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigate = (view: string) => {
        onNavigate(view);
        setIsOpen(false);
    };

    return (
        <div ref={menuRef} className="fixed top-6 left-6 z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-modal/50 backdrop-blur-md border border-border-subtle text-text-primary font-semibold rounded-full shadow-lg hover:bg-surface-elevated transition-colors"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
                <span className="hidden sm:inline">Menu</span>
            </button>

            {isOpen && (
                <nav className="absolute top-full mt-2 w-64 bg-surface-modal border border-border-subtle rounded-lg shadow-2xl animate-dropdown-enter origin-top-left">
                    <ul className="p-2" role="menu">
                        {menuItems.map(item => (
                            <li key={item.key} role="none">
                                <button
                                    onClick={() => handleNavigate(item.view)}
                                    className="block w-full text-left px-4 py-2 text-text-primary hover:bg-surface-elevated rounded-md transition-colors"
                                    role="menuitem"
                                    data-i18n={item.key}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </div>
    );
};


const Footer: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => (
    <footer className="py-12 border-t border-border-subtle bg-surface-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-text-secondary">
             <div className="flex justify-center items-center gap-4">
                <button onClick={() => onNavigate('terms')} className="text-sm hover:text-text-primary transition-colors">Terms of Use</button>
                <span className="text-text-muted">|</span>
                <button onClick={() => onNavigate('privacy')} className="text-sm hover:text-text-primary transition-colors">Privacy Policy</button>
                <span className="text-text-muted">|</span>
                <button onClick={() => onNavigate('governance')} className="text-sm hover:text-text-primary transition-colors">Governance & Compliance Hub</button>
                <span className="text-text-muted">|</span>
                <button onClick={() => onNavigate('contact')} className="text-sm hover:text-text-primary transition-colors">Contact</button>
            </div>
            <p className="mt-6 text-xs text-text-muted">&copy; {new Date().getFullYear()} EVOLVE. All rights reserved.</p>
        </div>
    </footer>
);


interface LandingPageProps {
  onSelectPlan: (tier: PricingTier) => void;
  isBiometricEnrolled: boolean;
  onBiometricLogin: () => void;
  onNavigate: (view: AppView) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectPlan, onNavigate }) => {
    const [view, setView] = useState('home');
    const [isChatBotOpen, setIsChatBotOpen] = useState(false);

    const renderView = () => {
        switch (view) {
            case 'overview': return <OverviewPage />;
            case 'ecosystem': return <EcosystemPage />;
            case 'development': return <DevelopmentPage />;
            case 'marketplace': return <MarketplaceLandingPage onEnter={() => onSelectPlan('Pro')} />;
            case 'pricing': return <PricingPage onSelectPlan={onSelectPlan} />;
            case 'languages': return <LanguagesPage />;
            case 'faq': return <FAQPage onOpenChat={() => setIsChatBotOpen(true)} />;
            case 'governance': return <GovernancePolicyPage />;
            case 'contact': return <ContactPage />;
            case 'terms': return <TermsOfUsePage />;
            case 'privacy': return <PrivacyPolicyPage />;
            case 'home':
            default:
                return <HomePage />;
        }
    };
  
    return (
        <div className="bg-surface-bg text-text-primary">
            <PinnedDropdownMenu onNavigate={setView} />
            <LandingPageChatBot isOpen={isChatBotOpen} onClose={() => setIsChatBotOpen(false)} />
            <main>
                {renderView()}
            </main>
            <Footer onNavigate={setView} />
        </div>
    );
};