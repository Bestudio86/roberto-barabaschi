/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  Sparkles, 
  Image as ImageIcon, 
  ChevronRight, 
  RotateCcw,
  Loader2,
  Key
} from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion, AnimatePresence } from 'motion/react';
import { generateStagedImage } from './lib/gemini';

// --- Types ---
type RoomType = 'Living Room' | 'Bedroom' | 'Kitchen' | 'Bathroom' | 'Office' | 'Dining Room';
type FurnitureStyle = 'Modern' | 'Minimalist' | 'Industrial' | 'Scandinavian' | 'Classic' | 'Bohemian' | 'Luxury';
type ImageSize = '1K' | '2K' | '4K';

// --- Constants ---
const ROOM_TYPES: RoomType[] = ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Office', 'Dining Room'];
const FURNITURE_STYLES: FurnitureStyle[] = ['Modern', 'Minimalist', 'Industrial', 'Scandinavian', 'Classic', 'Bohemian', 'Luxury'];
const IMAGE_SIZES: ImageSize[] = ['1K', '2K', '4K'];

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [stagedImage, setStagedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [roomType, setRoomType] = useState<RoomType>('Living Room');
  const [style, setStyle] = useState<FurnitureStyle>('Modern');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // API key selection logic removed as requested
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setStagedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setStagedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) return;
    
    setIsGenerating(true);
    setError(null);

    try {
      const result = await generateStagedImage(originalImage, roomType, style);
      setStagedImage(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate image. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!stagedImage) return;
    const link = document.createElement('a');
    link.href = stagedImage;
    link.download = `staged-${roomType.toLowerCase()}-${style.toLowerCase()}.png`;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setStagedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-serif selection:bg-[#5A5A40] selection:text-white">
      {/* Header */}
      <header className="border-b border-black/10 px-6 py-4 flex justify-between items-center bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <h1 className="text-xl font-light tracking-widest uppercase">LuxStaging <span className="font-bold">AI</span></h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Controls */}
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-6">
            <div>
              <h2 className="text-3xl font-light mb-2">Virtual Staging</h2>
              <p className="text-[#5A5A40] font-sans text-sm italic">Transform empty spaces into luxury interiors instantly.</p>
            </div>

            <div className="space-y-4 font-sans">
              {/* Room Type */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Room Type</label>
                <select 
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                  className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all appearance-none cursor-pointer"
                >
                  {ROOM_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Furniture Style */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-50">Interior Style</label>
                <select 
                  value={style}
                  onChange={(e) => setStyle(e.target.value as FurnitureStyle)}
                  className="w-full bg-white border border-black/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all appearance-none cursor-pointer"
                >
                  {FURNITURE_STYLES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              {!originalImage ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 bg-[#5A5A40] text-white rounded-full flex items-center justify-center gap-2 hover:bg-[#4A4A30] transition-all shadow-lg shadow-[#5A5A40]/20 group"
                >
                  <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
                  <span className="uppercase tracking-widest text-sm font-sans font-bold">Upload Room Photo</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full py-4 bg-black text-white rounded-full flex items-center justify-center gap-2 hover:bg-black/80 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isGenerating ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span className="uppercase tracking-widest text-sm font-sans font-bold">
                      {isGenerating ? 'Staging Interior...' : 'Generate Staging'}
                    </span>
                  </button>
                  
                  {stagedImage && (
                    <button 
                      onClick={handleDownload}
                      className="w-full py-4 border border-black text-black rounded-full flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all group"
                    >
                      <Download size={18} className="group-hover:translate-y-1 transition-transform" />
                      <span className="uppercase tracking-widest text-sm font-sans font-bold">Download High-Res</span>
                    </button>
                  )}

                  <button 
                    onClick={reset}
                    className="w-full py-2 text-xs text-black/50 hover:text-black transition-all flex items-center justify-center gap-1 font-sans uppercase tracking-widest"
                  >
                    <RotateCcw size={12} />
                    Start Over
                  </button>
                </div>
              )}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-sans leading-relaxed"
              >
                {error}
              </motion.div>
            )}
          </section>

          {/* Info Card */}
          <div className="p-6 bg-white rounded-3xl border border-black/5 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest font-sans">How it works</h3>
            <ul className="space-y-3 font-sans text-xs text-black/60 leading-relaxed">
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[10px] font-bold text-black shrink-0">01</span>
                Upload a high-quality photo of an empty, well-lit room.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[10px] font-bold text-black shrink-0">02</span>
                Select the room type and your preferred interior design style.
              </li>
              <li className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-[#f5f2ed] flex items-center justify-center text-[10px] font-bold text-black shrink-0">03</span>
                Our AI generates a photorealistic staged version of your space.
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-8">
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className={`relative aspect-[4/3] w-full rounded-[2rem] overflow-hidden border-2 border-dashed transition-all duration-500 flex items-center justify-center bg-white/30 ${
              !originalImage ? 'border-black/10 hover:border-[#5A5A40]/40' : 'border-transparent'
            }`}
          >
            <AnimatePresence mode="wait">
              {!originalImage ? (
                <motion.div 
                  key="upload-prompt"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center space-y-4 p-12"
                >
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm border border-black/5">
                    <ImageIcon size={32} className="text-black/20" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xl font-light">Drop your room photo here</p>
                    <p className="text-sm text-black/40 font-sans">or click to browse from your device</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="px-8 py-3 bg-white border border-black/10 rounded-full text-xs uppercase tracking-widest font-sans font-bold hover:border-black transition-all"
                  >
                    Select File
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="preview-content"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-full relative group"
                >
                  {stagedImage ? (
                    <div className="w-full h-full">
                      <ReactCompareSlider
                        itemOne={<ReactCompareSliderImage src={originalImage} alt="Original" />}
                        itemTwo={<ReactCompareSliderImage src={stagedImage} alt="Staged" />}
                        className="w-full h-full"
                        handle={
                          <div className="w-1 h-full bg-white relative flex items-center justify-center">
                            <div className="w-10 h-10 bg-white rounded-full shadow-xl flex items-center justify-center border border-black/5">
                              <div className="flex gap-1">
                                <div className="w-1 h-1 bg-black rounded-full" />
                                <div className="w-1 h-1 bg-black rounded-full" />
                                <div className="w-1 h-1 bg-black rounded-full" />
                              </div>
                            </div>
                          </div>
                        }
                      />
                      
                      {/* Labels */}
                      <div className="absolute top-6 left-6 px-4 py-2 bg-black/50 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-sans font-bold rounded-full pointer-events-none">
                        Before
                      </div>
                      <div className="absolute top-6 right-6 px-4 py-2 bg-[#5A5A40]/80 backdrop-blur-md text-white text-[10px] uppercase tracking-widest font-sans font-bold rounded-full pointer-events-none">
                        After: {style} {roomType}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full relative">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-6">
                          <div className="relative">
                            <Loader2 size={48} className="animate-spin opacity-20" />
                            <Sparkles size={24} className="absolute inset-0 m-auto animate-pulse" />
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-2xl font-light tracking-widest uppercase">Designing Space</p>
                            <p className="text-xs font-sans opacity-60 uppercase tracking-widest">Applying {style} style to your {roomType}...</p>
                          </div>
                          
                          {/* Progress bar simulation */}
                          <div className="w-64 h-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: '100%' }}
                              transition={{ duration: 15, ease: "linear" }}
                              className="h-full bg-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gallery / Examples */}
          {!originalImage && (
            <div className="mt-12 grid grid-cols-3 gap-4">
              {[
                { label: 'Modern Living', img: 'https://picsum.photos/seed/interior1/800/600' },
                { label: 'Minimalist Bedroom', img: 'https://picsum.photos/seed/interior2/800/600' },
                { label: 'Industrial Office', img: 'https://picsum.photos/seed/interior3/800/600' },
              ].map((example, i) => (
                <div key={i} className="group cursor-pointer space-y-2">
                  <div className="aspect-square rounded-2xl overflow-hidden border border-black/5">
                    <img 
                      src={example.img} 
                      alt={example.label} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-sans font-bold opacity-40 group-hover:opacity-100 transition-opacity">{example.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] uppercase tracking-[0.3em] font-sans font-bold opacity-30">
        <p>© 2026 LuxStaging AI. All rights reserved.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Terms of Service</a>
          <a href="#" className="hover:opacity-100 transition-opacity">Contact Us</a>
        </div>
      </footer>
    </div>
  );
}
