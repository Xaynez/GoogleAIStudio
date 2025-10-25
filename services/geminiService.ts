

import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import type { ListingAnalysis, UserProfile, PostType, Message, FeedItem, TranslatableContent, Translation, TranscriptionSettings, TranscriptionResult } from '../types';
import { CURRENCIES } from '../constants';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY!});

/**
 * Encodes raw bytes into a Base64 string.
 * @param bytes The Uint8Array to encode.
 * @returns The Base64 encoded string.
 */
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        listingSummary: { type: Type.STRING, description: "A concise, professional summary of the business listing, highlighting key aspects like industry, location, and unique selling points." },
        voiceSummary: { type: Type.STRING, description: "A very brief, one-sentence summary suitable for text-to-speech, capturing the absolute essence of the opportunity." },
        verification: {
            type: Type.OBJECT,
            properties: {
                status: { type: Type.STRING, enum: ["Verified", "Unverified", "Requires Review"], description: "Overall verification status based on the provided text. 'Verified' if details are consistent and seem legitimate. 'Requires Review' if there are minor inconsistencies. 'Unverified' if there are major red flags." },
                flags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of potential red flags or points of concern found in the listing (e.g., 'Minimal documentation', 'Vague financial claims', 'Anonymous contact method')."
                },
            },
            required: ['status', 'flags'],
        },
        financials: {
            type: Type.OBJECT,
            properties: {
                priceOriginal: { type: Type.NUMBER, description: "The asking price as a number." },
                currency: { type: Type.STRING, description: "The 3-letter currency code (e.g., USD, EUR)." },
                priceConverted: {
                    type: Type.OBJECT,
                    description: `An object containing the asking price converted to other major currencies: ${CURRENCIES.join(', ')}. The keys should be the currency codes and values the converted amounts.`,
                    properties: CURRENCIES.reduce((acc, curr) => ({...acc, [curr]: { type: Type.NUMBER } }), {})
                },
                predictedROI: { type: Type.STRING, description: "A brief, high-level prediction of the potential Return on Investment (e.g., 'High growth potential', 'Stable, long-term returns')." },
            },
            required: ['priceOriginal', 'currency', 'priceConverted', 'predictedROI'],
        },
        suggestedMatches: {
            type: Type.ARRAY,
            description: "A list of 2-3 hypothetical suggested user matches from the EVOLVE network who would be a good fit for this opportunity.",
            items: {
                type: Type.OBJECT,
                properties: {
                    userID: { type: Type.STRING, description: "A unique mock user ID (e.g., 'USR-12345')." },
                    userName: { type: Type.STRING, description: "The user's full name." },
                    matchScore: { type: Type.NUMBER, description: "A score from 0.0 to 1.0 indicating the strength of the match." },
                    reason: { type: Type.STRING, description: "A brief, one-sentence justification for why this user is a good match." },
                    profile: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING, description: "The user's primary location." },
                            industry: { type: Type.STRING, description: "The user's primary industry." },
                            title: { type: Type.STRING, description: "The user's job title." },
                        },
                        required: ['location', 'industry', 'title'],
                    },
                },
                required: ['userID', 'userName', 'matchScore', 'reason', 'profile'],
            },
        },
        recommendedActions: {
            type: Type.ARRAY,
            description: "A list of 3-5 concrete, actionable next steps for the user considering this listing (e.g., 'Request NDA from seller', 'Perform preliminary market analysis', 'Schedule initial call').",
            items: { type: Type.STRING },
        },
        location: {
            type: Type.OBJECT,
            properties: {
                address: { type: Type.STRING, description: "The full address or city/state/country mentioned in the listing." },
                lat: { type: Type.NUMBER, description: "The estimated latitude." },
                lng: { type: Type.NUMBER, description: "The estimated longitude." },
            },
            required: ['address', 'lat', 'lng'],
        },
        healthScore: {
            type: Type.OBJECT,
            properties: {
                score: { type: Type.NUMBER, description: "An overall 'Listing Health Score' from 0 to 100, representing the quality and completeness of the listing based on clarity, completeness, and transparency." },
                details: {
                    type: Type.ARRAY,
                    description: "A breakdown of the score based on key metrics.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            metric: { type: Type.STRING, description: "The metric being evaluated (e.g., 'Financial Clarity', 'Contact Info', 'Documentation')." },
                            score: { type: Type.NUMBER, description: "The score for this metric from 0.0 to 1.0." },
                            weighting: { type: Type.NUMBER, description: "The weighting of this metric in the overall score, from 0.0 to 1.0." },
                        },
                        required: ['metric', 'score', 'weighting'],
                    }
                }
            },
            required: ['score', 'details'],
        }
    },
    required: ['listingSummary', 'voiceSummary', 'verification', 'financials', 'suggestedMatches', 'recommendedActions', 'location', 'healthScore'],
};

