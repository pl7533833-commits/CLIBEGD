import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, GeneratedIdentity, GeneratedStory, VoiceName, GenderOption, StoryLength, YouTubeMetadata, ChatMessage, DirectorResponse, SocialCardState } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert base64 to Uint8Array
const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper to write string to DataView
const writeString = (view: DataView, offset: number, string: string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// Helper to add WAV header to raw PCM data
const addWavHeader = (pcmData: Uint8Array, sampleRate: number): Uint8Array => {
  const numChannels = 1;
  const bitDepth = 16;
  const byteRate = sampleRate * numChannels * (bitDepth / 8);
  const blockAlign = numChannels * (bitDepth / 8);
  const dataSize = pcmData.length;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const header = new ArrayBuffer(headerSize);
  const view = new DataView(header);

  // RIFF chunk
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  const wavFile = new Uint8Array(headerSize + dataSize);
  wavFile.set(new Uint8Array(header), 0);
  wavFile.set(pcmData, 44);

  return wavFile;
};

export const generatePostContent = async (prompt: string): Promise<GeneratedContent | null> => {
  if (!apiKey) {
    console.error("API Key is missing");
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic viral social media post.
      Topic: ${prompt || "drama"}.
      
      CRITICAL RULE: Numbers must look legitimate and mathematically realistic.
      - Views: High (e.g., 1.2M, 500K)
      - Likes: ~3-8% of views (e.g., if 100K views, ~5K likes)
      - Comments: ~2-5% of likes (e.g., if 5K likes, ~150 comments)
      - Handle: No @ symbol.
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            handle: { type: Type.STRING },
            content: { type: Type.STRING },
            viewCount: { type: Type.STRING },
            likeCount: { type: Type.STRING },
            commentCount: { type: Type.STRING },
          },
          required: ["handle", "content", "viewCount", "likeCount", "commentCount"],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GeneratedContent;
  } catch (error) {
    console.error("Error generating content:", error);
    return null;
  }
};

export const generateIdentity = async (gender: GenderOption): Promise<GeneratedIdentity | null> => {
  if (!apiKey) return null;

  const genderPrompt = gender === 'Random' ? 'random gender' : gender;

  try {
    const textResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic ${genderPrompt} social media user. Return JSON: username, handle, avatarDescription.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            username: { type: Type.STRING },
            handle: { type: Type.STRING },
            avatarDescription: { type: Type.STRING }
          },
          required: ["username", "handle", "avatarDescription"]
        }
      }
    });

    const details = JSON.parse(textResponse.text || "{}");
    
    // Fast image generation
    const imageResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `Headshot avatar, ${details.avatarDescription}, high quality, realistic, ${genderPrompt}, professional photography` }]
      },
    });

    let avatarUrl = "";
    if (imageResponse.candidates?.[0]?.content?.parts) {
        for (const part of imageResponse.candidates[0].content.parts) {
            if (part.inlineData) {
                avatarUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
            }
        }
    }

    return {
        username: details.username,
        handle: details.handle,
        avatarUrl: avatarUrl || "" 
    };

  } catch (e) {
    console.error("Error generating identity:", e);
    return null;
  }
};

export const generateStory = async (topic: string, length: StoryLength): Promise<GeneratedStory | null> => {
  if (!apiKey) return null;

  // Adjusted lengths to be more realistic for speech duration
  // 150 words ~ 1 minute
  let lengthPrompt = "Medium length, about 200 words.";
  if (length === 'Short') lengthPrompt = "Short, about 100 words.";
  if (length === 'Medium') lengthPrompt = "Medium length, about 200 words.";
  if (length === 'Long') lengthPrompt = "Long, DETAILED, at least 300 words (aim for 2 minutes speaking time).";
  if (length === 'Extra Long') lengthPrompt = "Very Long, DETAILED, at least 450 words (aim for 3 minutes speaking time).";

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a viral, dramatic, first-person social media story.
      Focus themes: Cheating, winning the lottery, getting revenge, finding a secret safe, workplace scandals, or family betrayal.
      Topic context: "${topic}".
      
      Requirements:
      1. 'title': Clickbait style, max 15 words. (e.g., "AITA for divorcing my wife after she won the lottery?")
      2. 'story': The script. First person "I". Conversational, dramatic, slightly messy, sounds like a real person venting.
      IMPORTANT: Keep the story dramatic but SAFE FOR WORK. Avoid explicit violence, hate speech, or sexually explicit descriptions to ensure audio generation is permitted.
      
      LENGTH REQUIREMENT: ${lengthPrompt}
      
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            story: { type: Type.STRING }
          },
          required: ["title", "story"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as GeneratedStory;
  } catch (e) {
    console.error("Error generating story:", e);
    return null;
  }
};

