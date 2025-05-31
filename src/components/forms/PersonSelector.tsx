// src/components/forms/PersonSelector.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { UserFormData, FormErrors } from '@/app/dashboard/users/new/page';
import { pessoaService, Pessoa } from '@/lib/api-services';

interface PersonSelectorProps {
  formData: UserFormData;
  errors: FormErrors;
  onInputChange: (field: string, value: any) => void;
  onPersonDataChange: (field: string, value: any) => void;
  onPersonSelect: (pessoa: Pessoa) => void;
  pessoasEncontradas: Pessoa[];
  searchingPessoa: boolean;
  searchTermPessoa: string;
  setSearchTermPessoa: (term: string) => void;
  showPessoaSearch: boolean;
  setShowPessoaSearch: (show: boolean) => void;
}

export function PersonSelector({ 
  formData, 
  errors, 
  onInputChange, 
  onPersonDataChange, 
  onPersonSelect,
  pessoasEncontradas,
  searchingPessoa,
  searchTermPessoa,
  setSearchTermPessoa,
  showPessoaSearch,
  setShowPessoaSearch
}: PersonSelectorProps) {

  const selectPessoa = (pessoa: Pessoa) => {
    onPersonSelect(pessoa);
    setShowPessoaSearch(false);
    setSearchTermPessoa('');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Selecionar Pessoa</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="pessoa_type"
                checked={!formData.criar_pessoa}
                onChange={() => onInputChange('criar_pessoa', false)}
              />
              <span>Pessoa existente</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="radio"
                name="pessoa_type"
                checked={formData.criar_pessoa}
                onChange={() => onInputChange('criar_pessoa', true)}
              />
              <span>Criar nova pessoa</span>
            </label>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!formData.criar_pessoa ? (
          // Busca de pessoa existente
          <div className="space-y-4">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <input
                  type="text"
                  value={searchTermPessoa}
                  onChange={(e) => {
                    setSearchTermPessoa(e.target.value);
                    setShowPessoaSearch(true);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                  placeholder="Buscar por nome ou CPF..."
                />
              </div>
              
              {searchingPessoa && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {showPessoaSearch && pessoasEncontradas.length > 0 && (
              <Card>
                <CardContent className="p-0">
                  <div className="max-h-60 overflow-y-auto">
                    {pessoasEncontradas.map((pessoa) => (
                      <button
                        key={pessoa.id}
                        type="button"
                        onClick={() => selectPessoa(pessoa)}
                        className="w-full p-4 text-left hover:bg-accent border-b border-border last:border-0"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{pessoa.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              CPF: {formatCPF(pessoa.cpf)}
                            </p>
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {pessoa.email && <p>{pessoa.email}</p>}
                            {pessoa.telefone && <p>{pessoa.telefone}</p>}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {errors.pessoa_id && (
              <p className="text-red-600 text-xs">{errors.pessoa_id}</p>
            )}

            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                Não encontrou a pessoa? 
              </p>
              <Link href="/dashboard/people/new">
                <Button type="button" variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Nova Pessoa
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          // Formulário de nova pessoa (versão compacta)
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-2 block">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={formData.pessoa_dados?.nome || ''}
                  onChange={(e) => onPersonDataChange('nome', e.target.value)}
                  className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                    errors['pessoa_dados.nome'] ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="Nome completo"
                />
                {errors['pessoa_dados.nome'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.nome']}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  CPF *
                </label>
                <input
                  type="text"
                  value={formatCPF(formData.pessoa_dados?.cpf || '')}
                  onChange={(e) => onPersonDataChange('cpf', e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                    errors['pessoa_dados.cpf'] ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors['pessoa_dados.cpf'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.cpf']}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Data de nascimento *
                </label>
                <input
                  type="date"
                  value={formData.pessoa_dados?.data_nascimento || ''}
                  onChange={(e) => onPersonDataChange('data_nascimento', e.target.value)}
                  className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                    errors['pessoa_dados.data_nascimento'] ? 'border-red-500' : 'border-input'
                  }`}
                />
                {errors['pessoa_dados.data_nascimento'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.data_nascimento']}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Sexo *
                </label>
                <select
                  value={formData.pessoa_dados?.sexo || 'M'}
                  onChange={(e) => onPersonDataChange('sexo', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.pessoa_dados?.email || ''}
                  onChange={(e) => onPersonDataChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md ${
                    errors['pessoa_dados.email'] ? 'border-red-500' : 'border-input'
                  }`}
                  placeholder="email@exemplo.com"
                />
                {errors['pessoa_dados.email'] && (
                  <p className="text-red-600 text-xs mt-1">{errors['pessoa_dados.email']}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.pessoa_dados?.telefone || ''}
                  onChange={(e) => onPersonDataChange('telefone', e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Dica:</strong> Você pode completar as informações de endereço depois de criar o usuário.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}