export const analyzeListingWithGemini = async (listingText: string): Promise<ListingAnalysis> => {
    const prompt = `
        Analyze the following business listing and extract the required information in JSON format.
        The user is an executive looking for business opportunities.
        Your analysis should be sharp, insightful, and tailored for a professional audience.
        Ensure all fields in the schema are populated. For location, provide a reasonable lat/lng estimate if only a city/state is given.
        For priceConverted, perform approximate currency conversions from the original price.
        For suggestedMatches, invent realistic-looking potential partners from a hypothetical network.
        For healthScore, critically evaluate the listing's quality based on clarity, detail, and transparency. A listing with vague details, no documents, and unclear financials should have a very low score (under 40). A detailed, clear, and well-documented listing should have a high score (over 80).

        Listing Text:
        ---
        ${listingText}
        ---
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            }
        });
        
        const jsonText = response.text;
        const analysisResult = JSON.parse(jsonText);
        
        if (!analysisResult.listingSummary || !analysisResult.financials) {
            throw new Error("Analysis result is missing key fields.");
        }

        return analysisResult as ListingAnalysis;
    } catch (error) {
        console.error("Error analyzing listing with Gemini:", error);
        throw new Error("Failed to analyze the listing. The AI model may be temporarily unavailable.");
    }
};

export const enhanceSummaryWithGemini = async (profileData: Partial<UserProfile>): Promise<string> => {
    const prompt = `
        You are a professional resume and profile writer.
        Based on the following user profile data, write an enhanced, professional summary paragraph.
        The summary should be engaging, concise (2-4 sentences), and highlight the user's key strengths and expertise.
        Do not use markdown or any special formatting.

        Profile Data:
        - Current Role: ${profileData.jobTitle}
        - Current Summary: "${profileData.summary?.originalText}"
        - Industries: ${profileData.industries?.join(', ')}
        - Interests: ${profileData.interests?.join(', ')}

        Generate the enhanced summary:
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error enhancing summary:", error);
        throw new Error("Failed to enhance summary.");
    }
};

export const translateTextWithGemini = async (text: string, targetLanguage: string): Promise<string> => {
    const prompt = `
        Translate the following text into ${targetLanguage}.
        Provide only the translated text, without any additional explanations, formatting, or quotation marks.

        Text to translate:
        ---
        ${text}
        ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error translating text to ${targetLanguage}:`, error);
        throw new Error("Failed to translate text.");
    }
};

