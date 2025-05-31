// src/app/dashboard/people/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/forms/FormComponents';
import { pessoaService, Pessoa } from '@/lib/api-services';
import { UserDetailSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Calendar,
  MapPin,
  User,
  UserPlus,
  Trash2,
  RefreshCw,
  Download,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { formatCPF, formatPhone, formatDate, getSexoDisplay } from '@/lib/utils';

export default function PersonDetailPage() {
  const params = useParams();
  const toast = useToast();
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const personId = params?.id as string;

  useEffect(() => {
    if (personId) {
      loadPersonData();
    }
  }, [personId]);

  const loadPersonData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await pessoaService.buscarPorId(personId);
      setPessoa(data);
    } catch (error) {
      console.error('Erro ao carregar pessoa:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar dados da pessoa');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    if (!pessoa) return;

    try {
      setActionLoading(action);

      switch (action) {
        case 'toggle-status':
          const newStatus = pessoa.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
          await pessoaService.atualizar(pessoa.id, { status: newStatus });
          setPessoa(prev => prev ? { ...prev, status: newStatus } : null);
          toast.success(`Pessoa ${newStatus.toLowerCase()} com sucesso!`);
          break;

        case 'delete':
          if (confirm(`Tem certeza que deseja deletar ${pessoa.nome}? Esta ação não pode ser desfeita.`)) {
            await pessoaService.deletar(pessoa.id);
            toast.success('Pessoa deletada com sucesso!');
            window.location.href = '/dashboard/people';
          }
          break;
      }
    } catch (error) {
      console.error(`Erro ao executar ação ${action}:`, error);
      toast.error('Erro na operação', error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copiado!`);
    } catch (error) {
      toast.error('Erro ao copiar');
    }
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const PersonInfoItem = ({ 
    label, 
    value, 
    icon, 
    copyable = false 
  }: { 
    label: string; 
    value: string | undefined; 
    icon: React.ReactNode; 
    copyable?: boolean; 
  }) => {
    if (!value) return null;

    return (
      <div className="flex items-center space-x-3 py-3 border-b border-border last:border-0">
        <div className="text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium">{label}</p>
          <div className="flex items-center space-x-2">
            <p className="text-sm text-foreground">{value}</p>
            {copyable && (
              <button
                onClick={() => copyToClipboard(value, label)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title="Copiar"
              >
                <Copy className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <UserDetailSkeleton />;
  }

  if (error || !pessoa) {
    return (
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/people">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Erro ao carregar pessoa</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <div className="flex items-center justify-center space-x-3">
                <Button onClick={loadPersonData} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
                <Link href="/dashboard/people">
                  <Button>Voltar à lista</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const age = calculateAge(pessoa.data_nascimento);

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/people">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{pessoa.nome}</h1>
              <StatusBadge status={pessoa.status} />
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <p className="text-muted-foreground">CPF: {formatCPF(pessoa.cpf)}</p>
              <p className="text-muted-foreground">•</p>
              <p className="text-muted-foreground">{getSexoDisplay(pessoa.sexo)}, {age} anos</p>
              <p className="text-muted-foreground">•</p>
              <p className="text-muted-foreground">ID: {pessoa.id}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button onClick={loadPersonData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          <Link href={`/dashboard/people/${pessoa.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações principais */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados pessoais */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informações Pessoais</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <PersonInfoItem
                  label="CPF"
                  value={formatCPF(pessoa.cpf)}
                  icon={<FileText className="h-4 w-4" />}
                  copyable
                />
                
                <PersonInfoItem
                  label="Data de Nascimento"
                  value={formatDate(pessoa.data_nascimento)}
                  icon={<Calendar className="h-4 w-4" />}
                />
                
                <PersonInfoItem
                  label="Idade"
                  value={`${age} anos`}
                  icon={<Clock className="h-4 w-4" />}
                />
                
                <PersonInfoItem
                  label="Sexo"
                  value={getSexoDisplay(pessoa.sexo)}
                  icon={<User className="h-4 w-4" />}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informações de contato */}
          <Card>
            <CardHeader>
              <CardTitle>Contato</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {pessoa.telefone ? (
                  <PersonInfoItem
                    label="Telefone"
                    value={formatPhone(pessoa.telefone)}
                    icon={<Phone className="h-4 w-4" />}
                    copyable
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-3">Telefone não informado</p>
                )}
                
                {pessoa.email ? (
                  <PersonInfoItem
                    label="Email"
                    value={pessoa.email}
                    icon={<Mail className="h-4 w-4" />}
                    copyable
                  />
                ) : (
                  <p className="text-sm text-muted-foreground py-3">Email não informado</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Endereço</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pessoa.endereco && Object.values(pessoa.endereco).some(v => v) ? (
                <div className="space-y-2">
                  {pessoa.endereco.logradouro && (
                    <div>
                      <p className="text-sm font-medium">
                        {pessoa.endereco.logradouro}
                        {pessoa.endereco.numero && `, ${pessoa.endereco.numero}`}
                        {pessoa.endereco.complemento && ` - ${pessoa.endereco.complemento}`}
                      </p>
                    </div>
                  )}
                  
                  {pessoa.endereco.bairro && (
                    <p className="text-sm text-muted-foreground">{pessoa.endereco.bairro}</p>
                  )}
                  
                  {(pessoa.endereco.cidade || pessoa.endereco.estado) && (
                    <p className="text-sm text-muted-foreground">
                      {pessoa.endereco.cidade}
                      {pessoa.endereco.estado && ` - ${pessoa.endereco.estado}`}
                    </p>
                  )}
                  
                  {pessoa.endereco.cep && (
                    <p className="text-sm text-muted-foreground">CEP: {pessoa.endereco.cep}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Endereço não informado</p>
              )}
            </CardContent>
          </Card>

          {/* Informações do sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Informações do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  {pessoa.created_at && (
                    <PersonInfoItem
                      label="Data de Criação"
                      value={formatDate(pessoa.created_at)}
                      icon={<Clock className="h-4 w-4" />}
                    />
                  )}
                  
                  {pessoa.created_by && (
                    <PersonInfoItem
                      label="Criado por"
                      value={pessoa.created_by}
                      icon={<User className="h-4 w-4" />}
                    />
                  )}
                </div>

                <div className="space-y-1">
                  {pessoa.updated_at && (
                    <PersonInfoItem
                      label="Última Atualização"
                      value={formatDate(pessoa.updated_at)}
                      icon={<Clock className="h-4 w-4" />}
                    />
                  )}
                  
                  {pessoa.updated_by && (
                    <PersonInfoItem
                      label="Atualizado por"
                      value={pessoa.updated_by}
                      icon={<User className="h-4 w-4" />}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status atual */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  pessoa.status === 'ATIVO' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                }`}>
                  {pessoa.status === 'ATIVO' ? (
                    <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <h3 className="font-medium">
                  {pessoa.status === 'ATIVO' ? 'Pessoa Ativa' : 'Pessoa Inativa'}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {pessoa.status === 'ATIVO' 
                    ? 'Esta pessoa está ativa no sistema'
                    : 'Esta pessoa está inativa no sistema'
                  }
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Ações rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href={`/dashboard/people/${pessoa.id}/edit`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Informações
                </Button>
              </Link>

              <Link href={`/dashboard/users/new?pessoa_id=${pessoa.id}`} className="block">
                <Button variant="outline" className="w-full justify-start text-blue-600 hover:text-blue-700">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Criar Usuário
                </Button>
              </Link>

              <Button
                variant="outline"
                className={`w-full justify-start ${
                  pessoa.status === 'ATIVO' 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-green-600 hover:text-green-700'
                }`}
                onClick={() => handleAction('toggle-status')}
                disabled={!!actionLoading}
              >
                {pessoa.status === 'ATIVO' ? (
                  <XCircle className="h-4 w-4 mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {pessoa.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
              </Button>

              <div className="pt-3 border-t border-border">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Dados
                </Button>
              </div>

              <div className="pt-3 border-t border-border">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-red-600 hover:text-red-700" 
                  size="sm"
                  onClick={() => handleAction('delete')}
                  disabled={!!actionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar Pessoa
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações técnicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID da pessoa:</span>
                <span className="font-mono text-xs">{pessoa.id}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tenant:</span>
                <span className="font-mono text-xs">{pessoa.tenant_id}</span>
              </div>
              
              {pessoa.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="text-xs">{new Date(pessoa.created_at).toLocaleString('pt-BR')}</span>
                </div>
              )}
              
              {pessoa.updated_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modificado em:</span>
                  <span className="text-xs">{new Date(pessoa.updated_at).toLocaleString('pt-BR')}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}