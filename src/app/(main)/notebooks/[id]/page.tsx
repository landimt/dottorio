"use client";

import { useState, useEffect, use, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BookOpen, ArrowLeft, Plus, Search, Save, Clock, ChevronDown, ChevronRight, FileText, Trash2, Edit2, Menu, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TipTapEditor } from '@/components/TipTapEditor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import {
  useNotebooks,
  useNotebook,
  useUpdatePage,
  useCreatePage,
  useDeletePage,
  Notebook,
  NotebookPage,
} from '@/lib/query/hooks/use-notebooks';
import type { ProseMirrorDoc } from '@/lib/validations/notebook.schema';

interface NotebookEditorPageProps {
  params: Promise<{ id: string }>;
}

export default function NotebookEditorPage({ params }: NotebookEditorPageProps) {
  const { id } = use(params);
  const t = useTranslations('notebooks.editor');
  const tCommon = useTranslations('common');

  // API hooks
  const { data: allNotebooks = [], isLoading: isLoadingNotebooks } = useNotebooks();
  const { data: currentNotebook, isLoading: isLoadingNotebook } = useNotebook(id);
  const updatePage = useUpdatePage();
  const createPage = useCreatePage();
  const deletePage = useDeletePage();

  // Local state
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  const [content, setContent] = useState<ProseMirrorDoc | null>(null);
  const [contentHtml, setContentHtml] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set([id]));
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState('');
  const [targetNotebookId, setTargetNotebookId] = useState<string | null>(null);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [originalContent, setOriginalContent] = useState<ProseMirrorDoc | null>(null);

  // Get current page from notebook
  const currentPage = currentNotebook?.pages.find(p => p.id === currentPageId) || currentNotebook?.pages[0];

  // Initialize current page when notebook loads
  useEffect(() => {
    if (currentNotebook && !currentPageId) {
      const firstPage = currentNotebook.pages[0];
      if (firstPage) {
        setCurrentPageId(firstPage.id);
        setContent(firstPage.content);
        setContentHtml(firstPage.contentHtml || '');
        setOriginalContent(firstPage.content);
      }
    }
  }, [currentNotebook, currentPageId]);

  // Update content when page changes
  useEffect(() => {
    if (currentPage) {
      setContent(currentPage.content);
      setContentHtml(currentPage.contentHtml || '');
      setOriginalContent(currentPage.content);
    }
  }, [currentPage?.id]);

  const filteredNotebooks = allNotebooks.filter((nb: Notebook) =>
    nb.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (nb.subject && nb.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
    nb.pages.some((page: NotebookPage) => page.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Helper to compare JSON content
  const isContentChanged = useCallback(() => {
    if (!content && !originalContent) return false;
    if (!content || !originalContent) return true;
    return JSON.stringify(content) !== JSON.stringify(originalContent);
  }, [content, originalContent]);

  const handleSave = useCallback(async () => {
    if (!currentPage || !currentNotebook || !isContentChanged()) return;

    setIsSaving(true);

    try {
      await updatePage.mutateAsync({
        pageId: currentPage.id,
        notebookId: currentNotebook.id,
        data: { content, contentHtml },
      });

      setOriginalContent(content);
      setLastSaved(new Date());
      toast.success(t('pageSaved'), {
        description: t('pageSavedDescription')
      });
    } catch {
      toast.error(t('errorSaving'));
    } finally {
      setIsSaving(false);
    }
  }, [currentPage, currentNotebook, content, contentHtml, isContentChanged, updatePage, t]);

  const handleSwitchPage = async (notebook: Notebook, page: NotebookPage) => {
    // Save current page before switching if content has changed
    if (isContentChanged() && currentPage && currentNotebook) {
      await handleSave();
    }

    setCurrentPageId(page.id);
    setContent(page.content);
    setContentHtml(page.contentHtml || '');
    setOriginalContent(page.content);
    setIsSidebarOpen(false);
  };

  const toggleNotebookExpansion = (notebookId: string) => {
    const newExpanded = new Set(expandedNotebooks);
    if (newExpanded.has(notebookId)) {
      newExpanded.delete(notebookId);
    } else {
      newExpanded.add(notebookId);
    }
    setExpandedNotebooks(newExpanded);
  };

  const handleCreatePage = async () => {
    if (!newPageTitle.trim() || !targetNotebookId) return;

    try {
      const newPage = await createPage.mutateAsync({
        notebookId: targetNotebookId,
        data: { title: newPageTitle },
      });

      // If creating in current notebook, switch to new page
      if (targetNotebookId === currentNotebook?.id) {
        setCurrentPageId(newPage.id);
        setContent(newPage.content);
        setContentHtml(newPage.contentHtml || '');
        setOriginalContent(newPage.content);
      }

      setShowNewPageDialog(false);
      setNewPageTitle('');
      setTargetNotebookId(null);

      toast.success(t('newPageCreated'), {
        description: t('pageAddedTo', { page: newPageTitle, notebook: allNotebooks.find((nb: Notebook) => nb.id === targetNotebookId)?.title || '' })
      });
    } catch {
      toast.error(t('errorCreatingPage'));
    }
  };

  const handleDeletePage = async (pageId: string, notebookId: string, pageCount: number) => {
    if (pageCount <= 1) {
      toast.error(t('cannotDelete'), {
        description: t('minOnePage')
      });
      return;
    }

    try {
      await deletePage.mutateAsync({ pageId, notebookId });

      // If deleted current page, switch to first available page
      if (currentPageId === pageId && currentNotebook) {
        const remainingPages = currentNotebook.pages.filter(p => p.id !== pageId);
        if (remainingPages.length > 0) {
          setCurrentPageId(remainingPages[0].id);
          setContent(remainingPages[0].content);
          setContentHtml(remainingPages[0].contentHtml || '');
          setOriginalContent(remainingPages[0].content);
        }
      }

      toast.success(t('pageDeleted'), {
        description: t('pageDeletedDescription')
      });
    } catch {
      toast.error(t('errorDeletingPage'));
    }
  };

  const handleRenamePage = async (pageId: string, newTitle: string) => {
    if (!newTitle.trim() || !currentNotebook) return;

    try {
      await updatePage.mutateAsync({
        pageId,
        notebookId: currentNotebook.id,
        data: { title: newTitle },
      });

      setEditingPageId(null);
      setEditingPageTitle('');

      toast.success(t('pageRenamed'), {
        description: t('titleUpdated')
      });
    } catch {
      toast.error(t('errorRenamingPage'));
    }
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isContentChanged() && content) {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [content, isContentChanged, handleSave]);

  const formatLastSaved = () => {
    if (!lastSaved) return '';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

    if (diff < 60) return t('savedNow');
    if (diff < 3600) return t('savedMinAgo', { minutes: Math.floor(diff / 60) });
    return lastSaved.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  };

  // Loading state
  if (isLoadingNotebook || isLoadingNotebooks) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{tCommon('loading')}</span>
        </div>
      </div>
    );
  }

  // Not found state
  if (!currentNotebook) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{t('notebookNotFound')}</p>
          <Link href="/notebooks">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('allNotebooks')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Mobile overlay quando sidebar está aberta */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar com lista de cadernos e páginas - estilo Notion */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-72 bg-background border-r border-border
        flex flex-col shadow-lg lg:shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-border space-y-3 bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              <h2 className="font-medium text-foreground">{t('notebooks')}</h2>
            </div>
            <Link href="/notebooks">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary transition-all"
                title={t('manageNotebooks')}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={tCommon('search') + '...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-7 h-8 text-sm bg-background border-border focus-visible:ring-primary/20"
            />
          </div>
        </div>

        {/* Lista de Cadernos com Páginas */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredNotebooks.map((nb: Notebook) => (
              <div key={nb.id} className="space-y-0.5">
                {/* Caderno Header */}
                <div
                  className="flex items-center gap-2 p-2 rounded-lg transition-all group hover:bg-muted/50"
                >
                  <button
                    onClick={() => toggleNotebookExpansion(nb.id)}
                    className="flex items-center gap-2 flex-1 text-left"
                  >
                    {expandedNotebooks.has(nb.id) ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-lg shrink-0">{nb.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-foreground">{nb.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{nb.pages.length} {nb.pages.length === 1 ? 'pagina' : 'pagine'}</p>
                    </div>
                  </button>

                  {expandedNotebooks.has(nb.id) && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setTargetNotebookId(nb.id);
                        setShowNewPageDialog(true);
                      }}
                      className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                      title={t('newPage')}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Lista de Páginas (quando expandido) */}
                {expandedNotebooks.has(nb.id) && (
                  <div className="ml-4 pl-3 border-l border-border/50 space-y-0.5">
                    {nb.pages.map((page: NotebookPage) => (
                      <div
                        key={page.id}
                        className={`group/page flex items-center gap-2 p-2 rounded-lg transition-all ${currentPage?.id === page.id && currentNotebook?.id === nb.id
                          ? 'bg-gradient-to-r from-primary/10 to-primary/5 text-primary border border-primary/20'
                          : 'hover:bg-muted/30 text-foreground'
                          }`}
                      >
                        {editingPageId === page.id ? (
                          <Input
                            value={editingPageTitle}
                            onChange={(e) => setEditingPageTitle(e.target.value)}
                            onBlur={() => handleRenamePage(page.id, editingPageTitle)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleRenamePage(page.id, editingPageTitle);
                              if (e.key === 'Escape') setEditingPageId(null);
                            }}
                            className="h-6 text-sm"
                            autoFocus
                          />
                        ) : (
                          <>
                            <button
                              onClick={() => handleSwitchPage(nb, page)}
                              className="flex items-center gap-2 flex-1 min-w-0"
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className={`text-sm truncate ${currentPage?.id === page.id && currentNotebook?.id === nb.id ? 'font-medium' : ''}`}>
                                {page.title}
                              </span>
                            </button>

                            <div className="flex items-center gap-0.5 opacity-0 group-hover/page:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setEditingPageId(page.id);
                                  setEditingPageTitle(page.title);
                                }}
                                className="h-6 w-6 p-0 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
                                title={t('rename')}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeletePage(page.id, nb.id, nb.pages.length)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                                title={t('delete')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-border bg-card/30">
          <Link href="/notebooks">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
              {t('allNotebooks')}
            </Button>
          </Link>
        </div>
      </div>

      {/* Editor Principal */}
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="bg-card/95 backdrop-blur-sm border-b border-border p-3 sm:p-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Menu button mobile */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden h-8 w-8 p-0 shrink-0"
              >
                <Menu className="w-4 h-4" />
              </Button>

              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm shrink-0">
                <span className="text-lg sm:text-2xl">{currentNotebook.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="text-sm sm:text-lg font-medium text-foreground truncate">
                    {currentNotebook.title}
                  </h1>
                  <span className="text-muted-foreground hidden sm:inline">•</span>
                  <span className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:inline">
                    {currentPage?.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {currentNotebook.subject || 'Generale'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Status de salvamento */}
              {lastSaved && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {formatLastSaved()}
                </div>
              )}

              <Button
                onClick={handleSave}
                disabled={isSaving || !isContentChanged()}
                size="sm"
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
              >
                {isSaving ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2 animate-spin" />
                ) : (
                  <Save className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                )}
                <span className="hidden sm:inline">{isSaving ? t('saving') : t('save')}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Editor de Texto com TipTap */}
        <div className="flex-1 overflow-hidden p-3 sm:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <TipTapEditor
              key={`tiptap-${currentNotebook.id}-${currentPage?.id}`}
              content={content}
              onChange={(json, html) => {
                setContent(json);
                setContentHtml(html);
              }}
              placeholder={t('editorPlaceholder', { page: currentPage?.title || '' })}
            />
          </div>
        </div>
      </div>

      {/* Dialog para criar nova página */}
      <Dialog open={showNewPageDialog} onOpenChange={(open) => {
        setShowNewPageDialog(open);
        if (!open) {
          setNewPageTitle('');
          setTargetNotebookId(null);
        }
      }}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t('newPageDialog.title')}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t('newPageDialog.description', { notebook: allNotebooks.find((nb: Notebook) => nb.id === targetNotebookId)?.title || currentNotebook.title })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="page-title" className="text-foreground">{t('newPageDialog.pageTitle')}</Label>
              <Input
                id="page-title"
                placeholder={t('newPageDialog.pageTitlePlaceholder')}
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePage()}
                className="bg-input border-border"
                autoFocus
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreatePage}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={!newPageTitle.trim() || createPage.isPending}
              >
                {createPage.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {tCommon('loading')}
                  </>
                ) : (
                  t('newPageDialog.create')
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowNewPageDialog(false);
                  setNewPageTitle('');
                  setTargetNotebookId(null);
                }}
                variant="outline"
                className="flex-1"
              >
                {t('newPageDialog.cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
