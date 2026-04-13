import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, RefreshCw, Download, Zap, Clock, ChevronRight, Activity } from 'lucide-react';
import { analyzeFace, generateTimeTravelPhoto } from './lib/gemini';
import { motion, AnimatePresence } from 'motion/react';

type AppState = 'IDLE' | 'CAPTURE' | 'ANALYZING' | 'ERA_SELECTION' | 'GENERATING' | 'RESULT';

interface Era {
  id: string;
  name: string;
  scene: string;
}

const ERAS: Era[] = [
  { id: '1920s', name: '1920s Speakeasy', scene: 'dimly lit speakeasy with jazz musicians and art deco details' },
  { id: 'egypt', name: 'Ancient Egypt', scene: 'pharaoh\'s palace with hieroglyphics, gold, and stone pillars' },
  { id: 'victorian', name: 'Victorian London', scene: 'foggy cobblestone street with gas lamps and horse carriages' },
  { id: 'wildwest', name: '1880s Wild West', scene: 'dusty wooden saloon with barrels and wanted posters' },
  { id: 'cyberpunk', name: 'Cyberpunk 2077', scene: 'neon-lit futuristic city street in the rain with flying cars' },
  { id: 'renaissance', name: 'Italian Renaissance', scene: 'artist\'s studio with classical paintings, marble, and warm sunlight' },
];

