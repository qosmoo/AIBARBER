
import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  User as UserIcon, 
  Camera, 
  LogIn, 
  LogOut, 
  Heart, 
  Sparkles, 
  Download, 
  RefreshCw, 
  Palette,
  UploadCloud,
  CheckCircle2,
  Trash2,
  Info
} from 'lucide-react';
import { Hairstyle, BeardStyle, StylistState, StylingOptions, User, SavedLook } from './types';
import { applyAIStyle } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<StylistState>({
    originalImage: null,
    generatedImage: null,
    isLoading: false,
    error: null,
    options: {
      hairstyle: Hairstyle.QUIFF,
      beardStyle: BeardStyle.STUBBLE,
      color: '#3d2b1f',
    },
    currentUser: null,
    favorites: [],
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('barber_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setState(prev => ({ ...prev, currentUser: user }));
      const savedFavs = localStorage.getItem(`barber_favs_${user.id}`);
      if (savedFavs) {
        setState(prev => ({ ...prev, favorites: JSON.parse(savedFavs) }));
      }
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState((prev) => ({
          ...prev,
          originalImage: event.target?.result as string,
          generatedImage: null,
          error: null,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!state.originalImage) return;
    
    // UI processing state (2s mock delay as requested, followed by real AI)
    setIsProcessing(true);
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const result = await applyAIStyle(state.originalImage, state.options);
      setState((prev) => ({
        ...prev,
        generatedImage: result,
        isLoading: false,
      }));
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveFavorite = () => {
    if (!state.generatedImage || !state.currentUser) return;
    const newLook: SavedLook = {
      id: Date.now().toString(),
      imageUrl: state.generatedImage,
      options: { ...state.options },
      createdAt: Date.now(),
    };
    const updatedFavs = [newLook, ...state.favorites];
    setState(prev => ({ ...prev, favorites: updatedFavs }));
    localStorage.setItem(`barber_favs_${state.currentUser.id}`, JSON.stringify(updatedFavs));
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      email: authEmail,
      name: authName || authEmail.split('@')[0],
    };
    setState(prev => ({ ...prev, currentUser: newUser }));
    localStorage.setItem('barber_user', JSON.stringify(newUser));
    setShowAuthModal(false);
    const savedFavs = localStorage.getItem(`barber_favs_${newUser.id}`);
    setState(prev => ({ ...prev, favorites: savedFavs ? JSON.parse(savedFavs) : [] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('barber_user');
    setState(prev => ({ ...prev, currentUser: null, favorites: [] }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 font-sans text-slate-200">
      
      {/* Sidebar Controls */}
      <aside className="w-full lg:w-[380px] bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col h-screen lg:sticky top-0 z-40">
        <div className="p-8 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black italic tracking-tighter text-white flex items-center gap-3">
              <span className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-900/40">
                <Scissors className="w-6 h-6" />
              </span>
              AI BARBER
            </h1>
            {state.currentUser ? (
              <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-white transition-colors" title="Log Out">
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="flex items-center gap-2 text-sm font-bold text-blue-500 hover:text-blue-400 transition-all">
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Digital Grooming Visualization</p>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 styled-scroll">
          {state.currentUser && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-lg shadow-lg">
                {state.currentUser.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white">{state.currentUser.name}</p>
                <p className="text-xs text-slate-500">{state.currentUser.email}</p>
              </div>
            </div>
          )}

          <section>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Base Photo</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all group ${
                state.originalImage ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-800 hover:border-slate-700 bg-slate-900/50'
              }`}
            >
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
              {state.originalImage ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="w-8 h-8 text-blue-500" />
                  <span className="text-sm font-bold text-blue-400">Photo Loaded</span>
                </div>
              ) : (
                <>
                  <UploadCloud className="w-10 h-10 text-slate-600 group-hover:text-slate-400 mb-3 transition-colors" />
                  <span className="text-sm font-bold text-slate-400">Upload Selfie</span>
                </>
              )}
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Hairstyle <Info className="w-3 h-3" />
              </label>
              <select 
                value={state.options.hairstyle}
                onChange={(e) => setState(prev => ({ ...prev, options: { ...prev.options, hairstyle: e.target.value as Hairstyle }}))}
                className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
              >
                {Object.values(Hairstyle).map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Beard Style <Info className="w-3 h-3" />
              </label>
              <select 
                value={state.options.beardStyle}
                onChange={(e) => setState(prev => ({ ...prev, options: { ...prev.options, beardStyle: e.target.value as BeardStyle }}))}
                className="w-full bg-slate-800 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-blue-600 transition-all appearance-none cursor-pointer"
              >
                {Object.values(BeardStyle).map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Color Palette</label>
              <div className="flex items-center gap-4 bg-slate-800 p-4 rounded-2xl">
                <input 
                  type="color" 
                  value={state.options.color}
                  onChange={(e) => setState(prev => ({ ...prev, options: { ...prev.options, color: e.target.value }}))}
                  className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
                />
                <span className="text-xs font-mono font-bold tracking-widest uppercase">{state.options.color}</span>
                <Palette className="w-4 h-4 ml-auto text-slate-600" />
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-slate-800 bg-slate-900/80">
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !state.originalImage}
            className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
              isProcessing || !state.originalImage
                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-blue-900/30 active:scale-[0.98]'
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-6 h-6 animate-spin" /> PROCESSING...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6" /> GENERATE LOOK
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 relative h-screen overflow-y-auto bg-slate-950 p-6 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative glass rounded-[2.5rem] overflow-hidden p-8 md:p-12">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div>
                  <h2 className="text-5xl md:text-7xl font-black tracking-tightest text-white leading-none mb-4">
                    AI BARBER <span className="text-blue-600">&</span> STYLIST
                  </h2>
                  <p className="text-xl text-slate-400 font-medium">Professional-grade grooming preview powered by Gemini AI.</p>
                </div>
                {state.generatedImage && (
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleSaveFavorite}
                      disabled={!state.currentUser}
                      className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                      title={state.currentUser ? "Save to Favorites" : "Sign in to save"}
                    >
                      <Heart className={`w-6 h-6 ${state.favorites.some(f => f.imageUrl === state.generatedImage) ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="px-8 py-4 bg-white text-black font-black rounded-2xl flex items-center gap-3 hover:bg-slate-200 transition-all shadow-xl"
                    >
                      <Download className="w-5 h-5" /> EXPORT
                    </button>
                  </div>
                )}
              </header>

              {state.error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-3xl mb-12 animate-in fade-in duration-500">
                  <p className="font-bold flex items-center gap-3">
                    <Info className="w-5 h-5" /> {state.error}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Before */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-500 text-xs">01</div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">Current Appearance</span>
                  </div>
                  <div className="aspect-[4/5] rounded-[2rem] bg-slate-900 border border-slate-800/50 overflow-hidden relative shadow-inner group">
                    {state.originalImage ? (
                      <img src={state.originalImage} className="w-full h-full object-cover" alt="Before" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-12 text-center">
                        <Camera className="w-16 h-16 mb-4 opacity-20" />
                        <p className="font-bold text-lg">Awaiting Your Photo</p>
                        <p className="text-sm mt-2">Professional results start with a clear portrait.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* After */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center font-bold text-blue-500 text-xs">02</div>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-500">AI Visualization</span>
                  </div>
                  <div className="aspect-[4/5] rounded-[2rem] bg-slate-900 border border-slate-800/50 overflow-hidden relative shadow-2xl">
                    {isProcessing ? (
                      <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center bg-slate-900/50">
                        <div className="w-24 h-24 mb-8 relative">
                          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          <Scissors className="absolute inset-0 m-auto w-8 h-8 text-blue-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 italic">STYLING follicles...</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto uppercase tracking-tighter">Gemini is rendering your {state.options.hairstyle} and {state.options.beardStyle}</p>
                      </div>
                    ) : state.generatedImage ? (
                      <div className="relative w-full h-full group">
                        <img src={state.generatedImage} className="w-full h-full object-cover animate-in fade-in zoom-in duration-700" alt="After" />
                        <div className="absolute bottom-6 left-6 right-6 p-4 glass rounded-2xl opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">
                           <div className="flex items-center justify-between">
                             <span className="text-xs font-black tracking-widest text-blue-400">STYLE APPLIED</span>
                             <span className="text-[10px] text-slate-400 font-bold">{state.options.hairstyle} • {state.options.beardStyle}</span>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 p-12 text-center">
                        <Sparkles className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-bold text-lg">Preview Unavailable</p>
                        <p className="text-sm mt-2">Adjust settings and click generate to begin transformation.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Favorites List */}
          {state.favorites.length > 0 && (
            <section className="animate-in slide-in-from-bottom duration-700">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" /> FAVORITES GALLERY
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {state.favorites.map((look) => (
                  <div key={look.id} className="group relative">
                    <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 transition-all hover:scale-105 shadow-xl hover:shadow-blue-900/10 cursor-pointer">
                      <img src={look.imageUrl} className="w-full h-full object-cover" alt="Favorite" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-5">
                        <p className="text-[10px] font-black tracking-widest text-blue-400 mb-1">{look.options.hairstyle.toUpperCase()}</p>
                        <p className="text-xs text-white font-bold opacity-60">{new Date(look.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Style Definitions Info */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
            {[
              { icon: Scissors, title: "Precision", text: "AI analyzes your facial symmetry to suggest the perfect taper and line-up." },
              { icon: Palette, title: "Color Theory", text: "Test subtle tints or bold transformations with realistic depth and shine." },
              { icon: Sparkles, title: "Modern Style", text: "Stay ahead of trends with styles from classic pompadours to modern buzz cuts." }
            ].map((feature, i) => (
              <div key={i} className="glass p-8 rounded-[2rem] border-slate-800/50 hover:bg-white/[0.07] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                  <feature.icon className="w-6 h-6 text-blue-500 group-hover:text-white" />
                </div>
                <h4 className="text-xl font-black mb-3">{feature.title}</h4>
                <p className="text-slate-500 leading-relaxed text-sm font-medium">{feature.text}</p>
              </div>
            ))}
          </section>
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-3xl animate-in zoom-in duration-300">
            <h3 className="text-4xl font-black mb-2 italic tracking-tighter">WELCOME BACK</h3>
            <p className="text-slate-400 mb-8 font-medium">Join the digital grooming revolution.</p>
            <form onSubmit={handleAuthSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Email</label>
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white font-bold"
                  placeholder="barber@digital.com"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Name</label>
                <input 
                  type="text" 
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-slate-800 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-600 transition-all text-white font-bold"
                  placeholder="Grooming Pro"
                />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-black transition-all"
                >
                  CANCEL
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-xl shadow-blue-900/40 transition-all"
                >
                  SIGN IN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
