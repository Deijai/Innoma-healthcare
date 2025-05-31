// src/lib/user-actions.ts
import { usuarioService } from './api-services';

export interface ResetPasswordRequest {
  userId: string;
  sendEmail?: boolean;
}

export interface BlockUserRequest {
  userId: string;
  duration: number; // em minutos
  reason?: string;
}

export interface ChangePasswordRequest {
  userId: string;
  currentPassword?: string;
  newPassword: string;
  confirmPassword: string;
}

class UserActionsService {
  // Resetar senha
  async resetPassword(request: ResetPasswordRequest): Promise<{
    success: boolean;
    temporaryPassword?: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${request.userId}/reset-password`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          send_email: request.sendEmail ?? true
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao resetar senha');
      }

      const data = await response.json();
      return {
        success: true,
        temporaryPassword: data.temporary_password,
        message: data.message || 'Senha resetada com sucesso'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao resetar senha');
    }
  }

  // Bloquear usuário
  async blockUser(request: BlockUserRequest): Promise<{
    success: boolean;
    blockedUntil: string;
    message: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${request.userId}/bloquear`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          tempo_minutos: request.duration,
          motivo: request.reason
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao bloquear usuário');
      }

      const data = await response.json();
      return {
        success: true,
        blockedUntil: data.bloqueado_ate,
        message: data.message || 'Usuário bloqueado com sucesso'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao bloquear usuário');
    }
  }

  // Desbloquear usuário
  async unblockUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}/desbloquear`, {
        method: 'PUT',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao desbloquear usuário');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Usuário desbloqueado com sucesso'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao desbloquear usuário');
    }
  }

  // Alterar senha
  async changePassword(request: ChangePasswordRequest): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (request.newPassword !== request.confirmPassword) {
        throw new Error('Senhas não coincidem');
      }

      if (request.newPassword.length < 6) {
        throw new Error('Nova senha deve ter pelo menos 6 caracteres');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${request.userId}/senha`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          senha_atual: request.currentPassword,
          nova_senha: request.newPassword
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar senha');
      }

      const data = await response.json();
      return {
        success: true,
        message: data.message || 'Senha alterada com sucesso'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao alterar senha');
    }
  }

  // Ativar/Desativar usuário
  async toggleUserStatus(userId: string, ativo: boolean): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ ativo })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar status do usuário');
      }

      const data = await response.json();
      return {
        success: true,
        message: ativo ? 'Usuário ativado com sucesso' : 'Usuário desativado com sucesso'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao alterar status');
    }
  }

  // Excluir usuário
  async deleteUser(userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/${userId}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir usuário');
      }

      return {
        success: true,
        message: 'Usuário excluído com sucesso'
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Erro ao excluir usuário');
    }
  }

  // Gerar nova senha temporária
  generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    
    // Garantir pelo menos um de cada tipo
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Maiúscula
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Minúscula
    password += '0123456789'[Math.floor(Math.random() * 10)]; // Número
    password += '!@#$%'[Math.floor(Math.random() * 5)]; // Especial
    
    // Completar com caracteres aleatórios
    for (let i = 4; i < 8; i++) {
      password += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Embaralhar a senha
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Headers para requisições
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const tenant = localStorage.getItem('selected_tenant');
    if (tenant) {
      headers['X-Subdomain'] = tenant;
    }

    return headers;
  }
}

export const userActionsService = new UserActionsService();