export const translateBatchWithGemini = async (
    contentItems: { contentId: string; text: string }[],
    targetLocale: string
): Promise<Record<string, { text: string; confidence: number }>> => {
    const contentItemsJson = JSON.stringify(contentItems.map(item => ({ contentId: item.contentId, text: item.text })), null, 2);

    const prompt = `
You are an expert localization specialist. Your task is to translate a batch of content chunks for the EVOLVE social platform into the target language: ${targetLocale}.

**CRITICAL INSTRUCTIONS:**
1.  **PRESERVE ALL MARKUP:** You MUST preserve all original HTML tags (e.g., \`<b>\`, \`<i>\`, \`<br>\`, \`<p>\`) and Markdown syntax (e.g., \`**bold**\`, \`*italic*\`, URLs, and newlines \`\\n\`). Do NOT translate the tags themselves or the content of URLs.
2.  **MAINTAIN CONTEXT:** The content is for a professional, business-oriented social network. Translations must be accurate, natural, and maintain a professional tone.
3.  **HANDLE SPECIAL ENTITIES:**
    *   **Do NOT translate placeholders:** Any text inside double curly braces (e.g., \`{{user_name}}\`, \`{{count}}\`) are dynamic placeholders and must be preserved exactly as they are.
    *   **Preserve Emojis:** All emojis must be kept in their original positions.
    *   **Do NOT translate currency symbols or numeric formats** unless explicitly part of a natural language phrase.
4.  **STRICT JSON OUTPUT:** Your entire response must be ONLY a single, valid JSON object.
    *   The keys of the JSON object MUST be the \`contentId\`s from the input.
    *   The values MUST be an object containing two keys: \`"text"\` (the translated string) and \`"confidence"\` (a number between 0.0 and 1.0 representing your confidence).
    *   Do NOT include any extra text, explanations, apologies, or markdown formatting (like \`\`\`json\`) around the JSON object.

**CONTENT TO TRANSLATE (Input):**
\`\`\`json
${contentItemsJson}
\`\`\`

**EXPECTED JSON OUTPUT (Example):**
\`\`\`json
{
  "contentId-1": {
    "text": "Translated text for item 1...",
    "confidence": 0.95
  },
  "contentId-2": {
    "text": "Translated text for item 2 with <b>HTML</b> preserved...",
    "confidence": 0.88
  }
}
\`\`\`
`;

    try {
        // --- MOCK IMPLEMENTATION FOR DEMO ---
        // In a real scenario, you would make the API call:
        // const response = await ai.models.generateContent({
        //     model: "gemini-2.5-pro",
        //     contents: prompt,
        //     config: { responseMimeType: "application/json" }
        // });
        // const jsonText = response.text;
        // return JSON.parse(jsonText);

        console.log("Simulating Gemini Batch Translation for locale:", targetLocale, "with prompt:", prompt);
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

        const mockResponse: Record<string, { text: string, confidence: number }> = {};
        for (const item of contentItems) {
            // Simple mock: reverse text and add locale
            mockResponse[item.contentId] = {
                text: `[${targetLocale}] ${item.text.split('').reverse().join('')}`,
                confidence: Math.random() * (0.99 - 0.7) + 0.7 // Random confidence between 0.7 and 0.99
            };
        }
        
        // Add some real translations for demo purposes
        const knownItemPost1 = contentItems.find(item => item.contentId === 'post-1_content');
        if (knownItemPost1 && targetLocale === 'es-ES') {
             mockResponse[knownItemPost1.contentId] = {
                text: 'Emocionado de compartir nuestro informe de ganancias del T3. Hemos visto un crecimiento increíble en los mercados emergentes, impulsado por nuestra nueva línea de productos. ¡Un enorme agradecimiento a todo el equipo por su arduo trabajo y dedicación!',
                confidence: 0.98
             };
        }
        const knownItemTeaser2 = contentItems.find(item => item.contentId === 'teaser-2_title');
        if (knownItemTeaser2 && targetLocale === 'es-ES') {
             mockResponse[knownItemTeaser2.contentId] = {
                text: 'Marca Rentable de Comercio Electrónico de Artículos para el Hogar',
                confidence: 0.99
            };
        }
        const knownItemPost5 = contentItems.find(item => item.contentId === 'post-5_content');
         if (knownItemPost5 && targetLocale === 'en-US') {
             mockResponse[knownItemPost5.contentId] = {
                text: 'The optimization of the Europe supply chain is facing unique challenges due to regulatory fragmentation. Our latest AI models show a 15% efficiency improvement in consolidating cross-border shipping.',
                confidence: 0.55
            };
        }

        return mockResponse;
        
    } catch (error) {
        console.error("Error in translateBatchWithGemini:", error);
        throw new Error("Failed to translate content batch.");
    }
};


