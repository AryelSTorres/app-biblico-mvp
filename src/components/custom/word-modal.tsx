'use client';

import { useEffect, useState } from 'react';
import { X, Loader2, BookOpen, Languages, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { getWordExplanation, type WordExplanation } from '@/lib/ai-service';

type WordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  word: string;
  context: string;
  testament: 'old' | 'new';
};

export function WordModal({ isOpen, onClose, word, context, testament }: WordModalProps) {
  const [explanation, setExplanation] = useState<WordExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && word) {
      fetchExplanation();
    }
  }, [isOpen, word]);

  async function fetchExplanation() {
    setLoading(true);
    setError(null);
    try {
      const result = await getWordExplanation(word, context, testament);
      if (result) {
        setExplanation(result);
      } else {
        setError('Não foi possível obter a explicação');
      }
    } catch (err) {
      setError('Erro ao buscar explicação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="w-6 h-6 text-blue-600" />
            {word}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600">Buscando explicação...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {explanation && !loading && (
          <div className="space-y-6">
            {/* Palavra Original */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
              <div className="flex items-center gap-2 mb-3">
                <Languages className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-lg text-gray-900">Texto Original</h3>
              </div>
              <div className="space-y-2">
                <p className="text-3xl font-bold text-blue-900">{explanation.original}</p>
                <p className="text-lg text-gray-600 italic">{explanation.transliteration}</p>
              </div>
            </div>

            <Separator />

            {/* Significado */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-lg text-gray-900">Significado Literal</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">{explanation.meaning}</p>
            </div>

            <Separator />

            {/* Contexto */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Contexto Teológico e Cultural
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {explanation.context}
              </p>
            </div>

            <Separator />

            {/* Uso em outras passagens */}
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-3">
                Uso em Outras Passagens
              </h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {explanation.usage}
              </p>
            </div>

            {/* Contexto da passagem */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="font-medium text-sm text-gray-600 mb-2">Contexto da Passagem:</h4>
              <p className="text-sm text-gray-700 italic">"{context}"</p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
