import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link as LinkIcon, Power, Loader, X, ShieldCheck, KeyRound, CheckCircle, AlertTriangle, CloudCog, Image as ImageIcon, Video, Clapperboard, FlaskConical, FilePenLine, Mic } from 'lucide-react';
import { GoogleSheetsIcon, GoogleSlidesIcon, GoogleDocsIcon, GoogleDriveIcon, GoogleTranslateIcon, GoogleSearchIcon, GoogleGeminiIcon, GoogleMeetIcon, GoogleCalendarIcon, GoogleChatIcon, GoogleMapsIcon } from '../GoogleAppIcons';
import { BarChart2 } from 'lucide-react';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { Tooltip } from '../common/Tooltip';


// --- TYPES ---
type ConnectorStatus = 'connected' | 'pending' | 'disconnected';

interface Integration {
    id: string;
    name: string;
    status: ConnectorStatus;
    description: string;
    icon: React.ReactNode;
    category: string;
    manageRoute?: string;
    manageModalId?: string;
    oauthProvider?: string;
    scopes?: string[];
    specialAction?: 'selectApiKey';
}

// --- NEW COMPONENTS ---

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const colors = type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-red-500/20 text-red-300 border-red-500/30';

    return (
        <div className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-lg border flex items-center gap-3 animate-fade-in ${colors}`}>
            {type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
            <span className="text-sm font-semibold">{message}</span>
            <button onClick={onDismiss} className="ml-4"><X size={16} /></button>
        </div>
    );
};

const IntegrationManagementModal: React.FC<{
    integration: Integration;
    onClose: () => void;
    onDisconnect: (integrationId: string) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ integration, onClose, onDisconnect, showToast }) => {
    const [isClosing, setIsClosing] = useState(false);
    const [isConfirmDisconnectOpen, setIsConfirmDisconnectOpen] = useState(false);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(onClose, 300);
    };

    const handleRotateKey = () => {
        console.log(`Analytics: integrate_manage_action, id: ${integration.id}, action: rotate_key`);
        showToast('API Key rotated and copied to clipboard!', 'success');
    };

    const handleTestCall = async () => {
        console.log(`Analytics: integrate_test, id: ${integration.id}`);
        showToast('Pinging service...', 'success');
        await new Promise(resolve => setTimeout(resolve, 1500));
        showToast('Test call successful. Connection is healthy.', 'success');
    };

    return (
        <>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={triggerClose}>
                <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`} onClick={e => e.stopPropagation()}>
                    <header className="p-4 border-b border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center">{integration.icon}</div>
                            <h2 className="text-lg font-bold text-white">Manage {integration.name}</h2>
                        </div>
                        <button onClick={triggerClose} className="text-slate-400 hover:text-white p-1 rounded-full"><X /></button>
                    </header>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">Status:</span>
                            <span className="font-semibold text-green-400">Connected</span>
                            <span className="text-slate-500">(Last checked: {new Date().toLocaleTimeString()})</span>
                        </div>
                        <div className="space-y-2">
                            <button onClick={handleRotateKey} className="w-full flex items-center gap-3 p-3 text-left bg-slate-800 hover:bg-slate-700 rounded-lg text-white">
                                <KeyRound className="text-cyan-400" size={20} />
                                <span>Rotate API Key</span>
                            </button>
                            <button onClick={handleTestCall} className="w-full flex items-center gap-3 p-3 text-left bg-slate-800 hover:bg-slate-700 rounded-lg text-white">
                                <CloudCog className="text-cyan-400" size={20} />
                                <span>Test Call</span>
                            </button>
                        </div>
                        <div className="pt-4 border-t border-slate-800">
                             <button onClick={() => setIsConfirmDisconnectOpen(true)} className="w-full p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold rounded-lg">
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <ConfirmationModal
                isOpen={isConfirmDisconnectOpen}
                onClose={() => setIsConfirmDisconnectOpen(false)}
                onConfirm={() => {
                    onDisconnect(integration.id);
                    setIsConfirmDisconnectOpen(false);
                    triggerClose();
                }}
                title="Disconnect Integration"
                message={`Are you sure you want to disconnect ${integration.name}? This may impact workflows that rely on this service.`}
                confirmText="Disconnect"
            />
        </>
    );
};

