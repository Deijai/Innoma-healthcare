// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
  Stethoscope,
  Loader2,
  Bell,
  Settings,
  FileText,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  ArrowUpRight,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Componente para métricas rápidas
const MetricCard = ({ title, value, change, changeType = 'positive', icon: Icon }: {
  title: string;
  value: string;
  change: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: any;
}) => {
  const changeColor = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className={`text-xs ${changeColor[changeType]} mt-1`}>
              {change}
            </p>
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para ações rápidas
const QuickActionButton = ({ title, description, icon: Icon, onClick, variant = 'default' }: {
  title: string;
  description: string;
  icon: any;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary';
}) => {
  const variants = {
    default: 'border-border hover:bg-accent',
    primary: 'border-primary bg-primary/5 hover:bg-primary/10',
    secondary: 'border-secondary bg-secondary/5 hover:bg-secondary/10'
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${variants[variant]}`}
    >
      <div className="flex items-start space-x-3">
        <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center border">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
      </div>
    </button>
  );
};

// Componente para atividades recentes
const ActivityItem = ({ type, message, time, status }: {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  time: string;
  status?: string;
}) => {
  const icons = {
    success: CheckCircle,
    warning: AlertCircle,
    error: XCircle,
    info: Activity
  };

  const colors = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    error: 'text-red-600 dark:text-red-400',
    info: 'text-blue-600 dark:text-blue-400'
  };

  const Icon = icons[type];

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-border last:border-0">
      <Icon className={`h-4 w-4 mt-0.5 ${colors[type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm">{message}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{time}</p>
          {status && (
            <span className="text-xs px-2 py-1 bg-accent rounded-full">{status}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Verificar autenticação
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Vai redirecionar
  }

  // Dados baseados no papel do usuário
  const getRoleData = (papel: string) => {
    const baseData = {
      ADMIN: {
        title: 'Painel Administrativo',
        metrics: [
          { title: 'Total de Usuários', value: '1,234', change: '+12% este mês', changeType: 'positive' as const, icon: Users },
          { title: 'Pacientes Ativos', value: '8,567', change: '+8% este mês', changeType: 'positive' as const, icon: Heart },
          { title: 'Consultas Hoje', value: '142', change: '+15% vs ontem', changeType: 'positive' as const, icon: Calendar },
          { title: 'Unidades Ativas', value: '23/25', change: '2 em manutenção', changeType: 'neutral' as const, icon: Building2 }
        ],
        quickActions: [
          { title: 'Gerenciar Usuários', description: 'Adicionar, editar e remover usuários', icon: Users, variant: 'primary' as const },
          { title: 'Relatórios Gerais', description: 'Ver estatísticas e relatórios do sistema', icon: BarChart3, variant: 'default' as const },
          { title: 'Configurações', description: 'Configurar parâmetros do sistema', icon: Settings, variant: 'default' as const },
          { title: 'Backup e Segurança', description: 'Gerenciar backups e segurança', icon: Shield, variant: 'secondary' as const }
        ],
        activities: [
          { type: 'info' as const, message: 'Novo usuário cadastrado: Dr. João Silva', time: '2 min atrás', status: 'Médico' },
          { type: 'success' as const, message: 'Backup automático realizado com sucesso', time: '1h atrás' },
          { type: 'warning' as const, message: 'Unidade Centro em manutenção programada', time: '3h atrás', status: 'Programado' },
          { type: 'success' as const, message: 'Atualização de segurança aplicada', time: '1 dia atrás' }
        ]
      },
      MEDICO: {
        title: 'Painel Médico',
        metrics: [
          { title: 'Pacientes Hoje', value: '24', change: '6 consultas restantes', changeType: 'neutral' as const, icon: Heart },
          { title: 'Próxima Consulta', value: '14:30', change: 'Em 45 minutos', changeType: 'neutral' as const, icon: Clock },
          { title: 'Pacientes do Mês', value: '387', change: '+18% vs mês anterior', changeType: 'positive' as const, icon: UserCheck },
          { title: 'Avaliação Média', value: '4.8/5', change: '156 avaliações', changeType: 'positive' as const, icon: TrendingUp }
        ],
        quickActions: [
          { title: 'Ver Agenda', description: 'Consultar agenda de hoje e próximos dias', icon: Calendar, variant: 'primary' as const },
          { title: 'Novo Atendimento', description: 'Iniciar nova consulta ou atendimento', icon: Plus, variant: 'primary' as const },
          { title: 'Prescrições', description: 'Gerenciar receitas e prescrições médicas', icon: FileText, variant: 'default' as const },
          { title: 'Solicitar Exames', description: 'Solicitar exames e procedimentos', icon: Activity, variant: 'secondary' as const }
        ],
        activities: [
          { type: 'success' as const, message: 'Consulta finalizada - Maria Silva', time: '15 min atrás', status: 'Concluída' },
          { type: 'info' as const, message: 'Receita prescrita - João Santos', time: '30 min atrás', status: 'Hipertensão' },
          { type: 'info' as const, message: 'Exame solicitado - Ana Costa', time: '1h atrás', status: 'Laboratório' },
          { type: 'success' as const, message: 'Consulta de retorno agendada', time: '2h atrás' }
        ]
      },
      ENFERMEIRO: {
        title: 'Painel de Enfermagem',
        metrics: [
          { title: 'Pacientes Atendidos', value: '45', change: 'Hoje até agora', changeType: 'neutral' as const, icon: Heart },
          { title: 'Procedimentos', value: '12', change: '3 pendentes', changeType: 'neutral' as const, icon: Activity },
          { title: 'Medicações', value: '28', change: 'Aplicadas hoje', changeType: 'positive' as const, icon: Stethoscope },
          { title: 'Sinais Vitais', value: '67', change: 'Registros hoje', changeType: 'positive' as const, icon: TrendingUp }
        ],
        quickActions: [
          { title: 'Triagem', description: 'Realizar triagem de novos pacientes', icon: UserCheck, variant: 'primary' as const },
          { title: 'Aplicar Medicação', description: 'Registrar medicamentos aplicados', icon: Stethoscope, variant: 'primary' as const },
          { title: 'Sinais Vitais', description: 'Registrar sinais vitais dos pacientes', icon: Activity, variant: 'default' as const },
          { title: 'Procedimentos', description: 'Realizar procedimentos de enfermagem', icon: Plus, variant: 'secondary' as const }
        ],
        activities: [
          { type: 'success' as const, message: 'Sinais vitais registrados - Leito 12', time: '5 min atrás', status: 'Estável' },
          { type: 'success' as const, message: 'Medicação aplicada - Insulina', time: '20 min atrás', status: 'Diabetes' },
          { type: 'info' as const, message: 'Procedimento realizado - Curativo', time: '45 min atrás', status: 'Pós-op' },
          { type: 'info' as const, message: 'Paciente transferido para sala 2', time: '1h atrás' }
        ]
      },
      RECEPCIONISTA: {
        title: 'Painel de Recepção',
        metrics: [
          { title: 'Agendamentos', value: '89', change: '+12% vs ontem', changeType: 'positive' as const, icon: Calendar },
          { title: 'Check-ins', value: '56', change: '33 restantes', changeType: 'neutral' as const, icon: UserCheck },
          { title: 'Cancelamentos', value: '8', change: '-2% vs média', changeType: 'positive' as const, icon: XCircle },
          { title: 'Lista de Espera', value: '15', change: 'Aguardando', changeType: 'neutral' as const, icon: Clock }
        ],
        quickActions: [
          { title: 'Novo Agendamento', description: 'Agendar consulta para paciente', icon: Plus, variant: 'primary' as const },
          { title: 'Check-in Paciente', description: 'Confirmar chegada de pacientes', icon: UserCheck, variant: 'primary' as const },
          { title: 'Cadastrar Paciente', description: 'Cadastrar novo paciente no sistema', icon: Users, variant: 'default' as const },
          { title: 'Gerenciar Fila', description: 'Organizar fila de atendimento', icon: Clock, variant: 'secondary' as const }
        ],
        activities: [
          { type: 'success' as const, message: 'Check-in realizado - Pedro Lima', time: '2 min atrás', status: 'Dr. Silva' },
          { type: 'info' as const, message: 'Agendamento criado para amanhã', time: '10 min atrás', status: 'Cardiologia' },
          { type: 'warning' as const, message: 'Paciente atrasado - Consulta 14h', time: '30 min atrás', status: 'Aguardando' },
          { type: 'success' as const, message: 'Novo paciente cadastrado', time: '1h atrás' }
        ]
      }
    };

    return baseData[papel as keyof typeof baseData] || {
      title: 'Dashboard',
      metrics: [
        { title: 'Tarefas', value: '12', change: '4 pendentes', changeType: 'neutral' as const, icon: Activity },
        { title: 'Relatórios', value: '8', change: '2 para revisar', changeType: 'neutral' as const, icon: FileText },
        { title: 'Notificações', value: '23', change: '5 não lidas', changeType: 'neutral' as const, icon: Bell },
        { title: 'Progresso', value: '87%', change: 'Meta: 80%', changeType: 'positive' as const, icon: TrendingUp }
      ],
      quickActions: [
        { title: 'Meu Perfil', description: 'Atualizar informações pessoais', icon: Users, variant: 'default' as const },
        { title: 'Relatórios', description: 'Acessar relatórios disponíveis', icon: FileText, variant: 'default' as const },
        { title: 'Ajuda', description: 'Central de ajuda e suporte', icon: Shield, variant: 'default' as const },
        { title: 'Configurações', description: 'Preferências do usuário', icon: Settings, variant: 'secondary' as const }
      ],
      activities: [
        { type: 'info' as const, message: 'Login realizado com sucesso', time: 'Agora' },
        { type: 'success' as const, message: 'Perfil atualizado', time: '2h atrás' },
        { type: 'info' as const, message: 'Relatório visualizado', time: '1 dia atrás' }
      ]
    };
  };

  const roleData = getRoleData(user.papel);
  const firstName = user.nome.split(' ')[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{roleData.title}</h1>
              <p className="text-muted-foreground">
                Bom dia, {firstName}! Hoje é {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>{user.papel}</span>
                <span>•</span>
                <Building2 className="h-4 w-4" />
                <span>{user.tenant_id}</span>
              </div>
              
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Notificações</span>
              </Button>
              
              <Button variant="outline" size="sm" onClick={logout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Métricas Principais */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Resumo do Dia</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {roleData.metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Ações Rápidas */}
            <section className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Ações Rápidas</h2>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roleData.quickActions.map((action, index) => (
                  <QuickActionButton 
                    key={index} 
                    {...action}
                    onClick={() => console.log(`Ação: ${action.title}`)}
                  />
                ))}
              </div>
            </section>

            {/* Atividade Recente */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Atividade Recente</h2>
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-0">
                  {roleData.activities.map((activity, index) => (
                    <ActivityItem key={index} {...activity} />
                  ))}
                </CardContent>
              </Card>
            </section>
          </div>

          {/* Status do Sistema */}
          <section>
            <h2 className="text-xl font-semibold mb-6">Status do Sistema</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { name: 'API', status: 'Operacional', color: 'green' },
                { name: 'Database', status: 'Conectado', color: 'green' },
                { name: 'Storage', status: '78% usado', color: 'yellow' },
                { name: 'Backup', status: 'Atualizado', color: 'green' }
              ].map((item, index) => (
                <Card key={index}>
                  <CardContent className="p-4 text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-2 ${
                      item.color === 'green' ? 'bg-green-500' : 
                      item.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className={`text-xs mt-1 ${
                      item.color === 'green' ? 'text-green-600 dark:text-green-400' : 
                      item.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : 
                      'text-red-600 dark:text-red-400'
                    }`}>
                      {item.status}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}