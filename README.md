# 📖 Bíblia Interativa - App Web

Um aplicativo web moderno e interativo para leitura da Bíblia em português, com recursos de análise de palavras originais e explicações contextuais geradas por IA.

## ✨ Funcionalidades

- 📚 **Leitura Completa**: Acesso a todos os 66 livros da Bíblia
- 🔤 **Palavras Interativas**: Clique em qualquer palavra para ver o texto original (hebraico/grego)
- 🤖 **Explicações por IA**: Receba explicações contextuais geradas pela OpenAI
- 💬 **Sistema de Comentários**: Adicione comentários pessoais sobre capítulos
- 🔐 **Autenticação**: Sistema completo de login e registro
- ⚡ **Cache Inteligente**: Performance otimizada com cache de capítulos e palavras
- 📱 **Responsivo**: Interface adaptada para mobile, tablet e desktop
- 🎨 **Design Moderno**: Interface limpa e intuitiva com Tailwind CSS

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase (gratuita)
- Chave da API Bible (gratuita)
- Chave da OpenAI API

### Instalação

1. Clone o repositório
```bash
git clone <seu-repositorio>
cd bible-app
```

2. Instale as dependências
```bash
npm install
```

3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase

# API Bible
NEXT_PUBLIC_BIBLE_API_KEY=sua_chave_da_api_bible

# OpenAI
OPENAI_API_KEY=sua_chave_da_openai
```

4. Execute o projeto
```bash
npm run dev
```

5. Acesse no navegador
```
http://localhost:3000
```

## 📋 Configuração Detalhada

Para instruções completas de configuração, consulte o arquivo [SETUP.md](./SETUP.md).

### Obter Chaves de API

#### API Bible
1. Acesse https://scripture.api.bible/
2. Crie uma conta gratuita
3. Obtenha sua API Key no dashboard

#### Supabase
1. Acesse https://supabase.com/
2. Crie um novo projeto
3. Copie a URL e a chave anon do painel de configurações
4. As tabelas serão criadas automaticamente

#### OpenAI
1. Acesse https://platform.openai.com/
2. Crie uma conta e adicione créditos
3. Gere uma API Key em "API Keys"

## 🗄️ Estrutura do Banco de Dados

O aplicativo usa Supabase com as seguintes tabelas:

- **bible_cache**: Cache de capítulos da Bíblia
- **profiles**: Perfis dos usuários
- **comments**: Comentários dos usuários
- **word_cache**: Cache de palavras originais e explicações

As tabelas são criadas automaticamente quando você executa o app pela primeira vez.

## 🎯 Como Usar

1. **Navegação**: Selecione um livro e capítulo usando os menus dropdown
2. **Leitura**: Leia o texto bíblico formatado com versículos numerados
3. **Palavras**: Clique em qualquer palavra para ver:
   - Texto original (hebraico para Antigo Testamento, grego para Novo Testamento)
   - Explicação contextual gerada por IA
4. **Comentários**: Faça login e adicione comentários pessoais sobre capítulos
   - Usuários gratuitos: 1 comentário por mês
   - Usuários premium: comentários ilimitados (futuro)

## 🛠️ Tecnologias

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS v4, Shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth)
- **APIs**: API Bible, OpenAI GPT-4
- **Ícones**: Lucide React
- **Notificações**: Sonner

## 📱 Responsividade

O app é totalmente responsivo e funciona perfeitamente em:
- 📱 Smartphones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Telas grandes (1440px+)

## 🔒 Segurança

- Row Level Security (RLS) habilitado em todas as tabelas
- Autenticação via Supabase Auth
- Usuários só podem acessar seus próprios dados
- Cache público apenas para leitura

## 📊 Performance

- Cache de capítulos da Bíblia (evita chamadas repetidas à API)
- Cache de palavras explicadas (reduz custos de IA)
- Otimização de imagens e assets
- Lazy loading de componentes

## 🐛 Troubleshooting

### Problema: Texto não carrega
- Verifique se a chave da API Bible está configurada corretamente
- Confirme que há conexão com internet
- Veja os logs do console para erros específicos

### Problema: Explicações não funcionam
- Verifique se a chave da OpenAI está configurada
- Confirme que há créditos disponíveis na conta OpenAI
- Verifique os logs do servidor

### Problema: Autenticação falha
- Confirme as credenciais do Supabase
- Verifique se o Email provider está habilitado no Supabase
- Veja os logs de autenticação

## 🚧 Roadmap

- [x] Leitura completa da Bíblia
- [x] Sistema de palavras interativas
- [x] Explicações por IA
- [x] Sistema de comentários
- [x] Cache inteligente
- [ ] Sistema de favoritos
- [ ] Notas pessoais
- [ ] Planos premium
- [ ] Compartilhamento de versículos
- [ ] Modo escuro
- [ ] Busca avançada
- [ ] Planos de leitura

## 📄 Licença

Este projeto está sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## 📞 Suporte

Para dúvidas e suporte, consulte:
- [Documentação de Setup](./SETUP.md)
- [Issues do GitHub](seu-repositorio/issues)

---

**Desenvolvido com ❤️ usando Next.js, React, Supabase e OpenAI**
