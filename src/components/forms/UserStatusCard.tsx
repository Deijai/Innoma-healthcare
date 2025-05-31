// src/components/forms/UserStatusCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CheckCircle, XCircle } from 'lucide-react';

interface UserStatusCardProps {
  ativo: boolean;
  onToggle: (ativo: boolean) => void;
}

export function UserStatusCard({ ativo, onToggle }: UserStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status da Conta</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Usuário ativo</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={ativo}
              onChange={(e) => onToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {ativo ? (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>Usuário poderá fazer login</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-4 w-4" />
              <span>Usuário não poderá fazer login</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}