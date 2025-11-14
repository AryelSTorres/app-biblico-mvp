import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { word, context, testament } = await request.json();

    const language = testament === 'old' ? 'hebraico' : 'grego';
    const prompt = `Você é um especialista em línguas bíblicas originais (hebraico e grego).

Analise a palavra "${word}" no seguinte contexto bíblico:
"${context}"

Forneça uma explicação detalhada em português brasileiro sobre:
1. A palavra original em ${language}
2. Transliteração da palavra original
3. Significado literal da palavra
4. Contexto teológico e cultural
5. Como essa palavra é usada em outras passagens bíblicas

Retorne a resposta em formato JSON com a seguinte estrutura:
{
  "word": "palavra em português",
  "original": "palavra original em ${language}",
  "transliteration": "transliteração",
  "meaning": "significado literal",
  "context": "contexto teológico e cultural",
  "usage": "uso em outras passagens"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em línguas bíblicas originais e teologia.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const explanation = JSON.parse(completion.choices[0].message.content || '{}');

    return NextResponse.json(explanation);
  } catch (error) {
    console.error('Erro ao gerar explicação:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar explicação' },
      { status: 500 }
    );
  }
}