export const summarizeMeetingNotesWithGemini = async (notes: string, context: string, targetLanguage: string = 'English'): Promise<string> => {
    const prompt = `
        You are an expert at summarizing meeting notes.
        The following notes were taken during a business meeting.
        The main context for the meeting is: "${context}".

        Please produce a concise, professional summary of the meeting based on the notes provided, written in ${targetLanguage}.
        The summary should be in bullet points, highlighting key decisions, action items, and next steps.
        Do not use markdown.

        Meeting Notes:
        ---
        ${notes}
        ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing meeting notes:", error);
        throw new Error("Failed to summarize meeting notes.");
    }
};

export const generateSpeechWithGemini = async (textToSpeak: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("API did not return audio data.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};

export const generateImageWithImagen = async (prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: { 
                numberOfImages: 1,
                outputMimeType: 'image/png',
            }
        });

        if (response.generatedImages.length === 0 || !response.generatedImages[0].image.imageBytes) {
             throw new Error("API did not return an image.");
        }
        
        return response.generatedImages[0].image.imageBytes;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image.");
    }
};

export const generateStreetViewImage = async (locationName: string): Promise<string> => {
    const prompt = `A photorealistic, street-level photograph of ${locationName}. Clear day, modern look. High resolution, 16:9 aspect ratio.`;
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '16:9',
            }
        });

        if (response.generatedImages.length === 0 || !response.generatedImages[0].image.imageBytes) {
            throw new Error("API did not return an image.");
        }

        return response.generatedImages[0].image.imageBytes;
    } catch (error) {
        console.error("Error generating street view image:", error);
        throw new Error("Failed to generate street view image.");
    }
};


export const editImageWithGemini = async (base64ImageData: string, mimeType: string, prompt: string): Promise<{ text?: string, imageBase64?: string, imageMimeType?: string }> => {
    try {
        const imagePart = { inlineData: { data: base64ImageData, mimeType: mimeType } };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: { responseModalities: [Modality.IMAGE] },
        });
        
        let textResponse: string | undefined;
        let imageBase64: string | undefined;
        let imageMimeType: string | undefined;

        if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    imageMimeType = part.inlineData.mimeType;
                } else if ('text' in part && part.text) {
                    textResponse = part.text;
                }
            }
        }
        
        if (!imageBase64) {
            throw new Error("API did not return an edited image.");
        }

        return { text: textResponse, imageBase64, imageMimeType };
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image.");
    }
};

export const generateVideos = async (params: { 
    model: string, 
    prompt: string, 
    image?: { imageBytes: string, mimeType: string },
    config: { resolution: string, aspectRatio: string, numberOfVideos: number }
}) => {
    try {
        // Create new instance for Veo as per guidelines
        const videoAI = new GoogleGenAI({apiKey: process.env.API_KEY!});
        let operation = await videoAI.models.generateVideos({
            model: params.model,
            prompt: params.prompt,
            image: params.image,
            config: params.config
        });
        return operation;
    } catch (error) {
        console.error("Error generating video:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
            // Special error for API key issue
            throw new Error("API_KEY_NOT_FOUND");
        }
        throw new Error("Failed to start video generation.");
    }
};

export const getVideosOperation = async (params: { operation: any }) => {
    try {
        // Create new instance for Veo as per guidelines
        const videoAI = new GoogleGenAI({apiKey: process.env.API_KEY!});
        const updatedOperation = await videoAI.operations.getVideosOperation({ operation: params.operation });
        return updatedOperation;
    } catch (error) {
        console.error("Error getting video operation status:", error);
        if (error instanceof Error && error.message.includes("Requested entity was not found.")) {
            // Special error for API key issue
            throw new Error("API_KEY_NOT_FOUND");
        }
        throw new Error("Failed to get video status.");
    }
};

export const searchWebWithGemini = async (query: string): Promise<{ text: string, sources: any[] }> => {
    const fullPrompt = `Summarize the latest information about "${query}". The summary should be a clean, well-written paragraph. Do not use any markdown like asterisks.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: { tools: [{googleSearch: {}}] },
        });
        return { 
            text: response.text, 
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
        };
    } catch (error) {
        console.error("Error with web search:", error);
        throw new Error("Failed to perform web search.");
    }
};

