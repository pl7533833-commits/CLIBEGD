import React, { useState } from 'react';
import { SocialCardState, VOICE_DATA, VoiceName, GenderOption, StoryLength } from '../types';
import { Wand2, Download, Image as ImageIcon, UserCircle2, Mic, Play, Bot, Palette, Music, FileText, Shuffle, Clock, Youtube, Copy, Check, MessageSquareDashed, Sparkles } from 'lucide-react';
import { ChatDirector } from './ChatDirector';

interface EditorControlsProps {
  state: SocialCardState;
  onChange: (updates: Partial<SocialCardState>) => void;
  onGenerate: () => void;
  onGenerateIdentity: (gender: GenderOption) => void;
  onGenerateStory: (topic: string, length: StoryLength) => void;
  onGenerateSpeech: (voice: VoiceName) => void;
  onGenerateYouTubeMetadata: () => void;
  onPreviewVoice: (voice: VoiceName) => void;
  onDownloadImage: () => void;
  onDownloadAudio: () => void;
  isGenerating: boolean;
  isGeneratingIdentity: boolean;
  isGeneratingStory: boolean;
  isGeneratingSpeech: boolean;
  isGeneratingMetadata?: boolean;
  audioUrl: string | null;
  setBgColor: (color: string) => void;
  bgColor: string;
  isTransparent: boolean;
  setTransparent: (v: boolean) => void;
  // Lifted state
  activeTab: 'design' | 'ai' | 'chat';
  setActiveTab: (tab: 'design' | 'ai' | 'chat') => void;
}

const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
  <div className="flex flex-col gap-1.5 mb-6">
    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
      {label}
    </label>
    {children}
  </div>
);

const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800 text-purple-400">
    <Icon className="w-4 h-4" />
    <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
  </div>
);

const TextInput = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <input
    type="text"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
  />
);

const Toggle = ({ value, onChange, label }: { value: boolean, onChange: (v: boolean) => void, label: string }) => (
  <button
    onClick={() => onChange(!value)}
    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg border transition-all ${
      value ? 'bg-blue-500/10 border-blue-500/50 text-blue-400' : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
    }`}
  >
    <span className="text-sm font-medium">{label}</span>
    <div className={`w-8 h-4 rounded-full relative transition-colors ${value ? 'bg-blue-500' : 'bg-gray-600'}`}>
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all duration-200 ${value ? 'left-4.5' : 'left-0.5'}`} style={{ left: value ? '1.1rem' : '0.15rem' }} />
    </div>
  </button>
);

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button 
            onClick={handleCopy}
            className="p-1.5 hover:bg-gray-700 rounded-md transition-colors text-gray-400 hover:text-white"
            title="Copy to clipboard"
        >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
    );
};

