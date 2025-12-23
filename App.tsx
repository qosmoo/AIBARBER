
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
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

  // Load auth and favorites from localStorage on mount
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
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await applyAIStyle(state.originalImage, state.options);
      setState((prev) => ({
        ...prev,
        generatedImage: result,
        isLoading: false,
      }));
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
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
    
    // Load existing favs for this new user if any
    const savedFavs = localStorage.getItem(`barber_favs_${newUser.id}`);
    setState(prev => ({ ...prev, favorites: savedFavs ? JSON.parse(savedFavs) : [] }));
  };

  const handleLogout = () => {
    localStorage.removeItem('barber_user');
    setState(prev => ({ ...prev, currentUser: null, favorites: [] }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-950 text-slate-100">
      <Sidebar
        options={state.options}
        setOptions={(options) => setState(prev => ({ ...prev, options }))}
        onImageUpload={handleImageUpload}
        onGenerate={handleGenerate}
        isLoading={state.isLoading}
        hasImage={!!state.originalImage}
        currentUser={state.currentUser}
        onAuthClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-10">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-5xl font-extrabold tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                Styling Studio
              </h2>
              <p className="text-slate-400 font-medium">Professional AI-assisted grooming visualization.</p>
            </div>
            <div className="flex gap-3">
              {state.generatedImage && (
                <>
                  <button 
                    onClick={handleSaveFavorite}
                    disabled={!state.currentUser}
                    className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border flex items-center gap-2 ${
                      state.currentUser 
                      ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' 
                      : 'bg-slate-900 text-slate-600 border-slate-800 cursor-not-allowed'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                    </svg>
                    {state.currentUser ? 'Save to Favorites' : 'Sign in to Save'}
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20 transition-all"
                  >
                    Download Look
                  </button>
                </>
              )}
            </div>
          </header>

          {state.error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-4">
              <span className="font-bold text-lg">!</span>
              <p className="text-sm font-medium">{state.error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Viewport: Original */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Input Photo</span>
                {state.originalImage && (
                  <span className="text-[10px] bg-slate-800 px-2 py-1 rounded uppercase font-bold text-slate-400">Ready</span>
                )}
              </div>
              <div className="aspect-[4/5] rounded-[2rem] bg-slate-900/50 border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
                {state.originalImage ? (
                  <img src={state.originalImage} alt="Input" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center group p-10">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 transition-transform group-hover:scale-110">
                      <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 font-bold text-lg">Upload Your Photo</p>
                    <p className="text-slate-600 text-sm mt-1 max-w-[200px] mx-auto">Clear headshot works best for realistic results.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Viewport: Result */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">AI Preview</span>
                {state.isLoading && <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>}
              </div>
              <div className="aspect-[4/5] rounded-[2rem] bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-2xl">
                {state.isLoading ? (
                  <div className="text-center">
                    <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-white font-black text-2xl tracking-tight">STYLING...</p>
                    <p className="text-slate-500 text-sm mt-2">Adjusting follicles and textures</p>
                  </div>
                ) : state.generatedImage ? (
                  <img src={state.generatedImage} alt="Styled" className="w-full h-full object-cover animate-in fade-in duration-1000" />
                ) : (
                  <div className="text-center opacity-30 select-none">
                    <svg className="w-24 h-24 text-slate-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Waiting for processing</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Favorites Section */}
          {state.favorites.length > 0 && (
            <section className="pt-12 border-t border-slate-900 animate-in slide-in-from-bottom duration-500">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                </svg>
                Saved Favorites
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
                {state.favorites.map((look) => (
                  <div key={look.id} className="group relative">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 transition-transform hover:scale-105 cursor-pointer shadow-lg">
                      <img src={look.imageUrl} alt="Favorite" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                        <p className="text-[10px] font-bold text-white uppercase">{look.options.hairstyle}</p>
                        <p className="text-[8px] text-slate-400 truncate">{new Date(look.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] p-8 shadow-2xl animate-in zoom-in duration-300">
            <h3 className="text-3xl font-black mb-2">Join the Studio</h3>
            <p className="text-slate-400 mb-8 font-medium">Create an account to save your favorite styles.</p>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                <input 
                  type="email" 
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                  placeholder="alex@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Display Name</label>
                <input 
                  type="text" 
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                  placeholder="Your Name"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/40 transition-all"
                >
                  Get Started
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
