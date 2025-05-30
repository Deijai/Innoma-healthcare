// src/app/dashboard/page.tsx
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, ShoppingCart, BarChart3, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos seus dados e métricas importantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Usuários"
          value="1,234"
          change="+12% em relação ao mês passado"
          icon={<Users className="h-6 w-6" />}
        />
        <StatsCard
          title="Vendas"
          value="R$ 45.231"
          change="+8% em relação ao mês passado"
          icon={<ShoppingCart className="h-6 w-6" />}
        />
        <StatsCard
          title="Pedidos"
          value="856"
          change="+15% em relação ao mês passado"
          icon={<BarChart3 className="h-6 w-6" />}
        />
        <StatsCard
          title="Crescimento"
          value="23%"
          change="Meta: 20%"
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Novo usuário registrado</p>
                  <p className="text-xs text-muted-foreground">2 minutos atrás</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Pedido #1234 finalizado</p>
                  <p className="text-xs text-muted-foreground">5 minutos atrás</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div>
                  <p className="text-sm font-medium">Relatório gerado</p>
                  <p className="text-xs text-muted-foreground">10 minutos atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Status</span>
                <span className="text-sm text-green-600">Operacional</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-sm text-green-600">Conectado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-sm text-yellow-600">85% usado</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Backup</span>
                <span className="text-sm text-green-600">Atualizado</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}