export const EditorControls: React.FC<EditorControlsProps> = ({
  state,
  onChange,
  onGenerate,
  onGenerateIdentity,
  onGenerateStory,
  onGenerateSpeech,
  onGenerateYouTubeMetadata,
  onPreviewVoice,
  onDownloadImage,
  onDownloadAudio,
  isGenerating,
  isGeneratingIdentity,
  isGeneratingStory,
  isGeneratingSpeech,
  isGeneratingMetadata = false,
  audioUrl,
  setBgColor,
  bgColor,
  isTransparent,
  setTransparent,
  activeTab,
  setActiveTab
}) => {
  const [storyPrompt, setStoryPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<VoiceName>('Kore');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [genderPref, setGenderPref] = useState<GenderOption>('Random');
  const [lengthPref, setLengthPref] = useState<StoryLength>('Long');
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ avatarUrl: url });
    }
  };
  
  const handleVoicePreview = async () => {
    setIsPreviewing(true);
    await onPreviewVoice(selectedVoice);
    setIsPreviewing(false);
  };

  const handleRandomizeMetrics = () => {
    const views = Math.floor(Math.random() * 900000) + 100000;
    const likes = Math.floor(views * (0.05 + Math.random() * 0.05));
    const comments = Math.floor(likes * (0.02 + Math.random() * 0.04));

    const format = (n: number) => {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return n.toString();
    };

    onChange({
      viewCount: format(views),
      likeCount: format(likes),
      commentCount: format(comments)
    });
  };

  if (activeTab === 'chat') {
      return (
          <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800 w-full md:w-80 lg:w-96">
                {/* Chat Tab Navigation Header */}
                <div className="p-4 border-b border-gray-800 bg-gray-900 shrink-0">
                    <button
                        onClick={() => setActiveTab('design')}
                        className="flex items-center gap-2 text-xs text-gray-400 hover:text-white mb-4"
                    >
                        &larr; Back to Editor
                    </button>
                    <div className="flex p-1 bg-gray-800 rounded-lg gap-1">
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 text-gray-400 hover:text-white`}
                        >
                            <Palette className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => setActiveTab('ai')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 text-gray-400 hover:text-white`}
                        >
                            <Bot className="w-3 h-3" />
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 bg-indigo-600 text-white shadow-sm`}
                        >
                            <MessageSquareDashed className="w-3 h-3" />
                        </button>
                    </div>
                </div>
                
                {/* Chat Director Component */}
                <div className="flex-1 overflow-hidden">
                    <ChatDirector 
                        state={state} 
                        onUpdateState={onChange} 
                        onRegenerateAudio={() => onGenerateSpeech(selectedVoice)}
                    />
                </div>
          </div>
      );
  }

  return (
    <div className="h-full flex flex-col bg-gray-900 border-r border-gray-800 w-full md:w-80 lg:w-96 overflow-y-auto">
      <div className="p-6 border-b border-gray-800 sticky top-0 bg-gray-900 z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Post Generator
        </h1>
        <p className="text-gray-500 text-xs mt-1">Design viral screenshots in seconds.</p>
        
        {/* Tab Switcher */}
        <div className="flex p-1 bg-gray-800 rounded-lg mt-4 gap-1">
          <button
            onClick={() => setActiveTab('design')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'design' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Palette className="w-3 h-3" />
            Design
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Bot className="w-3 h-3" />
            AI Studio
          </button>
           <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'chat' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquareDashed className="w-3 h-3" />
            Director
          </button>
        </div>
      </div>

      <div className="p-6 space-y-2 flex-1">

        {activeTab === 'ai' && (
          <div className="animate-in fade-in slide-in-from-left-4 duration-300">
             {/* ... existing AI tab content ... */}
             
             {/* SECTION 1: IDENTITY */}
             <SectionHeader icon={UserCircle2} title="1. Identity" />
             <div className="mb-6 space-y-2">
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg">
                    {['Random', 'Male', 'Female'].map((g) => (
                        <button
                            key={g}
                            onClick={() => setGenderPref(g as GenderOption)}
                            className={`flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all ${
                                genderPref === g ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
                <button
                  onClick={() => onGenerateIdentity(genderPref)}
                  disabled={isGeneratingIdentity}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-750 border border-blue-500/30 hover:border-blue-500/50 text-blue-400 rounded-lg font-medium text-xs transition-all disabled:opacity-50"
                >
                  <UserCircle2 className={`w-3.5 h-3.5 ${isGeneratingIdentity ? 'animate-spin' : ''}`} />
                  {isGeneratingIdentity ? 'Creating Persona...' : 'Generate Identity'}
                </button>
             </div>

             {/* SECTION 2: STORY GENERATOR */}
             <SectionHeader icon={FileText} title="2. Story Generator" />
             <InputGroup label="Story Settings">
                <div className="space-y-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Story Length
                    </label>
                    <select
                        value={lengthPref}
                        onChange={(e) => setLengthPref(e.target.value as StoryLength)}
                        className="w-full bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                    >
                        <option value="Short">Short (~30s)</option>
                        <option value="Medium">Medium (~1m)</option>
                        <option value="Long">Long (>1:30m)</option>
                        <option value="Extra Long">Extra Long (>2m)</option>
                    </select>
                  </div>
                  
                  <textarea
                    value={storyPrompt}
                    onChange={(e) => setStoryPrompt(e.target.value)}
                    className="w-full h-20 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none"
                    placeholder="Topic: Cheating, Lottery, Revenge..."
                  />
                  <div className="grid grid-cols-2 gap-2">
                     <button
                        onClick={onGenerate}
                        disabled={isGenerating}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-gray-300 rounded-lg text-xs font-medium transition-all"
                      >
                        <Wand2 className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                        Rnd Title
                      </button>
                      <button
                        onClick={() => onGenerateStory(storyPrompt, lengthPref)}
                        disabled={isGeneratingStory || !storyPrompt}
                        className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                      >
                        <Bot className={`w-3 h-3 ${isGeneratingStory ? 'animate-spin' : ''}`} />
                        Write Story
                      </button>
                  </div>
                </div>
             </InputGroup>

             <InputGroup label="Audio Script">
                <textarea
                  value={state.storyText}
                  onChange={(e) => onChange({ storyText: e.target.value })}
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm resize-none font-mono text-xs leading-relaxed"
                  placeholder="The full story text will appear here..."
                />
                <p className="text-[10px] text-gray-500 text-right mt-1">{state.storyText.length} chars</p>
             </InputGroup>

             {/* SECTION 3: VOICE STUDIO */}
             <SectionHeader icon={Mic} title="3. Voice Studio" />
             <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-800 mb-6">
                <div className="flex gap-2 mb-3">
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value as VoiceName)}
                    className="flex-1 bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-2 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    {VOICE_DATA.map(v => (
                      <option key={v.name} value={v.name}>
                        {v.name} ({v.gender}, {v.style})
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleVoicePreview}
                    disabled={isPreviewing}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-all disabled:opacity-50 flex items-center gap-2"
                    title="Preview Voice"
                  >
                    {isPreviewing ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Play className="w-3 h-3" />}
                  </button>
                </div>
                
                <button
                  onClick={() => onGenerateSpeech(selectedVoice)}
                  disabled={isGeneratingSpeech || !state.storyText}
                  className="w-full px-3 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all disabled:opacity-50 shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2"
                >
                    <Mic className={`w-3.5 h-3.5 ${isGeneratingSpeech ? 'animate-pulse' : ''}`} />
                    {isGeneratingSpeech ? 'Generating...' : 'Generate Audio'}
                </button>

                {audioUrl && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <audio controls src={audioUrl} className="w-full h-8 block" />
                  </div>
                )}
             </div>

             {/* SECTION 4: METADATA */}
             <SectionHeader icon={Youtube} title="4. YouTube Metadata" />
             <div className="mb-6 space-y-3">
                 <button
                    onClick={onGenerateYouTubeMetadata}
                    disabled={isGeneratingMetadata || !state.storyText}
                    className="w-full px-3 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                 >
                     <Sparkles className={`w-3.5 h-3.5 ${isGeneratingMetadata ? 'animate-spin' : ''}`} />
                     {isGeneratingMetadata ? 'Writing Viral Metadata...' : 'Generate YouTube Metadata'}
                 </button>

                 {state.youtubeMetadata && (
                     <div className="bg-gray-800 rounded-lg p-3 space-y-3 border border-gray-700 animate-in fade-in duration-300">
                         <div className="space-y-1">
                             <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                                 Title
                                 <CopyButton text={state.youtubeMetadata.title} />
                             </div>
                             <div className="text-xs text-white leading-relaxed font-medium bg-gray-900/50 p-2 rounded border border-gray-700/50">
                                 {state.youtubeMetadata.title}
                             </div>
                         </div>
                         <div className="space-y-1">
                             <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase">
                                 Description
                                 <CopyButton text={state.youtubeMetadata.description} />
                             </div>
                             <div className="text-[10px] text-gray-300 leading-relaxed bg-gray-900/50 p-2 rounded border border-gray-700/50 whitespace-pre-wrap max-h-40 overflow-y-auto">
                                 {state.youtubeMetadata.description}
                             </div>
                         </div>
                     </div>
                 )}
             </div>

             {/* SECTION 5: EXPORT */}
             <SectionHeader icon={Download} title="5. Export" />
             <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onDownloadImage}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-all"
                >
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                    <span className="text-xs font-medium">Image</span>
                </button>
                 <button
                    onClick={onDownloadAudio}
                    disabled={!audioUrl}
                    className="flex flex-col items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Music className="w-5 h-5 text-gray-400" />
                    <span className="text-xs font-medium">Audio</span>
                </button>
             </div>
          </div>
        )}

        {activeTab === 'design' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Download Button in Design Tab too */}
            <button
                onClick={onDownloadImage}
                className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-lg font-medium text-sm transition-all"
            >
                <Download className="w-4 h-4" />
                Export Image
            </button>

            <InputGroup label="Identity">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="relative group flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center overflow-hidden">
                      {state.avatarUrl ? (
                        <img src={state.avatarUrl} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" title="Upload Avatar" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <TextInput value={state.username} onChange={(v) => onChange({ username: v })} placeholder="Display Name" />
                    <TextInput value={state.handle} onChange={(v) => onChange({ handle: v })} placeholder="Handle" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={() => onGenerateIdentity('Random')}
                        disabled={isGeneratingIdentity}
                        className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-800 border border-gray-700 hover:bg-gray-700 text-blue-400 rounded-lg text-xs font-medium transition-all"
                    >
                        <UserCircle2 className={`w-3 h-3 ${isGeneratingIdentity ? 'animate-spin' : ''}`} />
                        Random Persona
                    </button>
                    <Toggle 
                        value={state.isVerified} 
                        onChange={(v) => onChange({ isVerified: v })} 
                        label="Verified" 
                    />
                </div>
              </div>
            </InputGroup>

            <InputGroup label="Card Title">
              <textarea
                value={state.content}
                onChange={(e) => onChange({ content: e.target.value })}
                className="w-full h-24 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                placeholder="The short title shown on the image..."
              />
            </InputGroup>

            <InputGroup label="Metrics">
              <div className="space-y-2">
                 <div className="grid grid-cols-2 gap-3">
                    <TextInput value={state.viewCount} onChange={(v) => onChange({ viewCount: v })} placeholder="Views" />
                    <TextInput value={state.timestamp} onChange={(v) => onChange({ timestamp: v })} placeholder="Time" />
                    <TextInput value={state.likeCount} onChange={(v) => onChange({ likeCount: v })} placeholder="Likes" />
                    <TextInput value={state.commentCount} onChange={(v) => onChange({ commentCount: v })} placeholder="Comments" />
                 </div>
                 <button
                    onClick={handleRandomizeMetrics}
                    className="w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-400 hover:text-white rounded-lg text-xs font-medium transition-all"
                 >
                    <Shuffle className="w-3 h-3" />
                    Randomize Legit Numbers
                 </button>
              </div>
            </InputGroup>

            <InputGroup label="Appearance">
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <Toggle 
                    value={state.theme === 'dark'} 
                    onChange={(v) => onChange({ theme: v ? 'dark' : 'light' })} 
                    label="Dark Mode" 
                    />
                    <Toggle 
                    value={state.showAudioBadge} 
                    onChange={(v) => onChange({ showAudioBadge: v })} 
                    label="Audio Badge" 
                    />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Brand Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {['#ff4500', '#1DA1F2', '#E1306C', '#10b981', '#8b5cf6'].map(color => (
                        <button
                        key={color}
                        onClick={() => onChange({ accentColor: color })}
                        className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${state.accentColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900' : ''}`}
                        style={{ backgroundColor: color }}
                        />
                    ))}
                  </div>
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-2 flex justify-between items-center">
                        Background Canvas
                        <button 
                            onClick={() => setTransparent(!isTransparent)}
                            className={`text-[10px] px-2 py-0.5 rounded border ${isTransparent ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'border-gray-700 text-gray-500'}`}
                        >
                            {isTransparent ? 'Transparent On' : 'Transparent Off'}
                        </button>
                    </label>
                    <div className={`flex items-center gap-2 transition-opacity ${isTransparent ? 'opacity-30 pointer-events-none' : ''}`}>
                    <input 
                        type="color" 
                        value={bgColor} 
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs font-mono text-gray-400 uppercase">{bgColor}</span>
                    </div>
                </div>
              </div>
            </InputGroup>
          </div>
        )}
      </div>
    </div>
  );
};