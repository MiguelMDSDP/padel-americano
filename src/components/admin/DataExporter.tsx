// All code in ENGLISH, UI labels in PORTUGUESE

import { useState } from 'react';
import type { Tournament } from '@/lib/types';
import { exportTournamentJSON, importTournamentJSON, saveTournament } from '@/lib/db';
import { validateTournament } from '@/lib/utils/validations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, AlertTriangle, Info, Check, X } from 'lucide-react';
import { toast } from 'sonner';

/**
 * DataExporter Component
 * Exports and imports tournament data as JSON
 */
interface DataExporterProps {
  tournament: Tournament;
  onImport: (tournament: Tournament) => void;
}

interface ExportHistoryItem {
  date: Date;
  name: string;
  size: string;
}

export function DataExporter({ tournament, onImport }: DataExporterProps) {
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportData, setPendingImportData] = useState<Tournament | null>(null);

  /**
   * Export tournament to JSON file
   */
  const handleExport = () => {
    setIsExporting(true);

    try {
      // Export tournament to JSON string
      const jsonString = exportTournamentJSON(tournament);

      // Create blob and download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `torneio-${tournament.name.replace(/\s+/g, '-')}-${timestamp}.json`;

      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup URL
      URL.revokeObjectURL(url);

      // Add to history
      const sizeKB = (blob.size / 1024).toFixed(2);
      setExportHistory((prev) => [
        {
          date: new Date(),
          name: filename,
          size: `${sizeKB} KB`,
        },
        ...prev,
      ]);

      toast.success('Torneio exportado com sucesso!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Erro ao exportar torneio');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Handle file selection for import
   */
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      toast.error('Arquivo deve ser do tipo JSON');
      event.target.value = ''; // Reset input
      return;
    }

    setIsImporting(true);

    try {
      // Read file content
      const text = await file.text();

      // Import and parse JSON
      const importedTournament = await importTournamentJSON(text);

      // Validate tournament structure
      const validation = validateTournament(importedTournament);
      if (!validation.isValid) {
        toast.error('JSON inválido ou corrompido');
        console.error('Validation errors:', validation.errors);
        setIsImporting(false);
        event.target.value = ''; // Reset input
        return;
      }

      // Show confirmation dialog
      setPendingImportData(importedTournament);
      setShowImportConfirm(true);
      toast.info('Arquivo carregado. Revise e confirme a importação.');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Erro ao importar: arquivo inválido');
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset input
    }
  };

  /**
   * Confirm import and replace current tournament
   */
  const handleConfirmImport = async () => {
    if (!pendingImportData) return;

    try {
      // Save to IndexedDB
      await saveTournament(pendingImportData);

      // Update parent component
      onImport(pendingImportData);

      toast.success('Torneio importado com sucesso!');
      setShowImportConfirm(false);
      setPendingImportData(null);
    } catch (error) {
      console.error('Error saving imported tournament:', error);
      toast.error('Erro ao salvar torneio importado');
    }
  };

  /**
   * Cancel import
   */
  const handleCancelImport = () => {
    setShowImportConfirm(false);
    setPendingImportData(null);
    toast.info('Importação cancelada');
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card className="border-l-4 border-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Download className="w-5 h-5" />
            Exportar Torneio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Faça backup dos dados do torneio em formato JSON. O arquivo pode ser importado posteriormente.
          </p>

          <Button
            onClick={handleExport}
            disabled={isExporting}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Exportando...' : 'Exportar para JSON'}
          </Button>

          {/* Tournament Info */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Torneio:</span>
                  <p className="font-semibold">{tournament.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Jogadores:</span>
                  <p className="font-semibold">{tournament.players.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Rodadas:</span>
                  <p className="font-semibold">{tournament.rounds.length}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant="outline" className="ml-2">
                    {tournament.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Export History */}
      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              📋 Histórico de Exportações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {exportHistory.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.date.toLocaleString('pt-BR')} • {item.size}
                    </p>
                  </div>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Section */}
      <Card className="border-l-4 border-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Upload className="w-5 h-5" />
            Importar Torneio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Carregue um arquivo JSON de backup para restaurar um torneio.
          </p>

          {/* Warning */}
          <Card className="border-l-4 border-yellow-500 bg-yellow-50">
            <CardContent className="py-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <p className="text-sm text-yellow-800 font-semibold">
                  Atenção: Importar um torneio irá substituir o torneio atual!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File Input */}
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isImporting}
              className="block w-full text-sm text-foreground
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {isImporting && <p className="mt-2 text-sm text-muted-foreground">Carregando arquivo...</p>}
          </div>
        </CardContent>
      </Card>

      {/* Import Confirmation Dialog */}
      {showImportConfirm && pendingImportData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Confirmar Importação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Warning */}
              <Card className="border-l-4 border-yellow-500 bg-yellow-50">
                <CardContent className="py-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Esta ação irá substituir o torneio atual. Todos os dados não salvos serão perdidos.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Imported Data Info */}
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2">Dados do Arquivo:</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="text-muted-foreground">Nome:</span>{' '}
                      <span className="font-semibold">{pendingImportData.name}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Jogadores:</span>{' '}
                      <span className="font-semibold">{pendingImportData.players.length}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Rodadas:</span>{' '}
                      <span className="font-semibold">{pendingImportData.rounds.length}</span>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Status:</span>{' '}
                      <Badge variant="outline" className="ml-2">
                        {pendingImportData.status}
                      </Badge>
                    </p>
                    <p>
                      <span className="text-muted-foreground">Criado em:</span>{' '}
                      <span className="font-semibold">
                        {new Date(pendingImportData.startDate).toLocaleDateString('pt-BR')}
                      </span>
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button onClick={handleConfirmImport} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  <Check className="w-4 h-4 mr-2" />
                  Confirmar Importação
                </Button>
                <Button onClick={handleCancelImport} variant="secondary" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Info */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Informações</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• O arquivo JSON contém todos os dados do torneio</li>
                <li>• Use para fazer backup antes de mudanças importantes</li>
                <li>• Arquivos podem ser compartilhados entre dispositivos</li>
                <li>• Importar valida automaticamente a estrutura dos dados</li>
                <li>• Sempre confirme o nome do torneio antes de importar</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
