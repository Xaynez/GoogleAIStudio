import React, { useState, useEffect, useCallback } from 'react';
import { X, Briefcase, FileSignature, AreaChart, BarChart2, ArrowLeft, Loader, UploadCloud, Save, File as FileIcon, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import type { UserProfile, BusinessSuiteTool, BusinessPlanData, BusinessPlanOutput, PitchDeckOutput, FinancialVisualsOutput, ValidationIssue, FinancialAnalysisInsights } from '../../types';
import { useTranslation } from '../../i18n';
import { generateBusinessPlanWithGemini, generatePitchDeckWithGemini, generateFinancialVisualsWithGemini, validateAndAnalyzeFinancialsWithGemini } from '../../services/geminiService';

interface BusinessSuiteModalProps {
    isOpen: boolean;
    onClose: () => void;
    userProfile: UserProfile;
}

const initialFormData: BusinessPlanData = {
    companyName: '',
    industry: '',
    mission: '',
    vision: '',
    productDetails: '',
    financialsFile: undefined,
};

export const BusinessSuiteModal: React.FC<BusinessSuiteModalProps> = ({ isOpen, onClose, userProfile }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [view, setView] = useState<'dashboard' | 'generator'>('dashboard');
    const [activeTool, setActiveTool] = useState<BusinessSuiteTool | null>(null);
    const [generatorStep, setGeneratorStep] = useState<'input' | 'generating' | 'preview'>('input');
    const [formData, setFormData] = useState<BusinessPlanData>(initialFormData);
    const [generationResult, setGenerationResult] = useState<any | null>(null);
    const [generationStatus, setGenerationStatus] = useState('');
    
    // State specific to Financial Visualizer
    const [visualizerStep, setVisualizerStep] = useState<'upload' | 'validating' | 'review'>('upload');
    const [financialFile, setFinancialFile] = useState<File | null>(null);
    const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);
    const [financialInsights, setFinancialInsights] = useState<FinancialAnalysisInsights | null>(null);


    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            // Reset state for next time
            setTimeout(() => {
                setView('dashboard');
                setActiveTool(null);
                setGeneratorStep('input');
                setFormData(initialFormData);
                setGenerationResult(null);
                setVisualizerStep('upload');
                setFinancialFile(null);
            }, 300);
        }, 300);
    };

    const handleLaunchTool = (tool: BusinessSuiteTool) => {
        setActiveTool(tool);
        setView('generator');
        setGeneratorStep('input');
        setGenerationResult(null);
        setFormData(initialFormData);
        if (tool === 'visuals') {
            setVisualizerStep('upload');
            setFinancialFile(null);
        }
    };

    const handleBackToDashboard = () => {
        setView('dashboard');
        setActiveTool(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            if (activeTool === 'visuals') {
                setFinancialFile(e.target.files[0]);
            } else {
                setFormData(prev => ({ ...prev, financialsFile: e.target.files![0] }));
            }
        }
    };
    
    const handleGenerate = async () => {
        if (!activeTool) return;
        setGeneratorStep('generating');
        setGenerationStatus(t('generationStatusAnalyzing'));

        try {
            if (activeTool === 'plan') {
                setGenerationStatus(t('generationStatusDrafting'));
                const result = await generateBusinessPlanWithGemini(formData);
                setGenerationResult(result);
            } else if (activeTool === 'deck') {
                setGenerationStatus(t('generationStatusDesigning'));
                const result = await generatePitchDeckWithGemini(formData);
                setGenerationResult(result);
            }
            setGenerationStatus(t('generationStatusFinalizing'));
            await new Promise(resolve => setTimeout(resolve, 500));
            setGeneratorStep('preview');
        } catch (error) {
            console.error("Generation failed", error);
            setGeneratorStep('input');
        }
    };
    
    const handleValidateFinancials = async () => {
        if (!financialFile) return;
        setVisualizerStep('validating');
        try {
            const { issues, insights } = await validateAndAnalyzeFinancialsWithGemini(financialFile);
            setValidationIssues(issues);
            setFinancialInsights(insights);

            // Also generate charts in parallel
            const visuals = await generateFinancialVisualsWithGemini(financialFile);
            setGenerationResult(visuals);

            setVisualizerStep('review');
        } catch(error) {
            console.error("Validation failed", error);
            setVisualizerStep('upload');
        }
    };

    if (!isOpen) return null;

    const renderDashboard = () => (
        <div className="p-8 overflow-y-auto h-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    {t('businessSuiteTitle')}
                </h2>
                <p className="text-slate-400 mt-2 max-w-xl mx-auto" style={{fontFamily: 'Open Sans, sans-serif'}}>{t('businessSuiteDescription')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ToolCard icon={<FileSignature size={28}/>} title={t('businessPlanGenerator')} description={t('businessPlanGeneratorDesc')} buttonText={t('createPlan')} onClick={() => handleLaunchTool('plan')} />
                <ToolCard icon={<AreaChart size={28}/>} title={t('pitchDeckGenerator')} description={t('pitchDeckGeneratorDesc')} buttonText={t('createDeck')} onClick={() => handleLaunchTool('deck')} />
                <ToolCard icon={<BarChart2 size={28}/>} title={t('financialVisualizer')} description={t('financialVisualizerDesc')} buttonText={t('createVisuals')} onClick={() => handleLaunchTool('visuals')} />
            </div>
        </div>
    );

    const renderGenerator = () => {
        const toolTitles = {
            plan: t('businessPlanGenerator'),
            deck: t('pitchDeckGenerator'),
            visuals: t('financialVisualizer'),
        };

        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b border-slate-800 flex-shrink-0">
                    <button onClick={handleBackToDashboard} className="flex items-center gap-2 text-sm text-cyan-400 hover:underline">
                        <ArrowLeft size={16} /> {t('backToSuite')}
                    </button>
                    <h3 className="text-xl font-bold text-white text-center -mt-6" style={{fontFamily: 'Montserrat, sans-serif'}}>{toolTitles[activeTool!]}</h3>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {activeTool === 'visuals' ? (
                        <FinancialVisualizerView
                            step={visualizerStep}
                            onValidate={handleValidateFinancials}
                            file={financialFile}
                            onFileChange={setFinancialFile}
                            issues={validationIssues}
                            insights={financialInsights}
                            visuals={generationResult}
                        />
                    ) : (
                        <>
                           {generatorStep === 'input' && <GeneratorInputForm tool={activeTool!} formData={formData} onFormChange={handleFormChange} onFileChange={handleFileChange} />}
                           {generatorStep === 'generating' && <GeneratorLoadingView status={generationStatus} />}
                           {generatorStep === 'preview' && <GeneratorPreviewView tool={activeTool!} result={generationResult} />}
                        </>
                    )}
                </div>

                {(generatorStep === 'input' && activeTool !== 'visuals') && (
                    <div className="p-4 border-t border-slate-800 flex-shrink-0 flex justify-end">
                        <button onClick={handleGenerate} className="px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow flex items-center gap-2 group">
                            {t('generate')}
                            <span className="transform transition-transform group-hover:translate-x-1">→</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog">
            <div className={`bg-black border border-slate-700 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out relative overflow-hidden ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                {/* Glow Effect */}
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-cyan-500/20 rounded-full filter blur-3xl opacity-50"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-violet-500/20 rounded-full filter blur-3xl opacity-50"></div>
                
                <div className="relative z-10 flex flex-col h-full bg-slate-900/80 rounded-2xl">
                    <button onClick={triggerClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors rounded-full p-1 z-20">
                        <X className="h-6 w-6" />
                    </button>
                    {view === 'dashboard' ? renderDashboard() : renderGenerator()}
                </div>
            </div>
        </div>
    );
};

const ToolCard: React.FC<{ icon: React.ReactNode, title: string, description: string, buttonText: string, onClick: () => void }> = ({ icon, title, description, buttonText, onClick }) => (
    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col text-center items-center transition-all duration-300 hover:border-cyan-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10">
        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-cyan-400 mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-white" style={{fontFamily: 'Montserrat, sans-serif'}}>{title}</h3>
        <p className="text-sm text-slate-400 flex-grow mt-2" style={{fontFamily: 'Open Sans, sans-serif'}}>{description}</p>
        <button onClick={onClick} className="mt-6 w-full px-4 py-2 bg-slate-700 text-cyan-300 font-semibold rounded-lg hover:bg-gradient-to-r from-violet-500 to-cyan-500 hover:text-white transition-all">
            {buttonText}
        </button>
    </div>
);

const GeneratorInputForm: React.FC<{ tool: BusinessSuiteTool, formData: BusinessPlanData, onFormChange: any, onFileChange: any }> = ({ tool, formData, onFormChange, onFileChange }) => {
    const { t } = useTranslation();
    
    return (
        <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
            <InputField id="companyName" label={t('companyName')} value={formData.companyName} onChange={onFormChange} placeholder="e.g., Quantum Dynamics Inc." />
            <InputField id="industry" label={t('industry')} value={formData.industry} onChange={onFormChange} placeholder="e.g., Artificial Intelligence" />
            <TextAreaField id="mission" label={t('missionStatement')} value={formData.mission} onChange={onFormChange} rows={2} />
            <TextAreaField id="vision" label={t('visionStatement')} value={formData.vision} onChange={onFormChange} rows={2} />
            <TextAreaField id="productDetails" label={t('productServiceDetails')} value={formData.productDetails} onChange={onFormChange} rows={4} />
            
            {(tool === 'plan') && (
                 <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('optionalFinancials')}</label>
                     <div className="flex items-center justify-center w-full">
                        <label htmlFor="financialsFile" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <UploadCloud className="w-8 h-8 mb-2 text-slate-400" />
                                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            </div>
                            <input id="financialsFile" type="file" className="hidden" onChange={onFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                        </label>
                    </div>
                    {formData.financialsFile && <p className="text-sm text-green-400 mt-2 text-center">File selected: {formData.financialsFile.name}</p>}
                </div>
            )}
        </div>
    );
}

const InputField: React.FC<{ id: string, label: string, value: string, onChange: any, placeholder?: string }> = ({ id, label, value, onChange, placeholder }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1" style={{fontFamily: 'Open Sans, sans-serif'}}>{label}</label>
        <input type="text" id={id} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none" />
    </div>
);

const TextAreaField: React.FC<{ id: string, label: string, value: string, onChange: any, rows: number }> = ({ id, label, value, onChange, rows }) => (
     <div>
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1" style={{fontFamily: 'Open Sans, sans-serif'}}>{label}</label>
        <textarea id={id} value={value} onChange={onChange} rows={rows} className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none resize-y" />
    </div>
);

const GeneratorLoadingView: React.FC<{status: string}> = ({ status }) => (
    <div className="flex flex-col items-center justify-center h-full text-center animate-fade-in">
        <Loader className="h-16 w-16 text-cyan-400 animate-spin" />
        <p className="text-xl font-bold text-white mt-4">{status}</p>
    </div>
);

const GeneratorPreviewView: React.FC<{ tool: BusinessSuiteTool, result: any }> = ({ tool, result }) => {
    const { t } = useTranslation();

    const renderPreview = () => {
        if (!result) return <p className="text-red-400">Generation failed.</p>;
        switch (tool) {
            case 'plan':
                const plan = result as BusinessPlanOutput;
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-cyan-400">{t('executiveSummary')}</h3>
                        <p className="text-slate-300 bg-slate-800/50 p-4 rounded-lg">{plan.executiveSummary}</p>
                        <h3 className="text-lg font-bold text-cyan-400">{t('generatedSections')}</h3>
                        <ul className="grid grid-cols-2 gap-2 text-sm">
                            {plan.sections.map(sec => <li key={sec} className="flex items-center gap-2 p-2 bg-slate-800/50 rounded-md"><CheckCircle size={14} className="text-green-400" /> {sec}</li>)}
                        </ul>
                    </div>
                );
            case 'deck':
                 const deck = result as PitchDeckOutput;
                return (
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold text-cyan-400">{t('previewSlides')}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {deck.slides.map((slide, i) => (
                                <div key={i} className="aspect-video bg-slate-700 rounded-md p-2 flex flex-col border border-slate-600">
                                    <p className="text-xs font-bold text-cyan-300">{slide.title}</p>
                                    <p className="text-[8px] text-slate-400 mt-1 line-clamp-3">{slide.content.replace(/•/g, '')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )
        }
    }

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            {renderPreview()}
            <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row justify-center gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors"><Save size={16} /> {t('saveToDrive')}</button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 text-slate-200 font-semibold rounded-lg hover:bg-slate-600 transition-colors"><FileIcon size={16} /> {t('exportAsPDF')}</button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30"><Calendar size={16} /> {t('schedulePresentation')}</button>
            </div>
        </div>
    );
};

const FinancialVisualizerView: React.FC<{
    step: 'upload' | 'validating' | 'review';
    onValidate: () => void;
    file: File | null;
    onFileChange: (file: File | null) => void;
    issues: ValidationIssue[];
    insights: FinancialAnalysisInsights | null;
    visuals: FinancialVisualsOutput | null;
}> = ({ step, onValidate, file, onFileChange, issues, insights, visuals }) => {
    const { t } = useTranslation();

    if (step === 'upload') {
        return (
            <div className="max-w-2xl mx-auto text-center animate-fade-in">
                <p className="text-slate-400 mb-6">{t('visualizerInstruction')}</p>
                <label htmlFor="financialsFile" className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-800/50 hover:bg-slate-700/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
                        <p className="mb-2 text-sm text-slate-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">CSV, XLSX, or link to Google Sheet</p>
                    </div>
                    <input id="financialsFile" type="file" className="hidden" onChange={(e) => onFileChange(e.target.files ? e.target.files[0] : null)} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                </label>
                {file && <p className="text-sm text-green-400 mt-4">File selected: {file.name}</p>}
                <button onClick={onValidate} disabled={!file} className="mt-6 px-6 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed">
                    {t('validate')}
                </button>
            </div>
        );
    }
    
    if (step === 'validating') {
        return <GeneratorLoadingView status={t('validating')} />;
    }

    if (step === 'review') {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full animate-fade-in">
                {/* Panel 1: Validation */}
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700 flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>{t('dataUploadValidation')}</h4>
                    <div className="flex-grow space-y-4 overflow-y-auto">
                        <div className="p-3 bg-slate-700/50 rounded-md text-sm font-semibold text-slate-200">{file?.name}</div>
                        <h5 className="font-semibold text-slate-300">{t('validationSummary')}</h5>
                        {issues.length === 0 ? (
                             <div className="p-3 bg-green-500/10 rounded-md text-sm text-green-300 flex items-center gap-2"><CheckCircle size={16}/>{t('validationPassed')}</div>
                        ) : (
                             <div className="space-y-2">
                                {issues.map((issue, i) => (
                                    <div key={i} className={`p-2 rounded-md text-xs border-l-4 ${issue.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-300' : 'bg-yellow-500/10 border-yellow-500 text-yellow-300'}`}>
                                        <p><strong>{issue.field} (Row {issue.row}):</strong> {issue.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                     <button className="mt-4 w-full px-4 py-2 bg-slate-700 text-cyan-300 font-semibold rounded-lg hover:bg-cyan-600 hover:text-white transition-colors">{t('approveCorrections')}</button>
                </div>

                {/* Panel 2: Model Review */}
                <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700 flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>{t('financialModelReview')}</h4>
                    <div className="flex-grow space-y-4 overflow-y-auto pr-2">
                        <h5 className="font-semibold text-slate-300">{t('narrativeInsights')}</h5>
                        {insights && (
                            <div className="text-sm text-slate-300 space-y-3">
                                <p><strong>Trends:</strong> {insights.trends.join(' ')}</p>
                                <p><strong>Risks:</strong> {insights.risks.join(' ')}</p>
                                <p><strong>Recommendations:</strong> {insights.recommendations.join(' ')}</p>
                            </div>
                        )}
                        <h5 className="font-semibold text-slate-300 pt-3 border-t border-slate-700">{t('supportingDocs')}</h5>
                        <p className="text-xs text-slate-500">{t('uploadSupportingDocs')}</p>
                    </div>
                </div>

                {/* Panel 3: Visual Analytics */}
                 <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700 flex flex-col">
                    <h4 className="text-lg font-bold text-white mb-3" style={{fontFamily: 'Montserrat, sans-serif'}}>{t('visualAnalytics')}</h4>
                    <div className="flex-grow space-y-3 overflow-y-auto pr-2">
                        {visuals?.charts.map((chart: any, i: number) => (
                            <div key={i} className="p-2 bg-slate-800/50 rounded-lg">
                                <p className="text-center font-semibold text-white text-xs">{chart.title}</p>
                                <div className="mt-1 h-24 flex items-center justify-center text-slate-500 text-xs">
                                   {/* Mock Chart */}
                                   <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
                                        <line x1="5" y1="55" x2="95" y2="55" stroke="#475569" strokeWidth="0.5"/>
                                        <line x1="5" y1="5" x2="5" y2="55" stroke="#475569" strokeWidth="0.5"/>
                                        {chart.type === 'bar' && chart.data.map((d: any, di: number) => (
                                            <rect key={di} x={10 + di*20} y={55 - d[1]/10} width="15" height={d[1]/10} fill="#00FFFF" />
                                        ))}
                                         {chart.type === 'line' && <polyline points={chart.data.map((d: any, di: number) => `${10 + di*20},${55-d[1]}`).join(' ')} fill="none" stroke="#8A2BE2" strokeWidth="1"/>}
                                         {chart.type === 'pie' && <circle cx="50" cy="30" r="25" fill="#00FFFF" />}
                                   </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-slate-200 font-semibold rounded-md hover:bg-slate-600 text-xs"><Save size={12} /> {t('saveToDrive')}</button>
                        <button className="flex items-center gap-1.5 px-3 py-1 bg-slate-700 text-slate-200 font-semibold rounded-md hover:bg-slate-600 text-xs"><FileIcon size={12} /> {t('exportAsPDF')}</button>
                    </div>
                </div>
            </div>
        )
    }

    return null;
};
