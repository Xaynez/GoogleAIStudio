import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Search, Globe as GlobeIcon, Loader, AlertTriangle, Link as LinkIcon, Camera, Crosshair } from 'lucide-react';
import { searchMapsWithGemini, getCoordinatesForLocation, generateStreetViewImage } from '../../services/geminiService';
import type { GroundingSource } from '../../types';

const InteractiveGlobalExplorer: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<GroundingSource[]>([]);
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

    // New state for view management
    const [viewMode, setViewMode] = useState<'globe' | 'street'>('globe');
    const [streetViewImage, setStreetViewImage] = useState<string | null>(null);
    const [isGeneratingStreetView, setIsGeneratingStreetView] = useState(false);

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const globeRef = useRef<THREE.Group | null>(null);
    const markerRef = useRef<THREE.Mesh | null>(null);
    const animationFrameId = useRef<number>();
    const animationTargetRef = useRef<{ position: THREE.Vector3; target: THREE.Vector3 } | null>(null);
    
    // Lat/Lon to Vector3 conversion
    const latLonToVector3 = (lat: number, lon: number, radius: number) => {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        const x = -(radius * Math.sin(phi) * Math.cos(theta));
        const z = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        return new THREE.Vector3(x, y, z);
    };

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError(null);
        setResults([]);
        setCoordinates(null);
        animationTargetRef.current = null;
        setViewMode('globe'); // Always return to globe on new search
        setStreetViewImage(null);
        setIsGeneratingStreetView(false);

        // Clear previous marker
        if (markerRef.current) {
            globeRef.current?.remove(markerRef.current);
            markerRef.current = null;
        }

        try {
            const [mapsResult, coordsResult] = await Promise.all([
                searchMapsWithGemini(query),
                getCoordinatesForLocation(query),
            ]);

            if (mapsResult.sources.length > 0) {
                setResults(mapsResult.sources);
            } else {
                 setError(`No locations found for your query.`);
            }

            if (coordsResult) {
                setCoordinates(coordsResult);
                // Kick off street view generation in the background
                setIsGeneratingStreetView(true);
                generateStreetViewImage(query)
                    .then(imageData => setStreetViewImage(`data:image/png;base64,${imageData}`))
                    .catch(err => {
                        console.error("Failed to generate street view", err);
                        setStreetViewImage(null);
                    })
                    .finally(() => setIsGeneratingStreetView(false));
            }

        } catch (err) {
            setError('Failed to fetch location data. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleRecenter = useCallback(() => {
        if (!coordinates) return;
        setViewMode('globe'); // Ensure we are in globe view to see the animation
        const { lat, lng } = coordinates;
        const radius = 5;
        const markerPosition = latLonToVector3(lat, lng, radius);
        const cameraPosition = markerPosition.clone().multiplyScalar(1.8);
        animationTargetRef.current = { position: cameraPosition, target: markerPosition };
    }, [coordinates]);
    
    useEffect(() => {
        if (!coordinates || !globeRef.current) return;
        
        const { lat, lng } = coordinates;
        const radius = 5; // Globe radius
        
        // Create a pulsating marker
        const markerGeo = new THREE.SphereGeometry(0.08, 16, 16);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 });
        const marker = new THREE.Mesh(markerGeo, markerMat);
        marker.position.copy(latLonToVector3(lat, lng, radius));
        
        const pulseGeo = new THREE.SphereGeometry(0.12, 16, 16);
        const pulseMat = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.5 });
        const pulse = new THREE.Mesh(pulseGeo, pulseMat);
        pulse.position.copy(marker.position);
        
        const markerGroup = new THREE.Group();
        markerGroup.add(marker);
        markerGroup.add(pulse);

        (markerGroup as any).pulse = pulse; // For animation loop

        markerRef.current = markerGroup as any;
        globeRef.current.add(markerGroup);
        
        // Trigger the fly-to animation
        handleRecenter();

    }, [coordinates, handleRecenter]);


    const handleCapture = useCallback(() => {
        const renderer = rendererRef.current;
        if (!renderer) return;
        
        // Force a render to ensure the canvas is up-to-date
        renderer.render((renderer as any).__scene, (renderer as any).__camera);

        const dataURL = renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = `evolve-ai-globe-${query.replace(/\s+/g, '-') || 'capture'}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [query]);


    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene
        const scene = new THREE.Scene();
        
        // Camera
        const camera = new THREE.PerspectiveCamera(45, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
        camera.position.z = 15;
        
        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
        renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        // Store scene and camera on renderer to access them in capture function
        (renderer as any).__scene = scene;
        (renderer as any).__camera = camera;
        currentMount.appendChild(renderer.domElement);
        rendererRef.current = renderer;

        // Lights
        scene.add(new THREE.AmbientLight(0xcccccc, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
        dirLight.position.set(5, 3, 5);
        scene.add(dirLight);
        
        // Starfield
        const starTexture = new THREE.TextureLoader().load('https://unpkg.com/three-globe@2.31.0/example/img/night-sky.png');
        const starGeo = new THREE.SphereGeometry(100, 64, 64);
        const starMat = new THREE.MeshBasicMaterial({
            map: starTexture,
            side: THREE.BackSide
        });
        const starfield = new THREE.Mesh(starGeo, starMat);
        scene.add(starfield);

        // Globe
        const globeGroup = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();
        const earthTexture = textureLoader.load('https://unpkg.com/three-globe@2.31.0/example/img/earth-dark.jpg');
        const globeGeo = new THREE.SphereGeometry(5, 64, 64);
        const globeMat = new THREE.MeshPhongMaterial({ map: earthTexture });
        const globe = new THREE.Mesh(globeGeo, globeMat);
        globeGroup.add(globe);
        scene.add(globeGroup);
        globeRef.current = globeGroup;
        
        // Controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.minDistance = 5.5; // Allow closer zoom
        controls.maxDistance = 30;
        
        const interruptAnimation = () => { animationTargetRef.current = null; };
        controls.addEventListener('start', interruptAnimation);


        // Animation loop
        const animate = () => {
            animationFrameId.current = requestAnimationFrame(animate);

            if (!animationTargetRef.current) {
                globeGroup.rotation.y += 0.0005;
            }

            // Pulsating marker animation
            if (markerRef.current) {
                const pulseMesh = (markerRef.current as any).pulse;
                const time = Date.now() * 0.005;
                const scale = 1 + 0.3 * Math.sin(time * 2);
                pulseMesh.scale.set(scale, scale, scale);
                pulseMesh.material.opacity = 1 - (scale-1)/0.3 * 0.7;
            }
            
            // Camera fly-to animation
            if (animationTargetRef.current) {
                camera.position.lerp(animationTargetRef.current.position, 0.05);
                controls.target.lerp(animationTargetRef.current.target, 0.05);

                if (camera.position.distanceTo(animationTargetRef.current.position) < 0.1) {
                    animationTargetRef.current = null; // Stop animation when close
                    setViewMode('street');
                }
            }

            controls.update();
            renderer.render(scene, camera);
        };
        animate();

        // Resize handler
        const handleResize = () => {
            if (!mountRef.current) return;
            const { clientWidth, clientHeight } = mountRef.current;
            camera.aspect = clientWidth / clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(clientWidth, clientHeight);
        };
        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationFrameId.current!);
            window.removeEventListener('resize', handleResize);
            controls.removeEventListener('start', interruptAnimation);
            if (currentMount && renderer.domElement.parentNode === currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            scene.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    if(Array.isArray(object.material)) {
                        object.material.forEach(m => m.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            })
            renderer.dispose();
        };
    }, []);

    return (
        <div className="bg-surface-card/50 p-4 rounded-2xl shadow-soft border border-border-subtle">
            <h2 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <GlobeIcon className="text-brand-cyan" />
                <span className="heading-gradient">Interactive Global Explorer</span>
            </h2>
            <form onSubmit={handleSearch} className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search for a country or city..."
                    className="w-full bg-surface-input border border-border-input rounded-full py-2 pl-10 pr-4 text-text-primary focus:ring-2 focus:ring-brand-cyan focus:outline-none"
                />
            </form>

            <div className="relative aspect-video w-full bg-black/50 rounded-lg overflow-hidden border border-border-subtle">
                 {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
                        <Loader className="h-10 w-10 animate-spin text-brand-cyan" />
                    </div>
                 )}
                
                 {/* 3D Globe View */}
                 <div
                    ref={mountRef}
                    className={`w-full h-full transition-opacity duration-500 ${viewMode === 'globe' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                 />

                 {/* Street Level View */}
                 <div className={`absolute inset-0 flex items-center justify-center bg-black transition-opacity duration-500 ${viewMode === 'street' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    {isGeneratingStreetView && (
                        <div className="text-center text-brand-cyan">
                            <Loader className="h-10 w-10 animate-spin mx-auto" />
                            <p className="mt-2">Generating Street Level View...</p>
                        </div>
                    )}
                    {!isGeneratingStreetView && streetViewImage && (
                        <img src={streetViewImage} alt={`Street view of ${query}`} className="w-full h-full object-cover" />
                    )}
                    {!isGeneratingStreetView && !streetViewImage && (
                        <div className="text-center text-yellow-300 p-4">
                            <AlertTriangle size={32} className="mx-auto" />
                            <p className="mt-2">Could not generate street level view for this location.</p>
                        </div>
                    )}
                </div>

                 <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    {viewMode === 'globe' && (
                        <>
                            <button onClick={handleCapture} title="Capture Screenshot" className="p-2 bg-surface-input/50 rounded-full text-text-secondary hover:bg-surface-elevated/80 hover:text-text-primary transition-colors backdrop-blur-sm">
                                <Camera size={20} />
                            </button>
                            <button onClick={handleRecenter} disabled={!coordinates || isLoading} title="Focus on Location" className="p-2 bg-surface-input/50 rounded-full text-text-secondary hover:bg-surface-elevated/80 hover:text-text-primary transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                <Crosshair size={20} />
                            </button>
                        </>
                    )}
                    {viewMode === 'street' && (
                         <button onClick={() => setViewMode('globe')} title="Return to Globe View" className="p-2 bg-surface-input/50 rounded-full text-text-secondary hover:bg-surface-elevated/80 hover:text-text-primary transition-colors backdrop-blur-sm">
                            <GlobeIcon size={20} />
                        </button>
                    )}
                </div>
            </div>
            
            {(error || results.length > 0) && (
                <div className="mt-4">
                    <h3 className="font-semibold text-text-primary">Search Results</h3>
                     {error && (
                        <div className="mt-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <span>{error}</span>
                        </div>
                    )}
                    {results.length > 0 && (
                        <ul className="mt-2 space-y-2 max-h-48 overflow-y-auto pr-2">
                            {results.map((source, index) => source.maps && (
                                <li key={index}>
                                    <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-surface-elevated rounded-lg hover:bg-surface-input transition-colors">
                                        <p className="font-semibold text-link truncate flex items-center gap-2">
                                            <LinkIcon size={14} />
                                            {source.maps.title || 'View on Map'}
                                        </p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default InteractiveGlobalExplorer;