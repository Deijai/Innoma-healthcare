// src/components/forms/UserInfoCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { AlertCircle, Shield } from 'lucide-react';
import { Pessoa } from '@/lib/api-services';

interface UserInfoCardProps {
  papel: string;
  permissoes: string[];
  pessoaSelecionada: Pessoa | null;
}

export function UserInfoCard({ papel, permissoes, pessoaSelecionada }: UserInfoCardProps) {
  return (
    <>
      {/* Informações adicionais */}
      <Card>
        <CardHeader>
          <CardTitle>Informações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-foreground">Fluxo de criação:</p>
              <ul className="mt-2 space-y-1 text-xs">
                <li>• {pessoaSelecionada ? 'Pessoa já selecionada' : 'Selecione ou crie uma pessoa'}</li>
                <li>• Configure dados de acesso (usuário/senha)</li>
                <li>• Defina papel e permissões</li>
                <li>• Usuário ficará ativo por padrão</li>
                <li>• Senhas devem ter pelo menos 6 caracteres</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview do papel */}
      {papel && (
        <Card>
          <CardHeader>
            <CardTitle>Papel Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-medium">{papel}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {permissoes.length} permissões atribuídas
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}