// src/app/dashboard/people/new/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PersonForm } from '@/components/forms/PersonForm';
import { pessoaService, CriarPessoaRequest, AtualizarPessoaRequest } from '@/lib/api-services';
import { useToast } from '@/components/ui/Toast';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function NewPersonPage() {
  const router = useRouter();
  const toast = useToast();
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CriarPessoaRequest | AtualizarPessoaRequest) => {
    try {
      setSubmitting(true);
      setError(null);

      const result = await pessoaService.criar(data as CriarPessoaRequest);
      toast.success('Pessoa criada com sucesso!');
      
      // Redirecionar para visualização da pessoa
      router.push(`/dashboard/people/${result.id}`);
      
    } catch (error) {
      console.error('Erro ao criar pessoa:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      toast.error('Erro ao criar pessoa', errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/people');
  };

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
            <h1 className="text-3xl font-bold">Nova Pessoa</h1>
            <p className="text-muted-foreground">
              Cadastre uma nova pessoa no sistema
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
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={submitting}
        title="Cadastrar Nova Pessoa"
        submitButtonText="Cadastrar Pessoa"
        showEnderecoSection={true}
        className="max-w-6xl mx-auto"
      />

      {/* Informações adicionais */}
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
    </div>
  );
}