// src/components/debug/TenantDebug.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Bug, 
  Server, 
  User, 
  Building2, 
  Key,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Copy
} from 'lucide-react';
import { useState } from 'react';

export function TenantDebug() {
  const { user, selectedTenant, isAuthenticated } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const collectDebugInfo = () => {
    setIsLoading(true);
    
    try {
      const info = {
        // Timestamp
        timestamp: new Date().toISOString(),
        
        // Estado do Context
        context: {
          selectedTenant,
          user: user ? {
            id: user.id,
            nome: user.nome,
            usuario: user.usuario,
            papel: user.papel,
            tenant_id: user.tenant_id,
            permissoes: user.permissoes?.length || 0
          } : null,
          isAuthenticated
        },
        
        // Estado do ApiService
        apiService: {
          currentTenant: apiService.getCurrentTenant(),
          hasTenant: apiService.hasTenant(),
          isAuthenticated: apiService.isAuthenticated()
        },
        
        // LocalStorage
        localStorage: {
          auth_token: !!localStorage.getItem('auth_token'),
          auth_token_preview: localStorage.getItem('auth_token')?.substring(0, 20) + '...',
          selected_tenant: localStorage.getItem('selected_tenant'),
          auth_tenant: localStorage.getItem('auth_tenant'),
          user_data: !!localStorage.getItem('user_data'),
          recent_tenants: !!localStorage.getItem('recent_tenants'),
          recent_tenants_count: JSON.parse(localStorage.getItem('recent_tenants') || '[]').length
        },
        
        // Headers que serão enviados
        headers: {
          'Content-Type': 'application/json',
          'X-Subdomain': apiService.getCurrentTenant() || '❌ NÃO DEFINIDO',
          'Authorization': apiService.isAuthenticated() ? 'Bearer [TOKEN_PRESENTE]' : '❌ SEM TOKEN'
        },
        
        // Status de validação
        status: {
          canMakeRequests: !!apiService.getCurrentTenant(),
          authValid: apiService.isAuthenticated(),
          contextSync: selectedTenant === apiService.getCurrentTenant(),
          tenantPersistence: localStorage.getItem('selected_tenant') === apiService.getCurrentTenant(),
          authTenantMatch: localStorage.getItem('auth_tenant') === apiService.getCurrentTenant()
        },
        
        // URLs de teste
        urls: {
          current: window.location.href,
          api_base: process.env.NEXT_PUBLIC_API_URL,
          login_endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/login`,
          profile_endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/usuarios/perfil`
        }
      };
      
      setDebugInfo(info);
    } catch (error) {
      console.error('Erro ao coletar debug info:', error);
      setDebugInfo({ error: 'Erro ao coletar informações de debug' });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  const clearAll = () => {
    if (confirm('⚠️ Isso vai limpar TODOS os dados e recarregar a página. Continuar?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const clearOnlyAuth = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('auth_tenant');
    window.location.reload();
  };

  const testApiCall = async () => {
    try {
      setIsLoading(true);
      
      if (!apiService.hasTenant()) {
        alert('❌ Nenhum tenant definido! Selecione um município primeiro.');
        return;
      }
      
      // Teste de chamada autenticada
      if (apiService.isAuthenticated()) {
        console.log('🧪 Testando chamada para API...');
        console.log('Headers que serão enviados:', {
          'X-Subdomain': apiService.getCurrentTenant(),
          'Authorization': 'Bearer [HIDDEN]'
        });
        
        const profile = await apiService.getUserProfile();
        alert(`✅ API funcionando!\n\nUsuário: ${profile.nome}\nTenant: ${apiService.getCurrentTenant()}\nTempo: ${new Date().toLocaleTimeString()}`);
      } else {
        alert('❌ Não autenticado. Faça login primeiro.');
      }
    } catch (error) {
      console.error('Erro no teste da API:', error);
      alert(`❌ Erro na API:\n\n${error instanceof Error ? error.message : 'Erro desconhecido'}\n\nVerifique o console para mais detalhes.`);
    } finally {
      setIsLoading(false);
    }
  };

  const exportDebugInfo = () => {
    if (!debugInfo) {
      collectDebugInfo();
      return;
    }
    
    const exportData = {
      ...debugInfo,
      // Remover dados sensíveis
      localStorage: {
        ...debugInfo.localStorage,
        auth_token_preview: '[HIDDEN_FOR_EXPORT]'
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tenant-debug-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Não mostrar em produção
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bug className="h-5 w-5 text-orange-500" />
            <span>Debug: Estado do Tenant & API</span>
          </div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Modo Desenvolvimento</span>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Controles Principais */}
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={collectDebugInfo}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar Info
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={testApiCall}
            disabled={isLoading}
          >
            <Server className="h-4 w-4 mr-2" />
            Testar API
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={exportDebugInfo}
            disabled={!debugInfo}
          >
            <Copy className="h-4 w-4 mr-2" />
            Exportar Debug
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearOnlyAuth}
            className="text-yellow-600 hover:text-yellow-700"
          >
            <Key className="h-4 w-4 mr-2" />
            Limpar Auth
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={clearAll}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar Tudo
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Building2 className="h-4 w-4" />
              <span className="font-medium text-sm">Tenant</span>
            </div>
            <p className="text-sm">
              {selectedTenant ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {selectedTenant}
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  Não selecionado
                </span>
              )}
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4" />
              <span className="font-medium text-sm">Usuário</span>
            </div>
            <p className="text-sm">
              {user ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {user.nome}
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  Não logado
                </span>
              )}
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="h-4 w-4" />
              <span className="font-medium text-sm">Token</span>
            </div>
            <p className="text-sm">
              {apiService.isAuthenticated() ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Válido
                </span>
              ) : (
                <span className="text-red-600 flex items-center">
                  <XCircle className="h-3 w-3 mr-1" />
                  Inválido
                </span>
              )}
            </p>
          </div>
          
          <div className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Server className="h-4 w-4" />
              <span className="font-medium text-sm">API Status</span>
            </div>
            <p className="text-sm">
              {apiService.hasTenant() && apiService.isAuthenticated() ? (
                <span className="text-green-600 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Pronto
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Incompleto
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Alertas de Status */}
        {debugInfo && (
          <div className="space-y-2">
            {!debugInfo.status.canMakeRequests && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-300">
                    ❌ Tenant não definido! Selecione um município primeiro.
                  </span>
                </div>
              </div>
            )}
            
            {!debugInfo.status.authValid && debugInfo.status.canMakeRequests && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    ⚠️ Tenant selecionado, mas usuário não autenticado. Faça login.
                  </span>
                </div>
              </div>
            )}
            
            {!debugInfo.status.contextSync && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    🔄 Context e API Service não sincronizados! Recarregue a página.
                  </span>
                </div>
              </div>
            )}
            
            {debugInfo.status.canMakeRequests && debugInfo.status.authValid && debugInfo.status.contextSync && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-300">
                    ✅ Tudo funcionando perfeitamente! Todas as requisições incluirão o tenant automaticamente.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Debug Info Detalhado */}
        {debugInfo && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Informações Detalhadas</h4>
              <span className="text-xs text-muted-foreground">
                Atualizado: {new Date(debugInfo.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* React Context */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-sm text-blue-700 dark:text-blue-300">React Context</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(JSON.stringify(debugInfo.context, null, 2), 'context')}
                  >
                    {copiedField === 'context' ? 
                      <CheckCircle className="h-3 w-3 text-green-500" /> :
                      <Copy className="h-3 w-3" />
                    }
                  </Button>
                </div>
                <pre className="text-xs text-blue-600 dark:text-blue-400 overflow-x-auto">
                  {JSON.stringify(debugInfo.context, null, 2)}
                </pre>
              </div>
              
              {/* API Service */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-sm text-green-700 dark:text-green-300">API Service</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(JSON.stringify(debugInfo.apiService, null, 2), 'apiService')}
                  >
                    {copiedField === 'apiService' ? 
                      <CheckCircle className="h-3 w-3 text-green-500" /> :
                      <Copy className="h-3 w-3" />
                    }
                  </Button>
                </div>
                <pre className="text-xs text-green-600 dark:text-green-400 overflow-x-auto">
                  {JSON.stringify(debugInfo.apiService, null, 2)}
                </pre>
              </div>
              
              {/* LocalStorage */}
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-sm text-purple-700 dark:text-purple-300">LocalStorage</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(JSON.stringify(debugInfo.localStorage, null, 2), 'localStorage')}
                  >
                    {copiedField === 'localStorage' ? 
                      <CheckCircle className="h-3 w-3 text-green-500" /> :
                      <Copy className="h-3 w-3" />
                    }
                  </Button>
                </div>
                <pre className="text-xs text-purple-600 dark:text-purple-400 overflow-x-auto">
                  {JSON.stringify(debugInfo.localStorage, null, 2)}
                </pre>
              </div>
              
              {/* Headers */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-sm text-orange-700 dark:text-orange-300">Headers da Próxima Requisição</h5>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => copyToClipboard(JSON.stringify(debugInfo.headers, null, 2), 'headers')}
                  >
                    {copiedField === 'headers' ? 
                      <CheckCircle className="h-3 w-3 text-green-500" /> :
                      <Copy className="h-3 w-3" />
                    }
                  </Button>
                </div>
                <pre className="text-xs text-orange-600 dark:text-orange-400 overflow-x-auto">
                  {JSON.stringify(debugInfo.headers, null, 2)}
                </pre>
              </div>
            </div>
            
            {/* Status de Sincronização */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <h5 className="font-medium text-sm mb-3 text-gray-700 dark:text-gray-300">Status de Sincronização</h5>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span>Pode fazer requisições:</span>
                  <span className={debugInfo.status.canMakeRequests ? 'text-green-600 flex items-center' : 'text-red-600 flex items-center'}>
                    {debugInfo.status.canMakeRequests ? <><CheckCircle className="h-3 w-3 mr-1" />Sim</> : <><XCircle className="h-3 w-3 mr-1" />Não</>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Autenticação válida:</span>
                  <span className={debugInfo.status.authValid ? 'text-green-600 flex items-center' : 'text-red-600 flex items-center'}>
                    {debugInfo.status.authValid ? <><CheckCircle className="h-3 w-3 mr-1" />Sim</> : <><XCircle className="h-3 w-3 mr-1" />Não</>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Context sincronizado:</span>
                  <span className={debugInfo.status.contextSync ? 'text-green-600 flex items-center' : 'text-red-600 flex items-center'}>
                    {debugInfo.status.contextSync ? <><CheckCircle className="h-3 w-3 mr-1" />Sim</> : <><XCircle className="h-3 w-3 mr-1" />Não</>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tenant persistente:</span>
                  <span className={debugInfo.status.tenantPersistence ? 'text-green-600 flex items-center' : 'text-red-600 flex items-center'}>
                    {debugInfo.status.tenantPersistence ? <><CheckCircle className="h-3 w-3 mr-1" />Sim</> : <><XCircle className="h-3 w-3 mr-1" />Não</>}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Auth-Tenant match:</span>
                  <span className={debugInfo.status.authTenantMatch ? 'text-green-600 flex items-center' : 'text-red-600 flex items-center'}>
                    {debugInfo.status.authTenantMatch ? <><CheckCircle className="h-3 w-3 mr-1" />Sim</> : <><XCircle className="h-3 w-3 mr-1" />Não</>}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instruções de Uso */}
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <h5 className="font-medium text-sm mb-2 text-yellow-700 dark:text-yellow-300">📋 Como Usar Este Debug:</h5>
          <ol className="text-xs text-yellow-600 dark:text-yellow-400 space-y-1">
            <li><strong>1. Verificar Tenant:</strong> Deve aparecer no Context e API Service</li>
            <li><strong>2. Fazer Login:</strong> Deve aparecer usuário e token válido</li>
            <li><strong>3. Verificar Headers:</strong> X-Subdomain deve estar definido</li>
            <li><strong>4. Testar API:</strong> Use o botão "Testar API" para validar</li>
            <li><strong>5. Exportar Debug:</strong> Salve o estado para análise posterior</li>
          </ol>
        </div>

        {/* URLs e Configurações */}
        {debugInfo?.urls && (
          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
            <h5 className="font-medium text-sm mb-2 text-indigo-700 dark:text-indigo-300">🔗 URLs e Configurações:</h5>
            <div className="space-y-1 text-xs">
              <div><strong>Página atual:</strong> {debugInfo.urls.current}</div>
              <div><strong>API Base:</strong> {debugInfo.urls.api_base}</div>
              <div><strong>Login endpoint:</strong> {debugInfo.urls.login_endpoint}</div>
              <div><strong>Profile endpoint:</strong> {debugInfo.urls.profile_endpoint}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}