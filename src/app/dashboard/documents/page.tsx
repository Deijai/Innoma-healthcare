// src/app/dashboard/documents/page.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, Download } from 'lucide-react';

export default function DocumentsPage() {
  const documents = [
    { name: 'Relatório Mensal', type: 'PDF', size: '1.2 MB', date: '15/05/2024' },
    { name: 'Planilha de Vendas', type: 'XLSX', size: '856 KB', date: '14/05/2024' },
    { name: 'Contrato de Serviços', type: 'PDF', size: '2.1 MB', date: '13/05/2024' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documentos</h1>
        <p className="text-muted-foreground">Gerencie seus arquivos e documentos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Arquivos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-border">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">{doc.type} • {doc.size} • {doc.date}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-accent">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}