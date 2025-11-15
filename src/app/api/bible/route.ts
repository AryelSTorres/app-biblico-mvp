import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BIBLE_API_KEY = process.env.NEXT_PUBLIC_BIBLE_API_KEY || 'demo-key';
const BIBLE_API_BASE = 'https://api.scripture.api.bible/v1';

// IDs de versões em português da API Bible
const BIBLE_VERSIONS_PT = [
  'f72b840c855f362c-04', // Almeida Revista e Atualizada (ARA)
  '06125adad2d5898a-01', // Nova Versão Internacional (NVI)
];

type Verse = {
  id: string;
  reference: string;
  verseNumber: number;
  content: string;
};

type Chapter = {
  id: string;
  reference: string;
  verses: Verse[];
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');

  if (!book || !chapter) {
    return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
  }

  try {
    // Verificar cache primeiro
    const { data: cached, error: cacheError } = await supabase
      .from('bible_cache')
      .select('*')
      .eq('book', book)
      .eq('chapter', parseInt(chapter))
      .eq('version', 'pt')
      .single();

    if (cached && !cacheError) {
      console.log('✅ Cache hit:', book, chapter);
      return NextResponse.json(cached.content);
    }

    console.log('🔍 Buscando da API Bible:', book, chapter);

    // Tentar buscar da API Bible com a primeira versão em português
    const bibleId = BIBLE_VERSIONS_PT[0];
    const chapterReference = `${book}.${chapter}`;

    const response = await fetch(
      `${BIBLE_API_BASE}/bibles/${bibleId}/chapters/${chapterReference}?content-type=json&include-notes=false&include-titles=false&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`,
      {
        headers: {
          'api-key': BIBLE_API_KEY,
        },
      }
    );

    if (!response.ok) {
      console.error('❌ Erro na API Bible:', response.status, response.statusText);
      
      // Se falhar, retornar dados de exemplo
      return NextResponse.json(getMockChapter(book, parseInt(chapter)));
    }

    const data = await response.json();
    
    // Processar os versículos
    const verses: Verse[] = [];
    
    if (data.data && data.data.content) {
      // Parse do HTML retornado pela API
      const content = data.data.content;
      const verseMatches = content.matchAll(/<span[^>]*data-number="(\d+)"[^>]*class="v"[^>]*>(.*?)<\/span>/gs);
      
      for (const match of verseMatches) {
        const verseNumber = parseInt(match[1]);
        let verseText = match[2];
        
        // Limpar HTML tags
        verseText = verseText.replace(/<[^>]+>/g, '').trim();
        
        if (verseText) {
          verses.push({
            id: `${book}.${chapter}.${verseNumber}`,
            reference: `${book} ${chapter}:${verseNumber}`,
            verseNumber,
            content: verseText,
          });
        }
      }
    }

    // Se não conseguiu processar versículos, usar mock
    if (verses.length === 0) {
      console.log('⚠️ Nenhum versículo processado, usando mock');
      return NextResponse.json(getMockChapter(book, parseInt(chapter)));
    }

    const chapterData: Chapter = {
      id: `${book}.${chapter}`,
      reference: `${getBookName(book)} ${chapter}`,
      verses,
    };

    // Salvar no cache
    try {
      await supabase.from('bible_cache').insert({
        book,
        chapter: parseInt(chapter),
        version: 'pt',
        content: chapterData,
      });
      console.log('💾 Salvo no cache:', book, chapter);
    } catch (cacheInsertError) {
      console.error('⚠️ Erro ao salvar cache:', cacheInsertError);
    }

    return NextResponse.json(chapterData);
  } catch (error) {
    console.error('❌ Erro geral:', error);
    
    // Em caso de erro, retornar dados de exemplo
    return NextResponse.json(getMockChapter(book, parseInt(chapter)));
  }
}