// --- DATA ---
const initialConnectors: Integration[] = [
  // Google Workspace
  { id: 'docs', name: 'Google Docs API', description: 'Generates structured business plans and written reports.', icon: <GoogleDocsIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'connected', manageModalId: 'docs-management' },
  { id: 'slides', name: 'Google Slides API', description: 'Creates professional presentations and pitch decks.', icon: <GoogleSlidesIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'connected', manageModalId: 'slides-management' },
  { id: 'sheets', name: 'Google Sheets API', description: 'Handles data processing and validation.', icon: <GoogleSheetsIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'disconnected', oauthProvider: 'google', scopes: ['spreadsheets.readonly'] },
  { id: 'drive', name: 'Google Drive API', description: 'Stores and organizes all user-generated content.', icon: <GoogleDriveIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'pending', oauthProvider: 'google' },
  { id: 'meet', name: 'Google Meet API', description: 'Enables instant video meetings with AI transcription.', icon: <GoogleMeetIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'connected', manageModalId: 'meet-management' },
  { id: 'chat', name: 'Google Chat API', description: 'Embeds AI-moderated team communication.', icon: <GoogleChatIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'pending', oauthProvider: 'google' },
  { id: 'calendar', name: 'Google Calendar API', description: 'Schedules and optimizes tasks.', icon: <GoogleCalendarIcon className="h-10 w-10" />, category: 'Google Workspace', status: 'disconnected', oauthProvider: 'google' },
  { id: 'vids', name: 'Google Vids API', description: 'Create and collaborate on video stories for work.', icon: <Clapperboard className="h-10 w-10 text-blue-400" />, category: 'Google Workspace', status: 'disconnected', oauthProvider: 'google' },
  
  // Gemini & AI
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro API', description: 'For complex reasoning, coding, "thinking mode", and video understanding tasks.', icon: <GoogleGeminiIcon className="h-10 w-10" />, category: 'Gemini & AI', status: 'connected', manageModalId: 'gemini-pro-management' },
  { id: 'gemini-flash', name: 'Gemini 2.5 Flash API', description: 'For fast, multimodal tasks including image/audio understanding and transcription.', icon: <GoogleGeminiIcon className="h-10 w-10" />, category: 'Gemini & AI', status: 'connected', manageModalId: 'gemini-flash-management' },
  { id: 'gemini-flash-lite', name: 'Gemini Flash Lite API', description: 'Powers lowest-latency, real-time text generation and chat applications.', icon: <GoogleGeminiIcon className="h-10 w-10" />, category: 'Gemini & AI', status: 'connected', manageModalId: 'gemini-flash-lite-management' },
  { id: 'gemini-flash-image', name: 'Gemini Flash Image API', description: 'Generate and edit images with natural language for creative and branding tasks.', icon: <ImageIcon className="h-10 w-10 text-indigo-400" />, category: 'Gemini & AI', status: 'connected', manageModalId: 'gemini-flash-image-management' },
  { id: 'live-api', name: 'Live Conversation API', description: 'Enables real-time, low-latency voice conversations with native audio.', icon: <Mic className="h-10 w-10 text-blue-400" />, category: 'Gemini & AI', status: 'disconnected', oauthProvider: 'google' },
  
  // Creative & Media
  { id: 'imagen', name: 'Imagen 4 API', description: 'Generate high-fidelity, photorealistic images from text.', icon: <ImageIcon className="h-10 w-10 text-purple-400" />, category: 'Creative & Media', status: 'connected', manageModalId: 'imagen-management' },
  { id: 'veo', name: 'VEO 3.1 API', description: 'Create cinematic, high-definition videos from prompts.', icon: <Video className="h-10 w-10 text-red-400" />, category: 'Creative & Media', status: 'disconnected', specialAction: 'selectApiKey' },
  { id: 'tts', name: 'Text-to-Speech API', description: 'Transforms text input into natural-sounding speech for audio outputs.', icon: <GoogleGeminiIcon className="h-10 w-10" />, category: 'Creative & Media', status: 'connected', manageModalId: 'tts-management' },

  // Data and Visualization
  { id: 'charts', name: 'Google Charts API', description: 'Renders accurate, high-quality data visualizations.', icon: <BarChart2 className="h-10 w-10 text-blue-400" />, category: 'Data and Visualization', status: 'connected', manageModalId: 'charts-management' },
  { id: 'looker', name: 'Looker Studio API', description: 'Creates advanced dashboards and visual analytics.', icon: <BarChart2 className="h-10 w-10 text-green-400" />, category: 'Data and Visualization', status: 'pending', oauthProvider: 'google' },
  { id: 'search-grounding', name: 'Google Search Grounding', description: 'Accesses up-to-date information from the web for timely and relevant responses.', icon: <GoogleSearchIcon className="h-10 w-10" />, category: 'Data and Visualization', status: 'connected', manageModalId: 'search-grounding-management' },
  { id: 'maps-grounding', name: 'Google Maps Grounding', description: 'Provides location-based context and place information for geographical queries.', icon: <GoogleMapsIcon className="h-10 w-10" />, category: 'Data and Visualization', status: 'connected', manageModalId: 'maps-grounding-management' },
  
  // Core Infrastructure
  { id: 'functions', name: 'Google Cloud Functions', description: 'Executes background automation and data validation tasks.', icon: <BarChart2 className="h-10 w-10 text-yellow-400" />, category: 'Core Infrastructure', status: 'connected', manageModalId: 'functions-management' },
  { id: 'translate', name: 'Google Translate API', description: 'Enables multilingual support for all pages.', icon: <GoogleTranslateIcon className="h-10 w-10" />, category: 'Core Infrastructure', status: 'connected', manageModalId: 'translate-management' },
];

