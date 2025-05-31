// src/app/dashboard/people/[id]/edit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PersonForm } from '@/components/forms/PersonForm';
import { pessoaService, AtualizarPessoaRequest, Pessoa } from '@/lib/api-services';
import { FormSkeleton } from '@/components/ui/Skeleton';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  
  const [pessoa, setPessoa] = useState<Pessoa | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const personId = params?.id as string;

  // Carregar dados da pessoa
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

  const handleSubmit = async (data: AtualizarPessoaRequest) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await pessoaService.atualizar(personId, data);
      toast.success('Pessoa atualizada com sucesso!');

      // Redirecionar para visualização da pessoa
      router.push(`/dashboard/people/${result.id}`);
      
    } catch (error) {
      console.error('Erro ao atualizar pessoa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao atualizar pessoa', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/people/${personId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-8">
        <FormSkeleton fields={8} />
      </div>
    );
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

  return (
    <div className="container mx-auto px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/people/${personId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Editar Pessoa</h1>
            <p className="text-muted-foreground">
              Atualize as informações de {pessoa.nome}
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
        initialData={pessoa}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={submitting}
        isEditing={true}
        title={`Editando: ${pessoa.nome}`}
        submitButtonText="Atualizar Pessoa"
        showEnderecoSection={true}
        className="max-w-6xl mx-auto"
      />

      {/* Informações para edição */}
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
    </div>
  );
}