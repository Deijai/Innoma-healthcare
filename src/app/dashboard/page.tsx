// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { 
  Users, 
  Heart, 
  Calendar, 
  TrendingUp, 
  Building2, 
  Clock,
  Shield,
  Activity,
  UserCheck,
  Stethoscope
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Dados mockados baseados no papel do usuário
  const getStatsForRole = (papel: string) => {
    switch (papel) {
      case 'ADMIN':
        return [
          { title: 'Total de Usuários', value: '1,234', change: '+12% em relação ao mês passado', icon: Users },
          { title: 'Pacientes Ativos', value: '8,567', change: '+8% em relação ao mês passado', icon: Heart },
          { title: 'Consultas Hoje', value: '142', change: '+15% em relação a ontem', icon: Calendar },
          { title: 'Unidades Ativas', value: '23', change: 'Todas funcionando', icon: Building2 }
        ];
      case 'MEDICO':
        return [
          { title: 'Pacientes Hoje', value: '24', change: '6 consultas restantes', icon: Heart },
          { title: 'Próxima Consulta', value: '14:30', change: 'Em 45 minutos', icon: Clock },
          { title: 'Pacientes do Mês', value: '387', change: '+18% vs mês anterior', icon: UserCheck },
          { title: 'Avaliação Média', value: '4.8', change: 'Baseado em 156 avaliações', icon: TrendingUp }
        ];
      case 'ENFERMEIRO':
        return [
          { title: 'Pacientes Atendidos', value: '45', change: 'Hoje até agora', icon: Heart },
          { title: 'Procedimentos', value: '12', change: '3 pendentes', icon: Activity },
          { title: 'Medicações Aplicadas', value: '28', change: 'Hoje', icon: Stethoscope },
          { title: 'Sinais Vitais', value: '67', change: 'Registros hoje', icon: TrendingUp }
        ];
      case 'RECEPCIONISTA':
        return [
          { title: 'Agendamentos Hoje', value: '89', change: '+12% vs ontem', icon: Calendar },
          { title: 'Check-ins', value: '56', change: '33 restantes', icon: UserCheck },
          { title: 'Cancelamentos', value: '8', change: '-2% vs média', icon: Users },
          { title: 'Lista de Espera', value: '15', change: 'Pacientes aguardando', icon: Clock }
        ];
      default:
        return [
          { title: 'Minhas Tarefas', value: '12', change: '4 pendentes hoje', icon: Users },
          { title: 'Relatórios', value: '8', change: '2 para revisar', icon: Activity },
          { title: 'Notificações', value: '23', change: '5 não lidas', icon: Shield },
          { title: 'Atividade', value: '87%', change: 'Meta: 80%', icon: TrendingUp }
        ];
    }
  };

  const getWelcomeMessage = (papel: string, nome: string) => {
    const firstName = nome.split(' ')[0];
    
    switch (papel) {
      case 'ADMIN':
        return `Bem-vindo de volta, ${firstName}! Aqui está o resumo do sistema hoje.`;
      case 'MEDICO':
        return `Bom dia, Dr(a). ${firstName}! Sua agenda de hoje está organizada.`;
      case 'ENFERMEIRO':
        return `Olá, ${firstName}! Vamos cuidar bem dos nossos pacientes hoje.`;
      case 'RECEPCIONISTA':
        return `Oi, ${firstName}! Temos uma agenda movimentada pela frente.`;
      case 'FARMACEUTICO':
        return `Olá, ${firstName}! Medicamentos e estoque sob controle.`;
      case 'LABORATORISTA':
        return `Bom dia, ${firstName}! Exames e resultados aguardando sua atenção.`;
      case 'GESTOR':
        return `Olá, ${firstName}! Dados e relatórios do sistema atualizados.`;
      default:
        return `Bem-vindo, ${firstName}! Tenha um ótimo dia de trabalho.`;
    }
  };

  const getRecentActivities = (papel: string) => {
    switch (papel) {
      case 'ADMIN':
        return [
          { action: 'Novo usuário cadastrado', time: '2 minutos atrás', type: 'user' },
          { action: 'Backup do sistema realizado', time: '1 hora atrás', type: 'system' },
          { action: 'Relatório mensal gerado', time: '3 horas atrás', type: 'report' },
          { action: 'Atualização de segurança aplicada', time: '1 dia atrás', type: 'security' }
        ];
      case 'MEDICO':
        return [
          { action: 'Consulta finalizada - Maria Silva', time: '15 minutos atrás', type: 'consultation' },
          { action: 'Receita prescrita - João Santos', time: '30 minutos atrás', type: 'prescription' },
          { action: 'Exame solicitado - Ana Costa', time: '1 hora atrás', type: 'exam' },
          { action: 'Consulta agendada para amanhã', time: '2 horas atrás', type: 'appointment' }
        ];
      case 'ENFERMEIRO':
        return [
          { action: 'Sinais vitais registrados', time: '5 minutos atrás', type: 'vitals' },
          { action: 'Medicação aplicada', time: '20 minutos atrás', type: 'medication' },
          { action: 'Procedimento realizado', time: '45 minutos atrás', type: 'procedure' },
          { action: 'Paciente transferido para sala 2', time: '1 hora atrás', type: 'transfer' }
        ];
      default:
        return [
          { action: 'Login realizado com sucesso', time: 'Agora', type: 'login' },
          { action: 'Perfil atualizado', time: '2 horas atrás', type: 'profile' },
          { action: 'Relatório visualizado', time: '1 dia atrás', type: 'report' }
        ];
    }
  };

  const getQuickActions = (papel: string) => {
    switch (papel) {
      case 'ADMIN':
        return [
          { title: 'Gerenciar Usuários', description: 'Adicionar ou editar usuários do sistema' },
          { title: 'Relatórios', description: 'Visualizar relatórios e estatísticas' },
          { title: 'Configurações', description: 'Configurar parâmetros do sistema' },
          { title: 'Backup', description: 'Realizar backup dos dados' }
        ];
      case 'MEDICO':
        return [
          { title: 'Ver Agenda', description: 'Consultar agenda de hoje' },
          { title: 'Novo Atendimento', description: 'Iniciar nova consulta' },
          { title: 'Prescrições', description: 'Gerenciar receitas médicas' },
          { title: 'Exames', description: 'Solicitar ou revisar exames' }
        ];
      case 'ENFERMEIRO':
        return [
          { title: 'Triagem', description: 'Realizar triagem de pacientes' },
          { title: 'Medicações', description: 'Aplicar medicamentos prescritos' },
          { title: 'Sinais Vitais', description: 'Registrar sinais vitais' },
          { title: 'Procedimentos', description: 'Realizar procedimentos de enfermagem' }
        ];
      case 'RECEPCIONISTA':
        return [
          { title: 'Novo Agendamento', description: 'Agendar consulta para paciente' },
          { title: 'Check-in', description: 'Confirmar chegada de pacientes' },
          { title: 'Cadastro', description: 'Cadastrar novo paciente' },
          { title: 'Fila de Espera', description: 'Gerenciar fila de atendimento' }
        ];
      default:
        return [
          { title: 'Meu Perfil', description: 'Atualizar informações pessoais' },
          { title: 'Relatórios', description: 'Acessar relatórios disponíveis' },
          { title: 'Ajuda', description: 'Central de ajuda e suporte' },
          { title: 'Configurações', description: 'Preferências do usuário' }
        ];
    }
  };

  const stats = getStatsForRole(user?.papel || 'USER');
  const welcomeMessage = getWelcomeMessage(user?.papel || 'USER', user?.nome || 'Usuário');
  const activities = getRecentActivities(user?.papel || 'USER');
  const quickActions = getQuickActions(user?.papel || 'USER');

  return (
    <div className="space-y-6">
      {/* Header com Boas-vindas */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-lg border border-border">
        <h1 className="text-3xl font-bold mb-2">
          Dashboard {user?.papel === 'ADMIN' ? 'Administrativo' : 'Pessoal'}
        </h1>
        <p className="text-muted-foreground text-lg">
          {welcomeMessage}
        </p>
        
        {/* Info do Usuário */}
        <div className="flex items-center space-x-4 mt-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Shield className="h-4 w-4" />
            <span>{user?.papel}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Building2 className="h-4 w-4" />
            <span>Tenant: {user?.tenant_id}</span>
          </div>
          {user?.permissoes && user.permissoes.length > 0 && (
            <div className="flex items-center space-x-1">
              <UserCheck className="h-4 w-4" />
              <span>{user.permissoes.length} permissões ativas</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            icon={<stat.icon className="h-6 w-6" />}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Atividade Recente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Ações Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="p-3 text-left border border-border hover:bg-accent hover:border-accent-foreground transition-colors rounded-lg"
                >
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Status do Sistema</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">API Status</p>
              <p className="text-xs text-green-600 dark:text-green-400">Operacional</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Database</p>
              <p className="text-xs text-green-600 dark:text-green-400">Conectado</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="w-8 h-8 bg-yellow-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Storage</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">78% usado</p>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Backup</p>
              <p className="text-xs text-green-600 dark:text-green-400">Atualizado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}