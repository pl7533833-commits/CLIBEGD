import React, { forwardRef } from 'react';
import { SocialCardState } from '../types';
import { BadgeCheck, MessageSquare, Heart, Eye, Play } from 'lucide-react';

interface CardPreviewProps {
  data: SocialCardState;
  bgColor: string; // The "canvas" background color
}

const RedditIcon = ({ color }: { color: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className="w-full h-full" style={{ color }}>
    <path fillRule="evenodd" d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm0 1.25a8.75 8.75 0 100 17.5 8.75 8.75 0 000-17.5zM13.44 11.5c.34 0 .66.12.91.34.25-.22.56-.34.91-.34a1.37 1.37 0 110 2.74c-.35 0-.67-.12-.91-.34-.25.22-.56.34-.91.34a1.37 1.37 0 110-2.74zm-6.88 0c.34 0 .66.12.91.34.25-.22.56-.34.91-.34a1.37 1.37 0 110 2.74c-.35 0-.67-.12-.91-.34-.25.22-.56.34-.91.34a1.37 1.37 0 110-2.74zM10 6.25c-2.4 0-4.46 1.73-4.94 4.02h9.88C14.46 7.98 12.4 6.25 10 6.25z" clipRule="evenodd" />
    <circle cx="5" cy="10" r="1.5" fill="white"/>
    <circle cx="15" cy="10" r="1.5" fill="white"/>
    <path d="M10 13c-2 0-3.5 1-3.5 1s1.5 1 3.5 1 3.5-1 3.5-1-1.5-1-3.5-1z" fill="white"/>
     <path fillRule="evenodd" d="M17.92 9.07a2.26 2.26 0 0 1-1.89-1.89c-.1-.53-.28-1.02-.53-1.48a4.2 4.2 0 0 0-1.28-1.28 2.26 2.26 0 0 1-1.89-1.89 2.26 2.26 0 0 1-1.89 1.89 4.2 4.2 0 0 0-1.48.53 2.26 2.26 0 0 1-1.89 1.89 2.26 2.26 0 0 1 1.89 1.89c.1.53.28 1.02.53 1.48.37.66.86 1.1 1.28 1.28a2.26 2.26 0 0 1 1.89 1.89 2.26 2.26 0 0 1 1.89-1.89c.53-.1 1.02-.28 1.48-.53a4.2 4.2 0 0 0 1.28-1.28 2.26 2.26 0 0 1 1.89-1.89z" clipRule="evenodd" opacity="0"/> 
     <circle cx="10" cy="10" r="10" fill={color}/>
     <path d="M14.6 7.2c.4 0 .7.3.7.7 0 .4-.3.7-.7.7-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7zm-9.2 0c.4 0 .7.3.7.7 0 .4-.3.7-.7.7-.4 0-.7-.3-.7-.7 0-.4.3-.7.7-.7z" fill="white"/>
      <path d="M6.5 12.5c.8 1 2.2 1.5 3.5 1.5s2.7-.5 3.5-1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
     <circle cx="16" cy="4" r="1.5" fill="white" className="origin-center -rotate-12 translate-y-1"/>
      <path d="M13.5 6.5L16 4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);


const AudioWaveform = () => (
  <div className="flex items-center gap-[2px] h-4">
    {[...Array(15)].map((_, i) => (
      <div 
        key={i} 
        className="w-[2px] bg-red-500 rounded-full animate-pulse"
        style={{ 
          height: `${Math.max(40, Math.random() * 100)}%`,
          animationDelay: `${i * 0.05}s`
        }}
      />
    ))}
  </div>
);

export const CardPreview = forwardRef<HTMLDivElement, CardPreviewProps>(({ data, bgColor }, ref) => {
  const isDark = data.theme === 'dark';

  return (
    <div 
      ref={ref}
      className="p-16 flex items-center justify-center min-w-[600px] overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: bgColor }}
    >
      {/* Card Container */}
      <div className={`
        relative w-full max-w-xl rounded-3xl p-6 shadow-2xl transition-all duration-300
        ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}
      `}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Avatar / Icon */}
            <div className="relative w-12 h-12 flex-shrink-0">
               {data.avatarUrl ? (
                 <img src={data.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover border-2 border-transparent" />
               ) : (
                <div className="w-full h-full rounded-full overflow-hidden">
                    <RedditIcon color={data.accentColor} />
                </div>
               )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg leading-none tracking-tight">{data.username}</span>
                {data.isVerified && (
                  <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10" strokeWidth={2.5} />
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-0.5">
                <span>@{data.handle}</span>
                <span>•</span>
                <span>{data.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Audio Badge */}
          {data.showAudioBadge && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl border-2 border-red-500/20 bg-red-500/5">
              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <Play className="w-3 h-3 text-white ml-0.5 fill-white" />
              </div>
              <AudioWaveform />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mb-4">
           <p className={`text-xl font-bold leading-snug ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
             {data.content}
           </p>
           <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-500">
              <Eye className="w-3.5 h-3.5" />
              <span>{data.viewCount} views</span>
           </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-6 text-sm font-semibold text-gray-400">
          <div className="flex items-center gap-2 group cursor-pointer hover:text-red-500 transition-colors">
            <Heart className="w-5 h-5 group-hover:fill-red-500 transition-colors" />
            <span>{data.likeCount}</span>
          </div>
          <div className="flex items-center gap-2 group cursor-pointer hover:text-blue-500 transition-colors">
            <MessageSquare className="w-5 h-5 group-hover:fill-blue-500 transition-colors" />
            <span>{data.commentCount}</span>
          </div>
        </div>

      </div>
    </div>
  );
});

CardPreview.displayName = 'CardPreview';