export const generateSpeech = async (text: string, voice: VoiceName): Promise<string | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read the following text aloud exactly as written: """${text}"""` }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const pcmData = base64ToUint8Array(base64Audio);
      const wavData = addWavHeader(pcmData, 24000);
      const blob = new Blob([wavData], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    }
    
    if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
        console.error("Model returned text instead of audio:", response.candidates[0].content.parts[0].text);
    }
    
    return null;
  } catch (e) {
    console.error("Error generating speech:", e);
    return null;
  }
};

export const generateYouTubeMetadata = async (storyText: string): Promise<YouTubeMetadata | null> => {
  if (!apiKey) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate viral YouTube Video Metadata for the following story.
      
      STORY: "${storyText}"

      REQUIREMENTS:
      1. TITLE: Extremely clickbait, HIGH EMOJI USAGE, Capitalize KEY WORDS for emphasis. Style: "💔📹 I CAUGHT My Wife... | AITA?".
      2. DESCRIPTION: Dramatic summary with paragraphs. Use Emojis in the description too. End with "👇 You decide.".
      3. TAGS: Include 10-15 viral hashtags at the bottom of the description.

      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as YouTubeMetadata;
  } catch (e) {
    console.error("Error generating metadata:", e);
    return null;
  }
};

export const chatWithDirector = async (
  history: ChatMessage[], 
  newMessage: string, 
  currentState: SocialCardState
): Promise<DirectorResponse | null> => {
  if (!apiKey) return null;

  const systemInstruction = `
  You are the AI Director for a "Viral Social Media Post Creator" app.
  Your job is to assist the user in creating a social media image/story.
  
  You have full control over the application state. You can update any field in the "SocialCardState".
  
  CURRENT STATE CONTEXT:
  - Username: ${currentState.username}
  - Story Title: ${currentState.content}
  - Theme: ${currentState.theme}
  
  USER REQUEST: "${newMessage}"
  
  INSTRUCTIONS:
  1. Analyze the user's request.
  2. If they ask to write a story, generate a title (content) and the full story (storyText).
  3. If they ask to change colors, theme, or visuals, update the relevant fields (accentColor, theme, etc.).
  4. If they ask to change the identity, update username/handle.
  
  OUTPUT FORMAT (JSON):
  {
    "message": "A friendly response to the user explaining what you did.",
    "updates": { ... any fields of SocialCardState to update ... },
    "shouldGenerateAudio": boolean (true if you changed the storyText and think audio should be regenerated)
  }
  
  Example:
  User: "Make it a dark theme horror story about a clown."
  Response:
  {
    "message": "I've switched to dark mode and drafted a spooky story about a clown encounter. 🤡",
    "updates": {
      "theme": "dark",
      "accentColor": "#ef4444",
      "content": "I found a clown doll in my attic... it moved.",
      "storyText": "I found a clown doll in my attic. I swear I left it on the shelf, but the next morning it was on my bed..."
    },
    "shouldGenerateAudio": true
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: newMessage,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
             message: { type: Type.STRING },
             updates: { 
                 type: Type.OBJECT,
                 properties: {
                     username: { type: Type.STRING },
                     handle: { type: Type.STRING },
                     content: { type: Type.STRING },
                     storyText: { type: Type.STRING },
                     theme: { type: Type.STRING },
                     accentColor: { type: Type.STRING },
                     viewCount: { type: Type.STRING },
                     likeCount: { type: Type.STRING },
                     commentCount: { type: Type.STRING },
                     isVerified: { type: Type.BOOLEAN }
                 }
             },
             shouldGenerateAudio: { type: Type.BOOLEAN }
          },
          required: ["message"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text) as DirectorResponse;

  } catch (e) {
    console.error("Director Chat Error:", e);
    return null;
  }
};
