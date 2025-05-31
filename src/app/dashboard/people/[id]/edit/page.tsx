// src/app/dashboard/people/new/page.tsx (e também src/app/dashboard/people/[id]/edit/page.tsx)
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PersonForm } from '@/components/forms/PersonForm';
import { pessoaService, CriarPessoaRequest, AtualizarPessoaRequest, Pessoa } from '@/lib/api-services';
import { FormSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PersonFormPageProps {
  mode: 'create' | 'edit';
}

export default function PersonFormPage({ mode = 'create' }: PersonFormPageProps) {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personId = mode === 'edit' ? params?.id as string : null;
  const isEditing = mode === 'edit';

  // Carregar dados da pessoa para edição
  useEffect(() => {
    if (isEditing && personId) {
      loadPersonData();
    }
  }, [isEditing, personId]);

  const loadPersonData = async () => {
    if (!personId) return;

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

  const handleSubmit = async (data: CriarPessoaRequest | AtualizarPessoaRequest) => {
    try {
      setSubmitting(true);
      setError(null);

      let result: Pessoa;

      if (isEditing && personId) {
        // Atualizar pessoa existente
        result = await pessoaService.atualizar(personId, data as AtualizarPessoaRequest);
        toast.success('Pessoa atualizada com sucesso!');
      } else {
        // Criar nova pessoa
        result = await pessoaService.criar(data as CriarPessoaRequest);
        toast.success('Pessoa criada com sucesso!');
      }

      // Redirecionar para visualização da pessoa
      router.push(`/dashboard/people/${result.id}`);
      
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao salvar pessoa', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && personId) {
      router.push(`/dashboard/people/${personId}`);
    } else {
      router.push('/dashboard/people');
    }
  };

  if (loading) {
    return <FormSkeleton />;
  }

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={isEditing ? `/dashboard/people/${personId}` : '/dashboard/people'}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">
              {isEditing ? 'Editar Pessoa' : 'Nova Pessoa'}
            </h1>
            <p className="text-muted-foreground">
              {isEditing ? 'Atualize as informações da pessoa' : 'Cadastre uma nova pessoa no sistema'}
            </p>
          </div>
        </div>
      </div>

      {/* Erro geral */}
      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formulário */}
      <PersonForm
        initialData={pessoa || undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={submitting}
        isEditing={isEditing}
        title={isEditing ? `Editando: ${pessoa?.nome}` : 'Cadastrar Nova Pessoa'}
        submitButtonText={isEditing ? 'Atualizar Pessoa' : 'Cadastrar Pessoa'}
        showEnderecoSection={true}
        className="max-w-6xl mx-auto"
      />

      {/* Informações adicionais para criação */}
      {!isEditing && (
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                  Próximos Passos
                </h4>
                <div className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                  <p>• Após cadastrar a pessoa, você poderá criar um usuário para ela</p>
                  <p>• Certifique-se de que os dados estão corretos, especialmente o CPF</p>
                  <p>• O endereço é opcional, mas recomendado para relatórios</p>
                  <p>• A pessoa ficará ativa por padrão</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações para edição */}
      {isEditing && pessoa && (
        <Card className="max-w-6xl mx-auto">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Informações do Sistema</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>ID: {pessoa.id}</p>
                  <p>Criado em: {pessoa.created_at ? new Date(pessoa.created_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                  <p>Atualizado em: {pessoa.updated_at ? new Date(pessoa.updated_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Status Atual</h4>
                <div className="text-sm">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    pessoa.status === 'ATIVO' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {pessoa.status}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Ações Disponíveis</h4>
                <div className="space-y-2">
                  <Link href={`/dashboard/users/new?pessoa_id=${pessoa.id}`} className="block">
                    <Button variant="outline" size="sm" className="w-full">
                      Criar Usuário
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver Histórico
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente para página de criação
export function NewPersonPage() {
  return <PersonFormPage mode="create" />;
}

// Componente para página de edição  
export function EditPersonPage() {
  return <PersonFormPage mode="edit" />;
}