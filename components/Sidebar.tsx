
import React from 'react';
import { Hairstyle, BeardStyle, StylingOptions, User } from '../types';

interface SidebarProps {
  options: StylingOptions;
  setOptions: (options: StylingOptions) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: () => void;
  isLoading: boolean;
  hasImage: boolean;
  currentUser: User | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  options, 
  setOptions, 
  onImageUpload, 
  onGenerate, 
  isLoading,
  hasImage,
  currentUser,
  onAuthClick,
  onLogout
}) => {
  return (
    <div className="w-full lg:w-80 bg-slate-900 p-6 flex flex-col gap-6 h-screen overflow-y-auto border-r border-slate-800 shrink-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-500">AI</span> Barber
        </h1>
        {currentUser ? (
          <button 
            onClick={onLogout}
            className="text-xs text-slate-500 hover:text-white transition-colors"
          >
            Log Out
          </button>
        ) : (
          <button 
            onClick={onAuthClick}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Sign In
          </button>
        )}
      </div>

      {currentUser && (
        <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white uppercase">
            {currentUser.name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
            <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Upload Base Photo
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="flex items-center justify-center px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 border-dashed rounded-xl cursor-pointer transition-all group"
            >
              <span className="text-sm text-slate-400 group-hover:text-white font-medium">
                {hasImage ? 'Replace Photo' : 'Select Selfie'}
              </span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Hairstyle
          </label>
          <select
            value={options.hairstyle}
            onChange={(e) => setOptions({ ...options, hairstyle: e.target.value as Hairstyle })}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-sm"
          >
            {Object.values(Hairstyle).map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Beard Style
          </label>
          <select
            value={options.beardStyle}
            onChange={(e) => setOptions({ ...options, beardStyle: e.target.value as BeardStyle })}
            className="w-full bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-sm"
          >
            {Object.values(BeardStyle).map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Hair & Beard Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={options.color}
              onChange={(e) => setOptions({ ...options, color: e.target.value })}
              className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border-none"
            />
            <span className="text-slate-400 font-mono text-xs uppercase tracking-widest">{options.color}</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-800">
        <button
          onClick={onGenerate}
          disabled={isLoading || !hasImage}
          className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
            isLoading || !hasImage
              ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Generate Style'}
        </button>
        {!hasImage && (
          <p className="text-center text-[10px] text-slate-600 mt-2 uppercase tracking-widest font-bold">Image Required</p>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