export const searchMapsWithGemini = async (query: string, location?: { latitude: number; longitude: number; }): Promise<{ text: string, sources: any[] }> => {
    const fullPrompt = `Find information about "${query}" on Google Maps.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                tools: [{googleMaps: {}}],
                toolConfig: location ? { retrievalConfig: { latLng: location } } : undefined
            },
        });
        return { 
            text: response.text, 
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
        };
    } catch (error) {
        console.error("Error with maps search:", error);
        throw new Error("Failed to perform maps search.");
    }
};

export const getCoordinatesForLocation = async (locationName: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Provide the approximate latitude and longitude for "${locationName}".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        lat: { type: Type.NUMBER, description: "Latitude" },
                        lng: { type: Type.NUMBER, description: "Longitude" },
                    },
                    required: ['lat', 'lng'],
                }
            }
        });
        const result = JSON.parse(response.text);
        if (typeof result.lat === 'number' && typeof result.lng === 'number') {
            return result;
        }
        return null;
    } catch (error) {
        console.error("Error getting coordinates:", error);
        return null;
    }
};

export const rewriteTextWithGemini = async (text: string, tone: 'Formal' | 'Casual' | 'Persuasive'): Promise<string> => {
    const prompt = `
        You are an expert copy editor and professional writer.
        Rewrite the following text to have a more ${tone.toLowerCase()} tone.
        Maintain the core message and meaning of the original text.
        Provide only the rewritten text, without any additional explanations, formatting, or quotation marks.

        Original Text:
        ---
        ${text}
        ---

        Rewritten Text:
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Error rewriting text with ${tone} tone:`, error);
        throw new Error("Failed to rewrite text.");
    }
};

export const suggestPostIdeasWithGemini = async (userProfile: UserProfile): Promise<string[]> => {
    const prompt = `
        You are a content strategy expert for a professional networking platform.
        Based on the user's profile, generate 3-5 concise, engaging, and relevant post ideas.
        The ideas should foster healthy, professional conversations and avoid controversial topics.
        Return the ideas as a JSON array of strings.

        User Profile:
        - Role: ${userProfile.jobTitle}
        - Industries: ${userProfile.industries.join(', ')}
        - Interests: ${userProfile.interests.join(', ')}
        
        Example output:
        ["Discuss the impact of AI on [Industry]", "Share a recent success story from your work", "Ask for book recommendations related to [Interest]"]
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } },
            }
        });
        const jsonText = response.text;
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error suggesting post ideas:", error);
        throw new Error("Failed to suggest post ideas.");
    }
};