export default function App() {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [faceDescription, setFaceDescription] = useState<string>('');
  const [selectedEra, setSelectedEra] = useState<Era | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (base64: string) => {
    setCapturedImage(base64);
    setAppState('ANALYZING');
    setError(null);
    try {
      const description = await analyzeFace(base64, 'image/jpeg');
      setFaceDescription(description);
      setAppState('ERA_SELECTION');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze face.');
      setAppState('CAPTURE');
    }
  };

  const handleEraSelect = async (era: Era) => {
    if (!capturedImage) return;
    setSelectedEra(era);
    setAppState('GENERATING');
    setError(null);
    try {
      const result = await generateTimeTravelPhoto(capturedImage, 'image/jpeg', faceDescription, era.name, era.scene);
      setResultImage(result);
      setAppState('RESULT');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate photo.');
      setAppState('ERA_SELECTION');
    }
  };

  const reset = () => {
    setAppState('IDLE');
    setCapturedImage(null);
    setFaceDescription('');
    setSelectedEra(null);
    setResultImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-4xl bg-hardware-bg rounded-2xl border border-hardware-border shadow-2xl overflow-hidden flex flex-col relative">
        
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-hardware-border bg-hardware-surface">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-hardware-border flex items-center justify-center">
              <Clock className="w-4 h-4 text-hardware-accent" />
            </div>
            <div>
              <h1 className="font-mono text-sm font-bold tracking-widest text-hardware-text uppercase">Chronos Module v3.1</h1>
              <p className="font-mono text-[10px] text-hardware-muted uppercase tracking-wider">Temporal Displacement System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {error && <span className="font-mono text-[10px] text-hardware-accent uppercase">{error}</span>}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${appState !== 'IDLE' ? 'bg-hardware-accent shadow-[0_0_8px_#FF4444] animate-pulse' : 'bg-hardware-muted'}`} />
              <span className="font-mono text-[10px] text-hardware-muted uppercase tracking-widest">
                {appState === 'IDLE' ? 'STANDBY' : 'ACTIVE'}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 min-h-[500px] relative p-6 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            
            {appState === 'IDLE' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-md"
              >
                <div className="w-32 h-32 mx-auto mb-8 radial-track flex items-center justify-center relative">
                  <div className="absolute inset-0 border border-hardware-border rounded-full animate-[spin_10s_linear_infinite]" />
                  <Zap className="w-12 h-12 text-hardware-accent" />
                </div>
                <h2 className="text-3xl font-bold mb-4 tracking-tight">Time Travel Photo Booth</h2>
                <p className="text-hardware-muted mb-8 font-mono text-sm">
                  Initialize sequence to scan your biometric signature and displace your visual representation across the temporal continuum.
                </p>
                <button 
                  onClick={() => setAppState('CAPTURE')}
                  className="px-8 py-4 bg-hardware-surface border border-hardware-border hover:border-hardware-accent hover:text-hardware-accent transition-colors rounded-lg font-mono text-sm uppercase tracking-widest flex items-center gap-3 mx-auto"
                >
                  Initialize Sequence <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {appState === 'CAPTURE' && (
              <motion.div 
                key="capture"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="w-full flex flex-col items-center"
              >
                <div className="mb-6 text-center">
                  <h3 className="font-mono text-sm uppercase tracking-widest text-hardware-accent mb-2">Step 1: Biometric Scan</h3>
                  <p className="text-hardware-muted text-xs">Align face within the capture zone.</p>
                </div>
                <WebcamCapture onCapture={handleCapture} />
              </motion.div>
            )}

            {appState === 'ANALYZING' && (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-md text-center"
              >
                <div className="relative w-48 h-48 mx-auto mb-8 rounded-full overflow-hidden border-2 border-hardware-border">
                  {capturedImage && <img src={`data:image/jpeg;base64,${capturedImage}`} className="w-full h-full object-cover opacity-50 grayscale" alt="Captured" />}
                  <div className="scan-line" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-12 h-12 text-hardware-accent animate-pulse" />
                  </div>
                </div>
                <h3 className="font-mono text-sm uppercase tracking-widest text-hardware-accent mb-4">Analyzing Subject</h3>
                <div className="space-y-2 font-mono text-xs text-hardware-muted text-left bg-hardware-surface p-4 rounded border border-hardware-border">
                  <p className="animate-[pulse_1s_ease-in-out_infinite]">Extracting facial topography...</p>
                  <p className="animate-[pulse_1.2s_ease-in-out_infinite_0.2s]">Mapping pigmentation...</p>
                  <p className="animate-[pulse_1.4s_ease-in-out_infinite_0.4s]">Isolating distinct markers...</p>
                </div>
              </motion.div>
            )}

            {appState === 'ERA_SELECTION' && (
              <motion.div 
                key="era_selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-3xl"
              >
                <div className="mb-8 flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-hardware-border relative">
                    {capturedImage && <img src={`data:image/jpeg;base64,${capturedImage}`} className="w-full h-full object-cover" alt="Captured" />}
                    <div className="absolute top-1 left-1 bg-black/60 px-2 py-1 rounded text-[9px] font-mono uppercase">Subject</div>
                  </div>
                  <div className="flex-1 bg-hardware-surface p-4 rounded-lg border border-hardware-border">
                    <h4 className="font-mono text-[10px] text-hardware-accent uppercase tracking-widest mb-2">Subject Profile Extracted</h4>
                    <p className="text-sm text-hardware-muted leading-relaxed">{faceDescription}</p>
                  </div>
                </div>

                <h3 className="font-mono text-sm uppercase tracking-widest text-white mb-4">Select Temporal Destination</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ERAS.map((era) => (
                    <button
                      key={era.id}
                      onClick={() => handleEraSelect(era)}
                      className="group text-left p-4 bg-hardware-surface border border-hardware-border hover:border-hardware-accent rounded-lg transition-all hover:-translate-y-1"
                    >
                      <div className="font-mono text-xs text-hardware-accent mb-1 opacity-70 group-hover:opacity-100 transition-opacity">DEST: {era.id.toUpperCase()}</div>
                      <div className="font-bold text-lg mb-2">{era.name}</div>
                      <div className="text-xs text-hardware-muted line-clamp-2">{era.scene}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {appState === 'GENERATING' && (
              <motion.div 
                key="generating"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="w-32 h-32 mx-auto mb-8 radial-track flex items-center justify-center relative">
                  <div className="absolute inset-0 border-2 border-hardware-accent rounded-full animate-[spin_2s_linear_infinite] border-t-transparent" />
                  <Clock className="w-10 h-10 text-hardware-accent animate-pulse" />
                </div>
                <h3 className="font-mono text-sm uppercase tracking-widest text-hardware-accent mb-2">Initiating Temporal Displacement</h3>
                <p className="text-hardware-muted font-mono text-xs">Target: {selectedEra?.name}</p>
                <p className="text-hardware-muted font-mono text-xs mt-4 animate-pulse">Rendering historical context...</p>
              </motion.div>
            )}

            {appState === 'RESULT' && (
              <motion.div 
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl flex flex-col items-center"
              >
                <div className="w-full aspect-square sm:aspect-[4/3] bg-black rounded-xl overflow-hidden border border-hardware-border shadow-2xl relative mb-8">
                  {resultImage && <img src={resultImage} className="w-full h-full object-contain" alt="Time Travel Result" />}
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded font-mono text-[10px] uppercase tracking-widest border border-white/10">
                    {selectedEra?.name}
                  </div>
                </div>
                
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => {
                      if (resultImage) {
                        const a = document.createElement('a');
                        a.href = resultImage;
                        a.download = `time-travel-${selectedEra?.id}.png`;
                        a.click();
                      }
                    }}
                    className="px-6 py-3 bg-hardware-accent text-white rounded-lg font-mono text-sm uppercase tracking-widest flex items-center gap-2 hover:bg-red-500 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button 
                    onClick={reset}
                    className="px-6 py-3 bg-hardware-surface border border-hardware-border hover:border-hardware-muted rounded-lg font-mono text-sm uppercase tracking-widest flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" /> New Jump
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function WebcamCapture({ onCapture }: { onCapture: (base64: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState<boolean>(true);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => {
        activeStream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(err => {
        console.error("Webcam error:", err);
        setHasCamera(false);
      });

    return () => {
      if (activeStream) activeStream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg').split(',')[1];
    onCapture(base64);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      const base64 = result.split(',')[1];
      onCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      {hasCamera ? (
        <div className="relative aspect-[3/4] bg-black rounded-xl overflow-hidden border border-hardware-border mb-6">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
          
          {/* Camera UI Overlay */}
          <div className="absolute inset-0 pointer-events-none border-[16px] border-black/20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border border-white/30 rounded-[100%] pointer-events-none" />
          <div className="absolute top-4 left-4 font-mono text-[10px] text-white/70 uppercase">REC</div>
          <div className="absolute top-4 right-4 font-mono text-[10px] text-white/70 uppercase animate-pulse text-hardware-accent">●</div>
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center">
            <button 
              onClick={capture} 
              className="w-16 h-16 rounded-full bg-hardware-accent border-4 border-white/20 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,68,68,0.5)] flex items-center justify-center"
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      ) : (
        <div className="aspect-[3/4] bg-hardware-surface rounded-xl border border-hardware-border border-dashed flex flex-col items-center justify-center p-6 mb-6 text-center">
          <Camera className="w-12 h-12 text-hardware-muted mb-4 opacity-50" />
          <p className="text-sm text-hardware-muted mb-6">Camera access denied or unavailable.</p>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="flex items-center gap-4 w-full mb-4">
          <div className="h-px bg-hardware-border flex-1" />
          <span className="font-mono text-[10px] text-hardware-muted uppercase">OR</span>
          <div className="h-px bg-hardware-border flex-1" />
        </div>
        
        <label className="cursor-pointer px-6 py-3 bg-hardware-surface border border-hardware-border hover:border-hardware-muted rounded-lg font-mono text-sm uppercase tracking-widest flex items-center gap-2 transition-colors w-full justify-center">
          <Upload className="w-4 h-4" /> Upload Photo
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>
    </div>
  );
}
