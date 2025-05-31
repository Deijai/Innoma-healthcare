// src/lib/token-validator.ts

export class TokenValidator {
  private static instance: TokenValidator;
  private validationCallbacks: Set<() => void> = new Set();

  static getInstance(): TokenValidator {
    if (!TokenValidator.instance) {
      TokenValidator.instance = new TokenValidator();
    }
    return TokenValidator.instance;
  }

  // Adicionar callback para quando token for inválido
  addInvalidTokenCallback(callback: () => void): void {
    this.validationCallbacks.add(callback);
  }

  // Remover callback
  removeInvalidTokenCallback(callback: () => void): void {
    this.validationCallbacks.delete(callback);
  }

  // Notificar sobre token inválido
  notifyTokenInvalid(): void {
    console.log('🚨 Token inválido detectado, notificando callbacks...');
    this.validationCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Erro ao executar callback de token inválido:', error);
      }
    });
  }

  // Interceptar respostas HTTP para detectar 401
  setupResponseInterceptor(): void {
    // Interceptar fetch global
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Se recebeu 401 Unauthorized
        if (response.status === 401) {
          console.log('🚨 Recebido 401 Unauthorized da API');
          this.notifyTokenInvalid();
        }
        
        return response;
      } catch (error) {
        throw error;
      }
    };
  }
}