export const generatePostContentWithGemini = async (
    topic: string, 
    userProfile: UserProfile,
    options: { postType: PostType | 'text' }
): Promise<{ postText: string; suggestedMediaType: PostType | 'text' }> => {
    const prompt = `
        You are a professional social media content creator for an executive audience on a platform called EVOLVE.
        Based on the provided topic and user profile, write a professional, engaging post.
        The post should be specifically tailored for a '${options.postType}' format. For example, if it's for an 'image' or 'video' post, the text should be concise and complementary to a visual element. If it's a 'text' post, it can be more detailed.
        The post should be well-structured, insightful, and encourage discussion.
        Also, suggest the best media type to accompany this post, even if the requested format is 'text'.
        Return the result as a JSON object with "postText" and "suggestedMediaType" keys.
        The suggestedMediaType should be one of: "image", "video", or "text" (if no media is needed).

        User Profile:
        - Role: ${userProfile.jobTitle}
        - Industries: ${userProfile.industries.join(', ')}
        - Interests: ${userProfile.interests.join(', ')}

        Topic: "${topic}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: { 
                    type: Type.OBJECT, 
                    properties: { 
                        postText: { type: Type.STRING }, 
                        suggestedMediaType: { type: Type.STRING, enum: ["image", "video", "text"] } 
                    }, 
                    required: ['postText', 'suggestedMediaType'] 
                }
            }
        });
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        if (typeof result.postText !== 'string' || typeof result.suggestedMediaType !== 'string') {
            throw new Error('Invalid JSON structure from AI');
        }
        return result;
    } catch (error) {
        console.error("Error generating post content:", error);
        throw new Error("Failed to generate post content.");
    }
};

export const summarizeConversationWithGemini = async (messages: Message[], targetLanguage: string = 'English'): Promise<string> => {
    const conversationText = messages.map(m => `${m.senderName}: ${m.text.originalText}`).join('\n');
    const prompt = `
        Summarize the following conversation into 2-3 key bullet points.
        Please produce the summary in ${targetLanguage}.
        
        Conversation:
        ---
        ${conversationText}
        ---
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error summarizing conversation:", error);
        throw new Error("Failed to summarize conversation.");
    }
};

export const cleanupTranscriptionWithGemini = async (rawText: string): Promise<string> => {
    if (!rawText.trim()) {
        return "";
    }
    const prompt = `
        You are an expert editor for a professional social media platform.
        Correct any grammar, spelling, and punctuation errors in the following text, which was generated by a voice-to-text service.
        Make the text coherent and readable, suitable for a post, comment, or reply.
        Ensure the core meaning of the text is preserved.
        Do not add any extra explanations, formatting, or quotation marks. Respond only with the cleaned-up text.

        Raw Text:
        ---
        ${rawText}
        ---

        Cleaned-up Text:
    `;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error cleaning up transcription:", error);
        // Fallback to raw text if AI cleanup fails
        return rawText;
    }
};

export const translateMessageWithGemini = async (text: string, targetLanguage: string): Promise<string> => {
    // This function is identical to translateTextWithGemini but is contextually for messaging.
    return translateTextWithGemini(text, targetLanguage);
};

export const transcribeAudioWithGemini = async (audioBlob: Blob, settings: TranscriptionSettings): Promise<TranscriptionResult> => {
    try {
        // 1. Decode and Resample audio to 16kHz mono PCM
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = await audioBlob.arrayBuffer();
        const decodedBuffer = await audioContext.decodeAudioData(arrayBuffer);

        const targetSampleRate = 16000;
        let pcmData: Float32Array;

        if (decodedBuffer.sampleRate === targetSampleRate) {
            // No resampling needed, just mix to mono if necessary
            if (decodedBuffer.numberOfChannels > 1) {
                const ch0 = decodedBuffer.getChannelData(0);
                const ch1 = decodedBuffer.getChannelData(1);
                pcmData = new Float32Array(ch0.length);
                for (let i = 0; i < ch0.length; i++) {
                    pcmData[i] = (ch0[i] + ch1[i]) / 2;
                }
            } else {
                pcmData = decodedBuffer.getChannelData(0);
            }
        } else {
            // Resample using OfflineAudioContext
            const duration = decodedBuffer.duration;
            const offlineContext = new OfflineAudioContext(1, Math.ceil(duration * targetSampleRate), targetSampleRate);
            const source = offlineContext.createBufferSource();
            source.buffer = decodedBuffer;
            source.connect(offlineContext.destination);
            source.start(0);
            const resampledBuffer = await offlineContext.startRendering();
            pcmData = resampledBuffer.getChannelData(0);
        }

        // 2. Convert Float32 PCM to Int16 and then to base64
        const l = pcmData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = Math.max(-32768, Math.min(32767, pcmData[i] * 32768));
        }
        const base64Audio = encode(new Uint8Array(int16.buffer));

        // 3. Build prompt and schema for Gemini API
        let promptText = `Transcribe this audio into the language with locale code '${settings.language}'.`;
        if (settings.addPunctuation) {
            promptText += ' Ensure proper punctuation, capitalization, and paragraph breaks for readability.';
        }
        if (settings.summarize) {
            promptText += ' After the full transcription, provide a concise one-paragraph summary of the content.';
        }
        promptText += ' Respond ONLY with a valid JSON object.';

        const audioPart = {
            inlineData: {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio,
            },
        };
        const textPart = {
            text: promptText,
        };
        
        const schemaProperties: any = {
             transcription: { type: Type.STRING, description: "The full, verbatim transcription of the audio." }
        };
        if (settings.summarize) {
            schemaProperties.summary = { type: Type.STRING, description: "A concise summary of the transcription." };
        }

        const transcriptionSchema = {
            type: Type.OBJECT,
            properties: schemaProperties,
            required: ['transcription']
        };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [audioPart, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: transcriptionSchema,
            }
        });

        const jsonResponse = JSON.parse(response.text);
        
        return {
            transcription: jsonResponse.transcription || "No transcription available.",
            summary: jsonResponse.summary || undefined
        };

    } catch (error) {
        console.error("Error transcribing audio:", error);
        throw new Error("Failed to process and transcribe audio.");
    }
};