function getBookName(bookId: string): string {
  const bookNames: Record<string, string> = {
    GEN: 'Gênesis',
    EXO: 'Êxodo',
    LEV: 'Levítico',
    NUM: 'Números',
    DEU: 'Deuteronômio',
    JOS: 'Josué',
    JDG: 'Juízes',
    RUT: 'Rute',
    '1SA': '1 Samuel',
    '2SA': '2 Samuel',
    '1KI': '1 Reis',
    '2KI': '2 Reis',
    '1CH': '1 Crônicas',
    '2CH': '2 Crônicas',
    EZR: 'Esdras',
    NEH: 'Neemias',
    EST: 'Ester',
    JOB: 'Jó',
    PSA: 'Salmos',
    PRO: 'Provérbios',
    ECC: 'Eclesiastes',
    SNG: 'Cantares',
    ISA: 'Isaías',
    JER: 'Jeremias',
    LAM: 'Lamentações',
    EZK: 'Ezequiel',
    DAN: 'Daniel',
    HOS: 'Oséias',
    JOL: 'Joel',
    AMO: 'Amós',
    OBA: 'Obadias',
    JON: 'Jonas',
    MIC: 'Miquéias',
    NAM: 'Naum',
    HAB: 'Habacuque',
    ZEP: 'Sofonias',
    HAG: 'Ageu',
    ZEC: 'Zacarias',
    MAL: 'Malaquias',
    MAT: 'Mateus',
    MRK: 'Marcos',
    LUK: 'Lucas',
    JHN: 'João',
    ACT: 'Atos',
    ROM: 'Romanos',
    '1CO': '1 Coríntios',
    '2CO': '2 Coríntios',
    GAL: 'Gálatas',
    EPH: 'Efésios',
    PHP: 'Filipenses',
    COL: 'Colossenses',
    '1TH': '1 Tessalonicenses',
    '2TH': '2 Tessalonicenses',
    '1TI': '1 Timóteo',
    '2TI': '2 Timóteo',
    TIT: 'Tito',
    PHM: 'Filemom',
    HEB: 'Hebreus',
    JAS: 'Tiago',
    '1PE': '1 Pedro',
    '2PE': '2 Pedro',
    '1JN': '1 João',
    '2JN': '2 João',
    '3JN': '3 João',
    JUD: 'Judas',
    REV: 'Apocalipse',
  };
  
  return bookNames[bookId] || bookId;
}

function getMockChapter(book: string, chapter: number): Chapter {
  // Dados de exemplo para João 3
  if (book === 'JHN' && chapter === 3) {
    return {
      id: 'JHN.3',
      reference: 'João 3',
      verses: [
        {
          id: 'JHN.3.1',
          reference: 'João 3:1',
          verseNumber: 1,
          content: 'Havia entre os fariseus um homem chamado Nicodemos, um dos principais dos judeus.',
        },
        {
          id: 'JHN.3.2',
          reference: 'João 3:2',
          verseNumber: 2,
          content: 'Este foi ter com Jesus, de noite, e disse-lhe: Rabi, sabemos que és Mestre vindo da parte de Deus; porque ninguém pode fazer estes sinais que tu fazes, se Deus não estiver com ele.',
        },
        {
          id: 'JHN.3.3',
          reference: 'João 3:3',
          verseNumber: 3,
          content: 'Respondeu Jesus: Em verdade, em verdade te digo que, se alguém não nascer de novo, não pode ver o reino de Deus.',
        },
        {
          id: 'JHN.3.4',
          reference: 'João 3:4',
          verseNumber: 4,
          content: 'Perguntou-lhe Nicodemos: Como pode um homem nascer, sendo velho? Pode, porventura, voltar ao ventre materno e nascer segunda vez?',
        },
        {
          id: 'JHN.3.5',
          reference: 'João 3:5',
          verseNumber: 5,
          content: 'Respondeu Jesus: Em verdade, em verdade te digo: quem não nascer da água e do Espírito não pode entrar no reino de Deus.',
        },
        {
          id: 'JHN.3.16',
          reference: 'João 3:16',
          verseNumber: 16,
          content: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
        },
      ],
    };
  }

  // Dados genéricos para outros capítulos
  return {
    id: `${book}.${chapter}`,
    reference: `${getBookName(book)} ${chapter}`,
    verses: [
      {
        id: `${book}.${chapter}.1`,
        reference: `${getBookName(book)} ${chapter}:1`,
        verseNumber: 1,
        content: 'Este é um texto de exemplo. Configure sua chave da API Bible para ver o conteúdo real.',
      },
    ],
  };
}
