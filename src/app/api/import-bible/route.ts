import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    const { sqlContent } = await request.json();

    if (!sqlContent) {
      return NextResponse.json(
        { error: 'Conteúdo SQL não fornecido' },
        { status: 400 }
      );
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Credenciais do Supabase não configuradas' },
        { status: 500 }
      );
    }

    // Criar cliente Supabase com service role key para executar SQL
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Dividir o SQL em statements individuais
    const statements = sqlContent
      .split(';')
      .map((stmt: string) => stmt.trim())
      .filter((stmt: string) => stmt.length > 0 && !stmt.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Executar cada statement
    for (const statement of statements) {
      try {
        // Usar rpc para executar SQL direto (requer função no Supabase)
        // Alternativa: usar a API REST do Supabase para inserções
        
        // Para INSERT statements, vamos processar diretamente
        if (statement.toUpperCase().includes('INSERT INTO')) {
          // Extrair nome da tabela e valores
          const tableMatch = statement.match(/INSERT INTO\s+(\w+)/i);
          const valuesMatch = statement.match(/VALUES\s*\((.*)\)/i);
          
          if (tableMatch && valuesMatch) {
            const tableName = tableMatch[1];
            const valuesStr = valuesMatch[1];
            
            // Parse dos valores (simplificado - pode precisar de ajustes)
            const values = valuesStr.split(',').map(v => {
              const trimmed = v.trim();
              // Remove aspas
              if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
                return trimmed.slice(1, -1);
              }
              return trimmed === 'NULL' ? null : trimmed;
            });

            // Mapear para objeto (assumindo ordem das colunas)
            // Isso precisa ser ajustado baseado na estrutura real
            const { error } = await supabase
              .from(tableName)
              .insert({ /* dados mapeados */ });

            if (error) {
              errorCount++;
              errors.push(`Erro em ${tableName}: ${error.message}`);
            } else {
              successCount++;
            }
          }
        }
      } catch (err) {
        errorCount++;
        errors.push(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    }

    return NextResponse.json({
      message: `Importação concluída: ${successCount} sucesso, ${errorCount} erros`,
      successCount,
      errorCount,
      errors: errors.slice(0, 10), // Primeiros 10 erros
    });

  } catch (error) {
    console.error('Erro ao importar Bíblia:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Erro ao processar importação' },
      { status: 500 }
    );
  }
}
