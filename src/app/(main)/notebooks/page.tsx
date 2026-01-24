"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BookOpen, Plus, Search, Calendar, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useNotebooks, useCreateNotebook, Notebook } from '@/lib/query/hooks/use-notebooks';
import { toast } from 'sonner';

export default function NotebooksPage() {
  const t = useTranslations('notebooks');
  const tCommon = useTranslations('common');

  const { data: notebooks = [], isLoading, error } = useNotebooks();
  const createNotebook = useCreateNotebook();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newNotebook, setNewNotebook] = useState({
    title: '',
    subject: '',
    icon: '📓'
  });

  const filteredNotebooks = notebooks.filter((notebook: Notebook) =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (notebook.subject && notebook.subject.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateNotebook = async () => {
    if (!newNotebook.title.trim()) return;

    try {
      await createNotebook.mutateAsync({
        title: newNotebook.title,
        subject: newNotebook.subject || undefined,
        icon: newNotebook.icon,
      });

      setShowCreateDialog(false);
      setNewNotebook({ title: '', subject: '', icon: '📓' });
      toast.success(t('notebookCreated'));
    } catch {
      toast.error(t('errorCreatingNotebook'));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{tCommon('loading')}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">{tCommon('error')}</p>
          <p className="text-muted-foreground text-sm mt-2">{t('errorLoadingNotebooks')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-6">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="space-y-3 sm:space-y-4">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground transition-all -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">{t('backToDashboard')}</span>
              <span className="sm:hidden">{t('back')}</span>
            </Button>
          </Link>

          <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-medium text-foreground">{t('title')}</h1>
              <p className="text-sm text-muted-foreground">
                {notebooks.length} {notebooks.length === 1 ? 'quaderno' : 'quaderni'}
              </p>
            </div>

            <div className="relative group w-full sm:w-auto">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-lg blur opacity-30 group-hover:opacity-60 transition-all" />
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="relative w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('newNotebook')}
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card border-border"
            />
          </div>
        </div>

        {/* Notebooks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredNotebooks.map((notebook: Notebook) => (
            <Link
              key={notebook.id}
              href={`/notebooks/${notebook.id}`}
            >
              <Card
                className="cursor-pointer group transition-all duration-300 border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
              >
                {/* Color bar no topo */}
                <div
                  className="h-1.5 w-full"
                  style={{ backgroundColor: notebook.color || 'hsl(var(--primary) / 0.1)' }}
                />

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110 shadow-sm border border-border"
                        style={{ backgroundColor: notebook.color || undefined }}>
                        {notebook.icon}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <CardTitle className="text-foreground truncate group-hover:text-primary transition-colors">
                          {notebook.title}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notebook.subject || 'Generale'}
                        </p>
                      </div>
                    </div>
                    <BookOpen className="w-5 h-5 text-primary/60 group-hover:text-primary flex-shrink-0 transition-colors" />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(notebook.updatedAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {notebook.pages?.length || notebook._count?.pages || 0} {(notebook.pages?.length || notebook._count?.pages || 0) === 1 ? 'pagina' : 'pagine'}
                      </span>
                      <span className="text-xs text-primary/60 group-hover:text-primary transition-colors font-medium">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredNotebooks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">{t('noNotebooksFound')}</h3>
            <p className="text-muted-foreground text-sm mb-4">
              {searchQuery ? t('tryDifferentSearch') : t('noNotebooksDescription')}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setShowCreateDialog(true)}
                variant="outline"
                className="border-primary/30 text-primary hover:bg-primary/5"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('createNotebook')}
              </Button>
            )}
          </div>
        )}

        {/* Create Notebook Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{t('createDialog.title')}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {t('createDialog.description')}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-foreground">{t('createDialog.notebookTitle')}</Label>
                <Input
                  id="title"
                  placeholder={t('createDialog.notebookTitlePlaceholder')}
                  value={newNotebook.title}
                  onChange={(e) => setNewNotebook({ ...newNotebook, title: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground">{t('createDialog.subject')}</Label>
                <Input
                  id="subject"
                  placeholder={t('createDialog.subjectPlaceholder')}
                  value={newNotebook.subject}
                  onChange={(e) => setNewNotebook({ ...newNotebook, subject: e.target.value })}
                  className="bg-input border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon" className="text-foreground">{t('createDialog.emoji')}</Label>
                <Input
                  id="icon"
                  placeholder="📓"
                  value={newNotebook.icon}
                  onChange={(e) => setNewNotebook({ ...newNotebook, icon: e.target.value })}
                  className="bg-input border-border"
                  maxLength={2}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateNotebook}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!newNotebook.title.trim() || createNotebook.isPending}
                >
                  {createNotebook.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {tCommon('loading')}
                    </>
                  ) : (
                    t('createNotebook')
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  {tCommon('cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