const CONNECTORS_STORAGE_KEY = 'evolve-connectors-status';


// --- UPDATED CARD & PAGE COMPONENTS ---

const StatusPill: React.FC<{ status: ConnectorStatus }> = ({ status }) => {
    const config = {
        connected: { color: 'bg-green-500/10 text-green-300 border-green-500/20', label: 'Connected' },
        pending: { color: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20', label: 'Pending' },
        disconnected: { color: 'bg-red-500/10 text-red-300 border-red-500/20', label: 'Disconnected' },
    };
    const currentConfig = config[status];
    return (
        <div className={`px-2.5 py-1 text-xs font-semibold rounded-full flex items-center justify-center gap-1.5 ${currentConfig.color} border`}>
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-400' : status === 'pending' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
            <span>{currentConfig.label}</span>
        </div>
    );
};

const ConnectorCard: React.FC<{ 
    connector: Integration;
    onOpenModal: (integration: Integration) => void;
    onUpdateStatus: (id: string, status: ConnectorStatus) => void;
    showToast: (message: string, type?: 'success' | 'error') => void;
}> = ({ connector, onOpenModal, onUpdateStatus, showToast }) => {
    const [isLoading, setIsLoading] = useState(false);

    const getButtonLabel = (status: ConnectorStatus) => {
        switch (status) {
            case 'connected': return 'Manage';
            case 'pending': return 'Resume Setup';
            case 'disconnected': return 'Connect';
        }
    };

    const handleManageClick = async () => {
        console.log(`Analytics: integrate_click, id: ${connector.id}`);
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate initial action delay

        try {
            if (connector.specialAction === 'selectApiKey') {
                console.log(`Analytics: special_action, id: ${connector.id}, action: selectApiKey`);
                showToast('Opening API key selection...', 'success');
                await (window as any).aistudio.openSelectKey();
                const hasKey = await (window as any).aistudio.hasSelectedApiKey();
                if (hasKey) {
                    onUpdateStatus(connector.id, 'connected');
                    showToast('API Key configured for VEO.', 'success');
                } else {
                    showToast('API Key selection was cancelled.', 'error');
                }
            } else if (connector.status === 'connected') {
                 if (connector.manageModalId) {
                    console.log(`Analytics: integrate_manage_open, id: ${connector.id}`);
                    onOpenModal(connector);
                } else {
                    showToast('Management interface for this service is handled externally.', 'success');
                }
            } else { // disconnected or pending
                 if (connector.oauthProvider) {
                    console.log(`Analytics: integrate_connect, id: ${connector.id}`);
                    showToast(`Starting connection with ${connector.oauthProvider}...`, 'success');
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    onUpdateStatus(connector.id, 'connected');
                    showToast(`${connector.name} connected successfully!`, 'success');
                } else {
                    showToast('This integration requires manual setup.', 'error');
                }
            }
        } catch {
            showToast("Couldn't open management. Try again.", 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface-card/70 backdrop-blur-sm rounded-2xl shadow-soft border border-border-subtle p-6">
            <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-surface-elevated rounded-lg">
                    {connector.icon}
                </div>
                <div className="flex-grow">
                    <h3 className="font-display text-xl font-bold text-text-primary">{connector.name}</h3>
                    <p className="mt-1 text-sm text-text-secondary font-sans leading-relaxed">{connector.description}</p>
                </div>
                <div className="w-full sm:w-auto flex-shrink-0 flex flex-col items-stretch sm:items-end gap-3 mt-4 sm:mt-0">
                    <StatusPill status={connector.status} />
                     <button
                        onClick={handleManageClick}
                        disabled={isLoading}
                        role="button"
                        aria-label={`Manage ${connector.name}`}
                        className="relative min-h-[44px] px-6 py-3 text-sm font-semibold whitespace-nowrap bg-gradient-to-r from-heading-start to-heading-end text-text-inverted rounded-lg shadow-md hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? <Loader className="animate-spin" size={20}/> : getButtonLabel(connector.status)}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ConnectorsPage: React.FC = () => {
    const [connectors, setConnectors] = useState<Integration[]>(() => {
        try {
            const savedConnectorsJSON = localStorage.getItem(CONNECTORS_STORAGE_KEY);
            if (savedConnectorsJSON) {
                const savedStatuses = JSON.parse(savedConnectorsJSON) as { id: string, status: ConnectorStatus }[];
                const statusMap = new Map(savedStatuses.map(s => [s.id, s.status]));
                
                // Merge saved statuses into the initial data structure
                return initialConnectors.map(connector => ({
                    ...connector,
                    status: statusMap.get(connector.id) || connector.status,
                }));
            }
        } catch (error) {
            console.error("Failed to load connectors from localStorage", error);
        }
        return initialConnectors;
    });
    
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error', id: number } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

    useEffect(() => {
        try {
            const connectorsToSave = connectors.map(({ id, status }) => ({ id, status }));
            localStorage.setItem(CONNECTORS_STORAGE_KEY, JSON.stringify(connectorsToSave));
        } catch (error) {
            console.error("Failed to save connectors to localStorage", error);
        }
    }, [connectors]);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type, id: Date.now() });
    };

    const handleOpenModal = (integration: Integration) => {
        setSelectedIntegration(integration);
        setIsModalOpen(true);
    };

    const handleUpdateStatus = (id: string, status: ConnectorStatus) => {
        setConnectors(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    };

    const handleDisconnect = (id: string) => {
        handleUpdateStatus(id, 'disconnected');
        showToast('Integration disconnected successfully.', 'success');
    };
    
    const groupedConnectors = useMemo(() => {
        return connectors.reduce((acc, connector) => {
            (acc[connector.category] = acc[connector.category] || []).push(connector);
            return acc;
        }, {} as Record<string, Integration[]>);
    }, [connectors]);

    const sectionOrder = ['Gemini & AI', 'Creative & Media', 'Google Workspace', 'Data and Visualization', 'Core Infrastructure'];

    return (
        <>
            {toast && <Toast key={toast.id} message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            {isModalOpen && selectedIntegration && (
                <IntegrationManagementModal
                    integration={selectedIntegration}
                    onClose={() => setIsModalOpen(false)}
                    onDisconnect={handleDisconnect}
                    showToast={showToast}
                />
            )}
            <main className="container mx-auto max-w-7xl p-4 md:p-6 space-y-12 font-sans pb-24">
                <div className="text-center font-display">
                    <LinkIcon className="h-12 w-12 text-cyan-400 mx-auto mb-2" />
                    <h1 className="text-3xl font-bold text-text-primary heading-gradient">API Integrations Center</h1>
                    <p className="text-text-secondary max-w-3xl mx-auto mt-2 font-sans">
                        The API Integrations Center provides real-time visibility into all connected services within EVOLVE. Each integration is authenticated through Google Cloud and monitored for performance, compliance, and security by the EVOLVE Data Governance and Compliance Engine.
                    </p>
                </div>

                <div className="space-y-12">
                    {sectionOrder.map(category => (
                        groupedConnectors[category] && (
                            <section key={category}>
                                <h2 className="text-2xl font-bold mb-6 heading-gradient font-display">{category}</h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {groupedConnectors[category]?.map(connector => (
                                        <ConnectorCard 
                                            key={connector.id} 
                                            connector={connector}
                                            onOpenModal={handleOpenModal}
                                            onUpdateStatus={handleUpdateStatus}
                                            showToast={showToast}
                                        />
                                    ))}
                                </div>
                            </section>
                        )
                    ))}
                </div>
                
                <footer className="text-center text-xs text-text-muted font-sans mt-8">
                    EVOLVE API Integrations — Verified, Secure, and Compliant.
                </footer>
            </main>
        </>
    );
};