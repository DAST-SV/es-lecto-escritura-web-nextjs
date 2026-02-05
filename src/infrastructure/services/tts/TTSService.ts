/**
 * UBICACIÓN: src/infrastructure/services/tts/TTSService.ts
 * ✅ Servicio de Text-to-Speech usando Web Speech API
 * Soporta múltiples idiomas y velocidades
 */

export type TTSLanguage = 'es' | 'en' | 'fr' | 'pt' | 'de' | 'it';

export interface TTSVoice {
  name: string;
  lang: string;
  localService: boolean;
  voiceURI: string;
}

export interface TTSOptions {
  /** Idioma de la voz (es, en, fr, etc.) */
  language: TTSLanguage;
  /** Velocidad de lectura (0.5 - 2.0, default: 1.0) */
  rate?: number;
  /** Tono de voz (0 - 2, default: 1.0) */
  pitch?: number;
  /** Volumen (0 - 1, default: 1.0) */
  volume?: number;
  /** Nombre específico de voz (opcional) */
  voiceName?: string;
}

export interface TTSEvents {
  onStart?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onError?: (error: string) => void;
  onBoundary?: (charIndex: number, charLength: number) => void;
}

// Mapeo de códigos de idioma a códigos BCP 47
const LANGUAGE_MAP: Record<TTSLanguage, string[]> = {
  es: ['es-ES', 'es-MX', 'es-US', 'es'],
  en: ['en-US', 'en-GB', 'en'],
  fr: ['fr-FR', 'fr-CA', 'fr'],
  pt: ['pt-BR', 'pt-PT', 'pt'],
  de: ['de-DE', 'de'],
  it: ['it-IT', 'it'],
};

export class TTSService {
  private static instance: TTSService | null = null;
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isReady: boolean = false;
  private readyPromise: Promise<void> | null = null;

  private constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.readyPromise = this.loadVoices();
    }
  }

  /**
   * Obtiene la instancia singleton del servicio
   */
  static getInstance(): TTSService {
    if (!TTSService.instance) {
      TTSService.instance = new TTSService();
    }
    return TTSService.instance;
  }

  /**
   * Carga las voces disponibles
   */
  private async loadVoices(): Promise<void> {
    if (!this.synth) return;

    return new Promise((resolve) => {
      const loadVoicesInternal = () => {
        this.voices = this.synth!.getVoices();
        if (this.voices.length > 0) {
          this.isReady = true;
          console.log(`🔊 TTS: ${this.voices.length} voces disponibles`);
          resolve();
        }
      };

      // Intentar cargar inmediatamente
      loadVoicesInternal();

      // Si no hay voces, esperar al evento
      if (this.voices.length === 0 && this.synth) {
        this.synth.onvoiceschanged = () => {
          loadVoicesInternal();
        };

        // Timeout por si el evento nunca se dispara
        setTimeout(() => {
          if (!this.isReady) {
            loadVoicesInternal();
            if (!this.isReady) {
              console.warn('⚠️ TTS: No se pudieron cargar las voces');
            }
            resolve();
          }
        }, 2000);
      }
    });
  }

  /**
   * Espera a que el servicio esté listo
   */
  async waitForReady(): Promise<boolean> {
    if (this.readyPromise) {
      await this.readyPromise;
    }
    return this.isReady;
  }

  /**
   * Verifica si TTS está soportado
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  /**
   * Obtiene las voces disponibles para un idioma
   */
  getVoicesForLanguage(language: TTSLanguage): TTSVoice[] {
    const langCodes = LANGUAGE_MAP[language] || [language];

    return this.voices
      .filter((voice) =>
        langCodes.some((code) => voice.lang.startsWith(code.split('-')[0]))
      )
      .map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        voiceURI: voice.voiceURI,
      }));
  }

  /**
   * Obtiene todos los idiomas disponibles
   */
  getAvailableLanguages(): TTSLanguage[] {
    const available: TTSLanguage[] = [];

    for (const lang of Object.keys(LANGUAGE_MAP) as TTSLanguage[]) {
      if (this.getVoicesForLanguage(lang).length > 0) {
        available.push(lang);
      }
    }

    return available;
  }

  /**
   * Selecciona la mejor voz para un idioma
   */
  private getBestVoice(language: TTSLanguage, voiceName?: string): SpeechSynthesisVoice | null {
    const langCodes = LANGUAGE_MAP[language] || [language];

    // Si se especifica un nombre, buscarlo
    if (voiceName) {
      const namedVoice = this.voices.find((v) => v.name === voiceName);
      if (namedVoice) return namedVoice;
    }

    // Buscar por código de idioma exacto primero
    for (const code of langCodes) {
      const exactMatch = this.voices.find((v) => v.lang === code);
      if (exactMatch) return exactMatch;
    }

    // Buscar por prefijo de idioma
    const langPrefix = language;
    const prefixMatch = this.voices.find((v) => v.lang.startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;

    // Fallback: primera voz disponible
    return this.voices[0] || null;
  }

  /**
   * Lee un texto en voz alta
   */
  speak(text: string, options: TTSOptions, events?: TTSEvents): boolean {
    if (!this.synth || !this.isReady) {
      console.warn('⚠️ TTS no está disponible');
      events?.onError?.('TTS no disponible');
      return false;
    }

    // Cancelar lectura anterior
    this.stop();

    if (!text || text.trim().length === 0) {
      console.warn('⚠️ TTS: Texto vacío');
      events?.onEnd?.();
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(text);

    // Configurar voz
    const voice = this.getBestVoice(options.language, options.voiceName);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = LANGUAGE_MAP[options.language]?.[0] || options.language;
    }

    // Configurar parámetros
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    // Configurar eventos
    if (events?.onStart) {
      utterance.onstart = events.onStart;
    }

    if (events?.onEnd) {
      utterance.onend = events.onEnd;
    }

    if (events?.onError) {
      utterance.onerror = (e) => {
        // "interrupted" no es un error real, ocurre al cancelar la lectura intencionalmente
        if (e.error === 'interrupted' || e.error === 'canceled') {
          console.log('🔊 TTS: Lectura interrumpida (normal al cambiar página o detener)');
          return;
        }
        events.onError!(e.error);
      };
    }

    if (events?.onBoundary) {
      utterance.onboundary = (e) => {
        events.onBoundary!(e.charIndex, e.charLength || 1);
      };
    }

    this.currentUtterance = utterance;

    try {
      this.synth.speak(utterance);
      console.log(`🔊 TTS: Leyendo (${options.language}): "${text.substring(0, 50)}..."`);
      return true;
    } catch (error) {
      console.error('❌ TTS Error:', error);
      events?.onError?.('Error al iniciar lectura');
      return false;
    }
  }

  /**
   * Pausa la lectura actual
   */
  pause(): void {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  /**
   * Reanuda la lectura pausada
   */
  resume(): void {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  /**
   * Detiene la lectura y cancela todo
   */
  stop(): void {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  /**
   * Verifica si está leyendo
   */
  isSpeaking(): boolean {
    return this.synth?.speaking ?? false;
  }

  /**
   * Verifica si está pausado
   */
  isPaused(): boolean {
    return this.synth?.paused ?? false;
  }

  /**
   * Obtiene el estado actual
   */
  getState(): 'idle' | 'speaking' | 'paused' {
    if (!this.synth) return 'idle';
    if (this.synth.paused) return 'paused';
    if (this.synth.speaking) return 'speaking';
    return 'idle';
  }
}

// Exportar instancia singleton para uso directo
export const ttsService = TTSService.getInstance();
