import { NextRequest, NextResponse } from 'next/server';
import { explainWord } from '@/lib/ai-service';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { word, context, testament } = await request.json();

    if (!word || !testament) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos' },
        { status: 400 }
      );
    }

    // Verificar cache primeiro
    const { data: cached, error: cacheError } = await supabase
      .from('word_cache')
      .select('*')
      .eq('word', word.toLowerCase())
      .eq('testament', testament)
      .single();

    if (cached && !cacheError) {
      console.log('✅ Cache hit para palavra:', word);
      return NextResponse.json({
        originalText: cached.original_text,
        explanation: cached.explanation,
      });
    }

    console.log('🔍 Buscando explicação para:', word);

    // Buscar explicação da IA
    const result = await explainWord(word, context || '', testament);

    // Salvar no cache
    try {
      await supabase.from('word_cache').insert({
        word: word.toLowerCase(),
        testament,
        original_text: result.originalText,
        explanation: result.explanation,
      });
      console.log('💾 Salvo no cache:', word);
    } catch (cacheInsertError) {
      console.error('⚠️ Erro ao salvar cache:', cacheInsertError);
      // Continuar mesmo se falhar ao salvar no cache
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('❌ Erro ao explicar palavra:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
