import { NextRequest, NextResponse } from 'next/server';

// Dados de exemplo para demonstração (João 3:16-17)
const SAMPLE_BIBLE_DATA: Record<string, any> = {
  'JHN.3': {
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
        id: 'JHN.3.16',
        reference: 'João 3:16',
        verseNumber: 16,
        content: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo aquele que nele crê não pereça, mas tenha a vida eterna.',
      },
      {
        id: 'JHN.3.17',
        reference: 'João 3:17',
        verseNumber: 17,
        content: 'Porque Deus enviou o seu Filho ao mundo, não para que condenasse o mundo, mas para que o mundo fosse salvo por ele.',
      },
    ],
  },
  'GEN.1': {
    id: 'GEN.1',
    reference: 'Gênesis 1',
    verses: [
      {
        id: 'GEN.1.1',
        reference: 'Gênesis 1:1',
        verseNumber: 1,
        content: 'No princípio, criou Deus os céus e a terra.',
      },
      {
        id: 'GEN.1.2',
        reference: 'Gênesis 1:2',
        verseNumber: 2,
        content: 'A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.',
      },
      {
        id: 'GEN.1.3',
        reference: 'Gênesis 1:3',
        verseNumber: 3,
        content: 'Disse Deus: Haja luz; e houve luz.',
      },
    ],
  },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');

    if (!book || !chapter) {
      return NextResponse.json(
        { error: 'Parâmetros book e chapter são obrigatórios' },
        { status: 400 }
      );
    }

    const chapterId = `${book}.${chapter}`;
    const chapterData = SAMPLE_BIBLE_DATA[chapterId];

    if (!chapterData) {
      return NextResponse.json(
        { 
          id: chapterId,
          reference: `${book} ${chapter}`,
          verses: [
            {
              id: `${chapterId}.1`,
              reference: `${book} ${chapter}:1`,
              verseNumber: 1,
              content: 'Texto de exemplo. Configure a API Bible para ver o conteúdo real.',
            },
          ],
        }
      );
    }

    return NextResponse.json(chapterData);
  } catch (error) {
    console.error('Erro ao buscar capítulo:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar capítulo' },
      { status: 500 }
    );
  }
}
