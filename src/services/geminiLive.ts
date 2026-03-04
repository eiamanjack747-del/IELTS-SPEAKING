import { GoogleGenAI, LiveServerMessage, Modality, Type } from "@google/genai";
import { handleGeminiError } from "../utils";

export interface LiveSessionCallbacks {
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: any) => void;
  onAudioData?: (base64Audio: string) => void;
  onInterrupted?: () => void;
  onTranscription?: (text: string, isUser: boolean) => void;
  onToolCall?: (call: any) => void;
}

export class GeminiLiveService {
  private ai: GoogleGenAI;
  private session: any;
  private isConnected: boolean = false;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async connect(systemInstruction: string, callbacks: LiveSessionCallbacks, voiceName: string = "Charon") {
    if (this.isConnected) return;

    this.session = await this.ai.live.connect({
      model: "gemini-2.5-flash-native-audio-preview-09-2025",
      callbacks: {
        onopen: () => {
          this.isConnected = true;
          callbacks.onOpen?.();
        },
        onclose: () => {
          this.isConnected = false;
          callbacks.onClose?.();
        },
        onerror: (error) => {
          handleGeminiError(error);
          callbacks.onError?.(error);
        },
        onmessage: async (message: LiveServerMessage) => {
          if (message.serverContent?.modelTurn?.parts) {
            for (const part of message.serverContent.modelTurn.parts) {
              if (part.inlineData?.data) {
                callbacks.onAudioData?.(part.inlineData.data);
              }
              if (part.text) {
                callbacks.onTranscription?.(part.text, false);
              }
            }
          }

          if (message.toolCall) {
            callbacks.onToolCall?.(message.toolCall);
          }

          if (message.serverContent?.interrupted) {
            callbacks.onInterrupted?.();
          }
        },
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
        systemInstruction,
        tools: [
          {
            functionDeclarations: [
              {
                name: "submitFeedback",
                description: "Submit the final IELTS speaking test feedback and band scores.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    bandScore: { type: Type.NUMBER },
                    criteria: {
                      type: Type.OBJECT,
                      properties: {
                        fluency: { type: Type.NUMBER },
                        lexical: { type: Type.NUMBER },
                        grammar: { type: Type.NUMBER },
                        pronunciation: { type: Type.NUMBER },
                      }
                    },
                    banglaFeedback: {
                      type: Type.OBJECT,
                      properties: {
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        mistakes: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              wrong: { type: Type.STRING },
                              correct: { type: Type.STRING },
                              explanation: { type: Type.STRING }
                            }
                          }
                        },
                        vocabulary: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weakAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
                        improvementPlan: { type: Type.ARRAY, items: { type: Type.STRING } },
                      }
                    },
                    stressAnalysis: {
                      type: Type.OBJECT,
                      properties: {
                        level: { type: Type.STRING },
                        advice: { type: Type.STRING },
                        metrics: {
                          type: Type.OBJECT,
                          properties: {
                            fillers: { type: Type.NUMBER },
                            pauses: { type: Type.NUMBER },
                            speed: { type: Type.NUMBER },
                          }
                        }
                      }
                    }
                  },
                  required: ["bandScore", "criteria", "banglaFeedback", "stressAnalysis"]
                }
              },
              {
                name: "startTimer",
                description: "Start a silent timer for the candidate to prepare. The app will handle the silence and notify you when time is up.",
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    durationSeconds: { type: Type.NUMBER, description: "Duration in seconds (e.g., 60)" }
                  },
                  required: ["durationSeconds"]
                }
              }
            ]
          }
        ]
      },
    });
  }

  async sendAudio(base64Data: string) {
    if (!this.session || !this.isConnected) return;
    await this.session.sendRealtimeInput({
      media: { data: base64Data, mimeType: "audio/pcm;rate=16000" },
    });
  }

  async sendText(text: string) {
    if (!this.session || !this.isConnected) return;
    // Browser-compatible base64 encoding for UTF-8 strings
    const base64 = btoa(unescape(encodeURIComponent(text)));
    await this.session.sendRealtimeInput({
      media: { mimeType: "text/plain", data: base64 }
    });
  }

  async disconnect() {
    if (this.session) {
      await this.session.close();
      this.session = null;
      this.isConnected = false;
    }
  }
}