export const rankFeedItems = async (items: FeedItem[], userProfile: UserProfile): Promise<FeedItem[]> => {
    /**
     * This function simulates a server-side Gemini-powered feed ranking algorithm.
     * It uses a weighted scoring model based on user profile, item properties, and business logic.
     *
     * For this simulation:
     * - Live items get a massive boost to pin them to the top.
     * - Promoted/Sponsored items get a high score.
     * - Opportunities get a moderate score boost.
     * - Posts from verified authors get a trust score boost.
     * - Newer items get a recency boost.
     * - Items with more engagement get a boost.
     */
    const now = new Date().getTime();

    const getScore = (item: FeedItem): number => {
        let score = 0;

        // Weightings
        const liveBoost = 1000;
        const relevanceWeight = 0.3;
        const trustWeight = 0.25;
        const recencyWeight = 0.2;
        const engagementWeight = 0.15;
        const promotionWeight = 0.4; // Higher weight to ensure promoted content is visible

        if ('content' in item) { // It's a Post
            // Pin live posts to the top
            if (item.isLive) {
                score += liveBoost;
            }

            // w1 * relevance - simple tag matching for simulation
            const matchingTags = item.tags?.filter(tag => userProfile.interests.some(interest => tag.toLowerCase().includes(interest.toLowerCase()))).length || 0;
            score += matchingTags * relevanceWeight;
            
            // w2 * trustScore - boost for verified authors
            if (item.author.verified) {
                score += userProfile.trustScore / 100 * trustWeight;
            }

            // w3 * recencyBoost - higher score for newer posts (decays over 7 days)
            const ageInHours = (now - new Date(item.timestamp).getTime()) / (1000 * 60 * 60);
            const recencyBoost = Math.max(0, 1 - (ageInHours / (24 * 7)));
            score += recencyBoost * recencyWeight;
            
            // w4 * engagementSignal
            const reactionsCount = (item.analytics.allReactions || []).length;
            const engagement = reactionsCount + item.analytics.comments * 2; // Comments are weighted more
            score += Math.log1p(engagement) * engagementWeight;

            // w5 * promotion
            if (item.isSponsored) {
                score += promotionWeight;
            }
        } else if (item.itemType === 'opportunity') { // It's an OpportunityTeaser
            // relevance
            if (userProfile.interests.includes(item.category)) {
                score += relevanceWeight * 2; // High relevance if category matches interest
            }
            // Give opportunities a base trust and engagement score to compete
            score += trustWeight * 0.8;
            score += engagementWeight * 0.5;
            // Opportunities are always recent
            score += recencyWeight;
        }

        return score;
    };

    const sortedItems = [...items].sort((a, b) => getScore(b) - getScore(a));
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 1500));

    return sortedItems;
};