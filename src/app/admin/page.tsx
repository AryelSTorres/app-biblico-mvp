'use client';

import { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Database } from 'lucide-react';

export default function AdminPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.sql')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        setResult({ success: false, message: 'Por favor, selecione um arquivo .sql válido' });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setResult(null);

    try {
      const text = await file.text();
      
      const response = await fetch('/api/import-bible', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sqlContent: text }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: data.message || 'Bíblia importada com sucesso!' });
        setFile(null);
      } else {
        setResult({ success: false, message: data.error || 'Erro ao importar a Bíblia' });
      }
    } catch (error) {
      setResult({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao processar o arquivo' 
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-10 h-10 text-blue-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Importar Bíblia
            </h1>
          </div>
          <p className="text-gray-600">
            Faça upload do arquivo SQL da Bíblia ACF para importar todos os versículos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                accept=".sql"
                onChange={handleFileChange}
                className="hidden"
                id="sql-upload"
                disabled={uploading}
              />
              <label
                htmlFor="sql-upload"
                className="cursor-pointer flex flex-col items-center gap-4"
              >
                <Upload className="w-16 h-16 text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    {file ? file.name : 'Clique para selecionar o arquivo SQL'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Apenas arquivos .sql são aceitos
                  </p>
                </div>
              </label>
            </div>

            {/* Upload Button */}
            {file && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-lg text-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Database className="w-5 h-5" />
                    Importar Bíblia para o Supabase
                  </>
                )}
              </button>
            )}

            {/* Result Messages */}
            {result && (
              <div className={`rounded-lg p-4 flex items-start gap-3 ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                  {result.message}
                </p>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <h3 className="font-semibold text-blue-900 mb-2">
                Instruções:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                <li>O arquivo SQL deve conter a estrutura completa da Bíblia ACF</li>
                <li>Certifique-se de que as tabelas estão criadas no Supabase</li>
                <li>O processo pode levar alguns minutos dependendo do tamanho do arquivo</li>
                <li>Aguarde a confirmação antes de fechar esta página</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Voltar para a página inicial
          </a>
        </div>
      </div>
    </div>
  );
}
