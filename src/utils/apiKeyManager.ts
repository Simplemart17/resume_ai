const API_KEY_STORAGE_KEY = 'openai_api_key';

export class ApiKeyManager {
  private static instance: ApiKeyManager;
  private apiKey: string | null = null;

  private constructor() {
    this.loadApiKey();
  }

  public static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  private loadApiKey(): void {
    if (typeof window !== 'undefined') {
      // Try localStorage first, then sessionStorage
      this.apiKey = localStorage.getItem(API_KEY_STORAGE_KEY) ||
                   sessionStorage.getItem(API_KEY_STORAGE_KEY);
    }
  }

  public getApiKey(): string | null {
    // In development, we'll rely on the server-side API key
    // Client-side API key is only needed in production
    return this.apiKey;
  }

  // Defaults to sessionStorage (persistent = false) so API keys are not kept
  // in localStorage unless the caller explicitly opts in.
  public setApiKey(key: string, persistent: boolean = false): void {
    this.apiKey = key;
    if (typeof window !== 'undefined') {
      if (persistent) {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        sessionStorage.removeItem(API_KEY_STORAGE_KEY);
      } else {
        sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
        localStorage.removeItem(API_KEY_STORAGE_KEY);
      }
    }
  }

  public removeApiKey(): void {
    this.apiKey = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      sessionStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }

  public hasApiKey(): boolean {
    // In development, always return true since we use server-side API key
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return !!this.getApiKey();
  }

  public validateApiKey(key: string): boolean {
    // Basic validation for OpenAI API key format
    return key.startsWith('sk-') && key.length > 20;
  }

  public isProductionMode(): boolean {
    return process.env.NODE_ENV === 'production';
  }
}

export const apiKeyManager = ApiKeyManager.getInstance();
