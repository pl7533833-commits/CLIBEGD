
export interface SocialCardState {
  avatarUrl: string;
  username: string;
  handle: string;
  isVerified: boolean;
  viewCount: string;
  timestamp: string;
  content: string; // The visual title on the card (Intro Text)
  storyText: string; // The long form story for audio (Main Text)
  likeCount: string;
  commentCount: string;
  showAudioBadge: boolean;
  theme: 'light' | 'dark';
  accentColor: string;
  introAudioUrl: string | null;
  mainAudioUrl: string | null;
  youtubeMetadata: YouTubeMetadata | null;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface DirectorResponse {
  message: string;
  updates?: Partial<SocialCardState>;
  shouldGenerateAudio?: boolean;
}

export interface YouTubeMetadata {
  title: string;
  description: string;
}

export interface GeneratedContent {
  handle: string;
  content: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface GeneratedIdentity {
  username: string;
  handle: string;
  avatarUrl: string;
}

export interface GeneratedStory {
  title: string;
  story: string;
}

export const VOICE_DATA = [
  { name: 'Puck', gender: 'Male', style: 'Energetic' },
  { name: 'Charon', gender: 'Male', style: 'Deep/Narrator' },
  { name: 'Kore', gender: 'Female', style: 'Calm/Soothing' },
  { name: 'Fenrir', gender: 'Male', style: 'Intense' },
  { name: 'Zephyr', gender: 'Female', style: 'Soft' },
] as const;

export type VoiceName = typeof VOICE_DATA[number]['name'];

export type GenderOption = 'Random' | 'Male' | 'Female';
export type StoryLength = 'Short' | 'Medium' | 'Long' | 'Extra Long';
