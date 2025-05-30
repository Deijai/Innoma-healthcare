import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Perfis de Usuário</h1>
        <p className="text-muted-foreground">Configure perfis e permissões</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-border">
              <h3 className="font-semibold">Admin</h3>
              <p className="text-sm text-muted-foreground">Acesso total ao sistema</p>
            </div>
            <div className="p-4 border border-border">
              <h3 className="font-semibold">Editor</h3>
              <p className="text-sm text-muted-foreground">Pode editar conteúdo</p>
            </div>
            <div className="p-4 border border-border">
              <h3 className="font-semibold">Usuário</h3>
              <p className="text-sm text-muted-foreground">Acesso básico</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}