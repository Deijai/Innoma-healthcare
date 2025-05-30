// src/app/dashboard/users/[id]/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Phone, Calendar, MapPin, Shield } from 'lucide-react';

// Dados mockados do usuário
const getUserData = (id: string) => {
  const users = [
    {
      id: '1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      phone: '(11) 99999-9999',
      role: 'Admin',
      status: 'Ativo',
      createdAt: '15/01/2024',
      lastLogin: '28/05/2024 14:30',
      address: 'São Paulo, SP',
      department: 'Tecnologia',
      avatar: null,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      phone: '(11) 88888-8888',
      role: 'User',
      status: 'Ativo',
      createdAt: '20/02/2024',
      lastLogin: '27/05/2024 09:15',
      address: 'Rio de Janeiro, RJ',
      department: 'Marketing',
      avatar: null,
    },
    {
      id: '3',
      name: 'Pedro Costa',
      email: 'pedro@exemplo.com',
      phone: '(11) 77777-7777',
      role: 'User',
      status: 'Inativo',
      createdAt: '10/03/2024',
      lastLogin: '25/05/2024 16:45',
      address: 'Belo Horizonte, MG',
      department: 'Vendas',
      avatar: null,
    },
  ];
  
  return users.find(user => user.id === id);
};

export default function UserViewPage({ params }: { params: { id: string } }) {
  const user = getUserData(params.id);

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Usuário não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">Detalhes do usuário</p>
          </div>
        </div>
        <Link href={`/dashboard/users/${user.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações Principais */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Telefone</p>
                    <p className="text-sm text-muted-foreground">{user.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Localização</p>
                    <p className="text-sm text-muted-foreground">{user.address}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Departamento</p>
                    <p className="text-sm text-muted-foreground">{user.department}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atividade da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Data de Criação</p>
                    <p className="text-sm text-muted-foreground">{user.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Último Login</p>
                    <p className="text-sm text-muted-foreground">{user.lastLogin}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Função</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user.role === 'Admin' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                }`}>
                  {user.role}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  user.status === 'Ativo' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {user.status}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Resetar Senha
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Enviar Email
              </Button>
              <Button 
                variant="outline" 
                className={`w-full justify-start ${
                  user.status === 'Ativo' 
                    ? 'text-red-600 hover:text-red-700' 
                    : 'text-green-600 hover:text-green-700'
                }`}
              >
                {user.status === 'Ativo' ? 'Desativar Conta' : 'Ativar Conta'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}