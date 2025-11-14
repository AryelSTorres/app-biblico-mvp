'use client';

import { useState, useEffect } from 'react';
import { Book, ChevronLeft, ChevronRight, MessageSquare, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WordModal } from './word-modal';
import { AuthModal } from './auth-modal';
import { BIBLE_BOOKS } from '@/lib/bible-api';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

export function BibleReader() {
  const [selectedBook, setSelectedBook] = useState('JHN');
  const [selectedChapter, setSelectedChapter] = useState(3);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Modal de palavra
  const [wordModalOpen, setWordModalOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedContext, setSelectedContext] = useState('');
  
  // Autenticação
  const [user, setUser] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Comentários
  const [comment, setComment] = useState('');
  const [userComments, setUserComments] = useState<any[]>([]);
  const [canComment, setCanComment] = useState(true);

  useEffect(() => {
    checkUser();
    fetchChapter();
  }, [selectedBook, selectedChapter]);

  useEffect(() => {
    if (user) {
      checkCommentLimit();
      fetchUserComments();
    }
  }, [user, selectedBook, selectedChapter]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('Logout realizado com sucesso');
  }

  async function fetchChapter() {
    setLoading(true);
    try {
      const response = await fetch(`/api/bible?book=${selectedBook}&chapter=${selectedChapter}`);
      const data = await response.json();
      setChapter(data);
    } catch (error) {
      toast.error('Erro ao carregar capítulo');
    } finally {
      setLoading(false);
    }
  }

  async function checkCommentLimit() {
    if (!user) return;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', firstDayOfMonth.toISOString());

    if (error) {
      console.error('Erro ao verificar limite:', error);
      return;
    }

    setCanComment((data?.length || 0) < 1);
  }

  async function fetchUserComments() {
    if (!user) return;

    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('user_id', user.id)
      .eq('book', selectedBook)
      .eq('chapter', selectedChapter)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUserComments(data);
    }
  }

  async function handleAddComment() {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!canComment) {
      toast.error('Você já atingiu o limite de 1 comentário por mês');
      return;
    }

    if (!comment.trim()) {
      toast.error('Digite um comentário');
      return;
    }

    try {
      const { error } = await supabase.from('comments').insert({
        user_id: user.id,
        book: selectedBook,
        chapter: selectedChapter,
        comment: comment.trim(),
      });

      if (error) throw error;

      toast.success('Comentário adicionado com sucesso!');
      setComment('');
      fetchUserComments();
      checkCommentLimit();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar comentário');
    }
  }

  function handleWordClick(word: string, verseContent: string) {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const cleanWord = word.replace(/[.,;:!?]/g, '').trim();
    setSelectedWord(cleanWord);
    setSelectedContext(verseContent);
    setWordModalOpen(true);
  }

  const currentBookData = BIBLE_BOOKS.find(b => b.id === selectedBook);
  const testament = BIBLE_BOOKS.findIndex(b => b.id === selectedBook) < 39 ? 'old' : 'new';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Book className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Bíblia Interativa
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user.email}
                  </span>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setAuthModalOpen(true)} size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Seleção de Livro e Capítulo */}
        <Card className="p-6 mb-8 bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Livro</label>
              <Select value={selectedBook} onValueChange={setSelectedBook}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {BIBLE_BOOKS.map((book) => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedChapter(Math.max(1, selectedChapter - 1))}
                disabled={selectedChapter === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <div className="flex-1 sm:w-32">
                <label className="text-sm font-medium text-gray-700 mb-2 block text-center">
                  Capítulo
                </label>
                <Select
                  value={selectedChapter.toString()}
                  onValueChange={(v) => setSelectedChapter(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {Array.from({ length: currentBookData?.chapters || 1 }, (_, i) => i + 1).map(
                      (num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSelectedChapter(
                    Math.min(currentBookData?.chapters || 1, selectedChapter + 1)
                  )
                }
                disabled={selectedChapter === currentBookData?.chapters}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Texto Bíblico */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8 bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
              {loading ? (
                <div className="text-center py-12 text-gray-500">Carregando...</div>
              ) : chapter ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">
                    {chapter.reference}
                  </h2>

                  <div className="space-y-4">
                    {chapter.verses.map((verse) => (
                      <div key={verse.id} className="group">
                        <div className="flex gap-3">
                          <span className="text-blue-600 font-bold text-sm mt-1 flex-shrink-0">
                            {verse.verseNumber}
                          </span>
                          <p className="text-gray-800 leading-relaxed text-lg">
                            {verse.content.split(' ').map((word, idx) => (
                              <span
                                key={idx}
                                onClick={() => handleWordClick(word, verse.content)}
                                className="cursor-pointer hover:bg-blue-100 hover:text-blue-900 rounded px-1 transition-colors duration-200"
                              >
                                {word}{' '}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Selecione um livro e capítulo
                </div>
              )}
            </Card>
          </div>

          {/* Painel de Comentários */}
          <div className="space-y-6">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-gray-200 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Meus Comentários</h3>
              </div>

              {!user ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">Faça login para adicionar comentários</p>
                  <Button onClick={() => setAuthModalOpen(true)}>
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    placeholder="Adicione seu comentário sobre este capítulo..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px] resize-none"
                    disabled={!canComment}
                  />

                  {!canComment && (
                    <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      Você atingiu o limite de 1 comentário por mês
                    </p>
                  )}

                  <Button
                    onClick={handleAddComment}
                    disabled={!canComment || !comment.trim()}
                    className="w-full"
                  >
                    Adicionar Comentário
                  </Button>

                  {userComments.length > 0 && (
                    <>
                      <Separator className="my-4" />
                      <div className="space-y-3">
                        {userComments.map((c) => (
                          <div
                            key={c.id}
                            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                          >
                            <p className="text-sm text-gray-700">{c.comment}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(c.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </Card>

            {/* Instruções */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <h4 className="font-semibold text-gray-900 mb-3">Como usar:</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Clique em qualquer palavra para ver o texto original e explicação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Adicione comentários pessoais sobre os capítulos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Limite de 1 comentário por mês para usuários gratuitos</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WordModal
        isOpen={wordModalOpen}
        onClose={() => setWordModalOpen(false)}
        word={selectedWord}
        context={selectedContext}
        testament={testament}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={checkUser}
      />
    </div>
  );
}
