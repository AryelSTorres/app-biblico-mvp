import { supabase } from './supabase';

export type WordExplanation = {
  word: string;
  original: string;
  transliteration: string;
  meaning: string;
  context: string;
  usage: string;
};

export async function getWordExplanation(
  word: string,
  context: string,
  testament: 'old' | 'new'
): Promise<WordExplanation | null> {
  try {
    // Verificar cache primeiro
    const { data: cached } = await supabase
      .from('ai_explanations_cache')
      .select('*')
      .eq('word', word.toLowerCase())
      .eq('context', context.substring(0, 100))
      .single();

    if (cached) {
      return cached.explanation as WordExplanation;
    }

    // Se não tiver no cache, buscar da API
    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word, context, testament }),
    });

    if (!response.ok) {
      throw new Error('Erro ao buscar explicação');
    }

    const explanation: WordExplanation = await response.json();

    // Salvar no cache
    await supabase.from('ai_explanations_cache').insert({
      word: word.toLowerCase(),
      context: context.substring(0, 100),
      explanation,
    });

    return explanation;
  } catch (error) {
    console.error('Erro ao buscar explicação:', error);
    return null;
  }
}
