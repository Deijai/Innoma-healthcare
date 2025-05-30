// src/app/dashboard/sales/products/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProductsPage() {
  const products = [
    { id: 1, name: 'Produto A', price: 'R$ 99,90', stock: 45 },
    { id: 2, name: 'Produto B', price: 'R$ 149,90', stock: 23 },
    { id: 3, name: 'Produto C', price: 'R$ 79,90', stock: 67 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Produtos</h1>
        <p className="text-muted-foreground">Gerencie seu catálogo de produtos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogo de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product.id} className="p-4 border border-border">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-lg font-bold text-primary">{product.price}</p>
                <p className="text-sm text-muted-foreground">Estoque: {product.stock}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}