import React, { useState, useRef, useCallback } from 'react';
import * as htmlToImage from 'html-to-image';
import { CardPreview } from './components/CardPreview';
import { EditorControls } from './components/EditorControls';
import { SocialCardState, VoiceName, GenderOption, StoryLength } from './types';
import { generatePostContent, generateIdentity, generateStory, generateSpeech, generateYouTubeMetadata } from './services/geminiService';

const INITIAL_STATE: SocialCardState = {
  avatarUrl: '',
  username: 'Dani',
  handle: 'Dani030231',
  isVerified: true,
  viewCount: '599,299',
  timestamp: '2h ago',
  content: 'AITA for not taking my ex back after she left me and regretted it once I got my life together?',
  storyText: 'I (26M) started dating my ex (25F) in college. We were together for 3 years before she suddenly left...', 
  likeCount: '612+',
  commentCount: '121+',
  showAudioBadge: true,
  theme: 'light',
  accentColor: '#ff4500', 
  introAudioUrl: null,
  mainAudioUrl: null,
  youtubeMetadata: null,
};

const App: React.FC = () => {
  const [state, setState] = useState<SocialCardState>(INITIAL_STATE);
  const [bgColor, setBgColor] = useState('#000000');
  const [isTransparent, setIsTransparent] = useState(false);
  const [activeTab, setActiveTab] = useState<'design' | 'ai' | 'chat'>('design');
  
  // Loading States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingIdentity, setIsGeneratingIdentity] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);

  const handleStateChange = useCallback((updates: Partial<SocialCardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    
    const contexts = [
        "A shocking relationship update",
        "A funny programming joke",
        "A controversial food opinion",
        "A wholesome pet story",
        "An unexpected life hack",
        "A hot take on a trending movie",
        "An embarrassing workplace moment"
    ];
    const prompt = contexts[Math.floor(Math.random() * contexts.length)];

    const generated = await generatePostContent(prompt);
    
    if (generated) {
      handleStateChange({
        handle: generated.handle,
        content: generated.content,
        viewCount: generated.viewCount,
        likeCount: generated.likeCount,
        commentCount: generated.commentCount,
      });
    }
    setIsGenerating(false);
  };

  const handleGenerateIdentity = async (gender: GenderOption = 'Random') => {
    if (isGeneratingIdentity) return;
    setIsGeneratingIdentity(true);

    const identity = await generateIdentity(gender);
    
    if (identity) {
      handleStateChange({
        username: identity.username,
        handle: identity.handle,
        avatarUrl: identity.avatarUrl || state.avatarUrl
      });
    }
    setIsGeneratingIdentity(false);
  };

  const handleGenerateStory = async (topic: string, length: StoryLength) => {
    if (isGeneratingStory) return;
    setIsGeneratingStory(true);
    
    const result = await generateStory(topic, length);
    if (result) {
        handleStateChange({ 
            content: result.title, // Intro Text
            storyText: `${result.title}\n\n${result.story}`, // Main Text prepended with title
            youtubeMetadata: null // Reset metadata since story changed
        });
        // Reset audio when content changes
        handleStateChange({ introAudioUrl: null, mainAudioUrl: null });
    }
    
    setIsGeneratingStory(false);
  };

  const handleGenerateSpeech = async (voice: VoiceName) => {
    if (isGeneratingSpeech) return;
    setIsGeneratingSpeech(true);

    // Generate Intro (Title) Audio
    const introUrl = state.content ? await generateSpeech(state.content, voice) : null;
    
    // Generate Main (Story) Audio
    const mainUrl = state.storyText ? await generateSpeech(state.storyText, voice) : null;

    if (introUrl || mainUrl) {
        handleStateChange({ 
            introAudioUrl: introUrl,
            mainAudioUrl: mainUrl,
            showAudioBadge: true 
        });
    }

    setIsGeneratingSpeech(false);
  };

  const handleGenerateYouTubeMetadata = async () => {
     if(isGeneratingMetadata || !state.storyText) return;
     setIsGeneratingMetadata(true);

     const metadata = await generateYouTubeMetadata(state.storyText);
     if(metadata) {
         handleStateChange({ youtubeMetadata: metadata });
     }

     setIsGeneratingMetadata(false);
  };

  const handlePreviewVoice = async (voice: VoiceName) => {
    const sampleText = `Hi, I'm ${voice}. This is how I sound.`;
    const url = await generateSpeech(sampleText, voice);
    if (url) {
        const audio = new Audio(url);
        audio.play();
    }
  };

  const handleDownloadImage = useCallback(async () => {
    if (cardRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(cardRef.current, { 
            pixelRatio: 2,
            backgroundColor: isTransparent ? undefined : bgColor 
        });
        const link = document.createElement('a');
        link.download = `social-post-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to download image', err);
        alert('Could not download image. Please try again.');
      }
    }
  }, [bgColor, isTransparent]);

  const handleDownloadAudio = useCallback(() => {
    if (state.mainAudioUrl) {
        const link = document.createElement('a');
        link.href = state.mainAudioUrl;
        link.download = `story-audio-${Date.now()}.wav`;
        link.click();
    }
  }, [state.mainAudioUrl]);

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-950 text-white">
      {/* Editor Sidebar */}
      <div className="order-2 md:order-1 flex-shrink-0 z-20 shadow-xl">
        <EditorControls 
          state={state} 
          onChange={handleStateChange}
          onGenerate={handleGenerate}
          onGenerateIdentity={handleGenerateIdentity}
          onGenerateStory={handleGenerateStory}
          onGenerateSpeech={handleGenerateSpeech}
          onGenerateYouTubeMetadata={handleGenerateYouTubeMetadata}
          onGenerateBackgroundVideo={() => {}} // No-op since video removed
          onPreviewVoice={handlePreviewVoice}
          onDownloadImage={handleDownloadImage}
          onDownloadAudio={handleDownloadAudio}
          isGenerating={isGenerating}
          isGeneratingIdentity={isGeneratingIdentity}
          isGeneratingStory={isGeneratingStory}
          isGeneratingSpeech={isGeneratingSpeech}
          isGeneratingMetadata={isGeneratingMetadata}
          audioUrl={state.mainAudioUrl}
          setBgColor={setBgColor}
          bgColor={bgColor}
          isTransparent={isTransparent}
          setTransparent={setIsTransparent}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>

      {/* Preview Area */}
      <div className="flex-1 order-1 md:order-2 relative bg-gray-950 overflow-auto flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
            style={{ 
                backgroundImage: 'radial-gradient(circle at 1px 1px, #333 1px, transparent 0)', 
                backgroundSize: '24px 24px' 
            }} 
        />
        
        <div className="relative shadow-2xl rounded-lg overflow-hidden ring-1 ring-white/10 animate-in fade-in zoom-in duration-300">
           <CardPreview 
            ref={cardRef} 
            data={state} 
            bgColor={isTransparent ? 'transparent' : bgColor}
           />
       </div>
      </div>
    </div>
  );
};

export default App;
