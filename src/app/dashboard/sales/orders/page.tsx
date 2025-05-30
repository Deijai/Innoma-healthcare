// src/app/dashboard/sales/orders/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function OrdersPage() {
  const orders = [
    { id: '#1234', customer: 'João Silva', value: 'R$ 299,90', status: 'Finalizado' },
    { id: '#1235', customer: 'Maria Santos', value: 'R$ 150,00', status: 'Pendente' },
    { id: '#1236', customer: 'Pedro Costa', value: 'R$ 89,90', status: 'Cancelado' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gerencie todos os pedidos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border border-border">
                <div>
                  <p className="font-medium">{order.id}</p>
                  <p className="text-sm text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{order.value}</p>
                  <p className="text-sm text-muted-foreground">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}