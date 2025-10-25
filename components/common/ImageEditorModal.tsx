import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Crop, Edit, Sliders, Sun, Star, Camera, Trash2, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import { useTranslation } from '../../i18n';

interface ImageEditorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dataUrl: string | null) => void;
    imageUrl: string | null;
    title: string;
}

const TABS = [
    { id: 'crop', label: 'crop', icon: <Crop size={18} /> },
    { id: 'adjust', label: 'adjust', icon: <Sliders size={18} /> },
    { id: 'filters', label: 'filters', icon: <Star size={18} /> },
];

const FILTERS = [
    { name: 'original', styles: '' },
    { name: 'light', styles: 'brightness(1.1) contrast(0.9) saturate(1.1)' },
    { name: 'prime', styles: 'brightness(1.05) contrast(1.1) saturate(1.2)' },
    { name: 'studio', styles: 'brightness(1.2) contrast(1.05) sepia(0.1)' },
    { name: 'classic', styles: 'grayscale(1) brightness(1.1)' },
    { name: 'edge', styles: 'contrast(1.5) saturate(1.5) brightness(0.9)' },
    { name: 'lumien', styles: 'sepia(0.3) contrast(0.8) brightness(1.3)' },
];

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({ isOpen, onClose, onSave, imageUrl, title }) => {
    const { t } = useTranslation();
    const [isClosing, setIsClosing] = useState(false);
    const [imageSrc, setImageSrc] = useState(imageUrl);
    
    const [activeTab, setActiveTab] = useState('crop');
    
    // Edit states
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [vignette, setVignette] = useState(0);
    const [activeFilter, setActiveFilter] = useState('original');
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetAdjustments = () => {
        setZoom(1);
        setRotation(0);
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setVignette(0);
        setActiveFilter('original');
    };

    useEffect(() => {
        if (isOpen) {
            setIsClosing(false);
            setImageSrc(imageUrl);
            resetAdjustments();
        }
    }, [isOpen, imageUrl]);

    const drawImage = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSrc) {
            if (canvas) {
                const ctx = canvas.getContext('2d');
                ctx?.clearRect(0, 0, canvas.width, canvas.height);
            }
            return;
        }
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = imageSrc;
        
        img.onload = () => {
            const { width, height } = img;
            canvas.width = width;
            canvas.height = height;

            // Apply filters
            const filterStyles = FILTERS.find(f => f.name === activeFilter)?.styles || '';
            ctx.filter = `${filterStyles} brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            
            // Apply transformations
            ctx.save();
            ctx.translate(width / 2, height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.scale(zoom, zoom);
            ctx.drawImage(img, -width / 2, -height / 2);
            ctx.restore();

            // Apply vignette
            if (vignette > 0) {
                ctx.save();
                ctx.filter = 'none'; // Clear filter for vignette overlay
                const gradient = ctx.createRadialGradient(width / 2, height / 2, width/2 - (width/2 * vignette/100), width / 2, height / 2, width / 2);
                gradient.addColorStop(0, 'rgba(0,0,0,0)');
                gradient.addColorStop(1, 'rgba(0,0,0,0.7)');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, width, height);
                ctx.restore();
            }
        };
        img.onerror = () => {
             ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

    }, [imageSrc, zoom, rotation, brightness, contrast, saturation, vignette, activeFilter]);
    
    useEffect(() => {
        drawImage();
    }, [drawImage]);

    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => onClose(), 300);
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas || !imageSrc) {
            onSave(null);
            triggerClose();
            return;
        };
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
        triggerClose();
    };

    const handleDelete = () => {
        setImageSrc(null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setImageSrc(event.target?.result as string);
                resetAdjustments();
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4" aria-modal="true" role="dialog">
            <div className={`bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col transform transition-all duration-300 ease-out ${isClosing ? 'animate-scale-out' : 'animate-scale-in'}`}>
                <header className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <div className="flex items-center gap-2">
                        <button onClick={triggerClose} className="px-4 py-2 text-slate-300 font-semibold rounded-lg hover:bg-slate-800">{t('cancel')}</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700">{t('applyChanges')}</button>
                    </div>
                </header>

                <main className="flex-grow flex overflow-hidden">
                    {/* Controls Panel */}
                    <div className="w-80 bg-slate-800/50 p-4 flex flex-col border-r border-slate-800">
                        <div className="flex-grow space-y-6 overflow-y-auto">
                            {activeTab === 'crop' && (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">{t('zoom')}</label>
                                        <div className="flex items-center gap-2">
                                            <ZoomOut size={16} />
                                            <input type="range" min="0.5" max="3" step="0.01" value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                            <ZoomIn size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-300">{t('rotate')}</label>
                                        <div className="flex items-center gap-2">
                                            <RotateCw size={16} />
                                            <input type="range" min="-180" max="180" step="1" value={rotation} onChange={e => setRotation(Number(e.target.value))} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                            <span className="text-xs w-10 text-right">{rotation}°</span>
                                        </div>
                                    </div>
                                </>
                            )}
                            {activeTab === 'adjust' && (
                                <>
                                    <div className="space-y-2"><label className="text-sm text-slate-300">{t('brightness')}</label><input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(Number(e.target.value))} className="w-full" /></div>
                                    <div className="space-y-2"><label className="text-sm text-slate-300">{t('contrast')}</label><input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(Number(e.target.value))} className="w-full" /></div>
                                    <div className="space-y-2"><label className="text-sm text-slate-300">{t('saturation')}</label><input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(Number(e.target.value))} className="w-full" /></div>
                                    <div className="space-y-2"><label className="text-sm text-slate-300">{t('vignette')}</label><input type="range" min="0" max="100" value={vignette} onChange={e => setVignette(Number(e.target.value))} className="w-full" /></div>
                                </>
                            )}
                            {activeTab === 'filters' && (
                                <div className="grid grid-cols-2 gap-2">
                                    {FILTERS.map(filter => (
                                        <button key={filter.name} onClick={() => setActiveFilter(filter.name)} className={`space-y-1 ${activeFilter === filter.name ? 'ring-2 ring-cyan-500 rounded-lg' : ''}`}>
                                            <img src={imageUrl || ''} alt={filter.name} className="w-full h-16 object-cover rounded-md" style={{ filter: filter.styles }} />
                                            <p className="text-xs text-center capitalize">{t(filter.name as any, filter.name)}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Image Preview */}
                    <div className="flex-grow flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full h-full flex items-center justify-center overflow-hidden">
                           <canvas ref={canvasRef} className="max-w-full max-h-full object-contain" />
                           {!imageSrc && (
                                <div className="text-center text-slate-500">
                                    <p>{t('imagePreview')}</p>
                                    <p className="text-sm">{t('uploadAnImage')}</p>
                                </div>
                           )}
                        </div>
                    </div>
                </main>
                
                {/* Footer Toolbar */}
                <footer className="p-2 border-t border-slate-800 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-lg">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === tab.id ? 'bg-cyan-500 text-slate-900' : 'text-slate-300 hover:bg-slate-700'}`}>
                                {tab.icon} <span className="capitalize">{t(tab.label as any, tab.label)}</span>
                            </button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2.5 rounded-lg text-slate-300 hover:bg-slate-800" title={t('uploadNewImage')}><Camera size={20} /></button>
                        <button onClick={handleDelete} className="p-2.5 rounded-lg text-red-400 hover:bg-red-500/10" title={t('deleteImage')}><Trash2 size={20} /></button>
                    </div>
                </footer>
            </div>
        </div>
    );
};
