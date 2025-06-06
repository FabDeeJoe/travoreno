import { useState, useEffect } from 'react';
import { Quote, QuoteStatus } from '@/types/quote';
import { Task } from '@/types/task';
import { Contact } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileIcon, X, Eye } from 'lucide-react';
import { uploadQuoteFile, deleteQuoteFile } from '@/lib/storage';
import { toast } from 'sonner';

interface QuoteFormProps {
  quote?: Quote;
  contact: Contact;
  task: Task;
  onSubmit: (data: Partial<Quote>) => Promise<void>;
  isSubmitting?: boolean;
  initialFiles?: File[];
  initialReference?: string | null;
}

function getValidDateString(date: any): string {
  if (!date) return new Date().toISOString().split('T')[0];
  const d = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date instanceof Date
      ? date
      : typeof date?.toDate === 'function'
        ? date.toDate()
        : new Date(date);
  return isNaN(d.getTime())
    ? new Date().toISOString().split('T')[0]
    : d.toISOString().split('T')[0];
}

export default function QuoteForm({
  quote,
  contact,
  task,
  onSubmit,
  isSubmitting = false,
  initialFiles = [],
  initialReference = null
}: QuoteFormProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ fileUrl: string; fileName: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<QuoteStatus>(quote?.status || 'draft');
  const [reference, setReference] = useState(quote?.reference || initialReference || '');

  // Initialiser les fichiers uploadés une seule fois au montage du composant
  useEffect(() => {
    if (quote?.files) {
      setUploadedFiles(quote.files);
    }
  }, [quote?.files]);

  // Gérer les fichiers initiaux une seule fois au montage du composant
  useEffect(() => {
    if (initialFiles.length > 0) {
      setSelectedFiles(initialFiles);
      const newPreviews = initialFiles.map(file => {
        if (file.type.startsWith('image/')) {
          return URL.createObjectURL(file);
        }
        return '';
      });
      setFilePreviews(newPreviews);

      // Cleanup function
      return () => {
        newPreviews.forEach(preview => {
          if (preview) URL.revokeObjectURL(preview);
        });
      };
    }
  }, []); // Exécuté une seule fois au montage

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Nettoyer les anciennes previews avant d'en créer de nouvelles
    filePreviews.forEach(preview => {
      if (preview) URL.revokeObjectURL(preview);
    });

    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });

    setSelectedFiles(files);
    setFilePreviews(newPreviews);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setFilePreviews(prev => {
      const newPreviews = [...prev];
      const removedPreview = newPreviews[index];
      if (removedPreview) URL.revokeObjectURL(removedPreview);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const removeUploadedFile = async (fileUrl: string) => {
    setIsUploading(true);
    try {
      await deleteQuoteFile(fileUrl);
      setUploadedFiles(prev => prev.filter(f => f.fileUrl !== fileUrl));
      toast.success('Fichier supprimé');
    } catch (error) {
      toast.error('Erreur lors de la suppression du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const viewFile = (fileUrl: string) => {
    window.open(fileUrl, '_blank');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData(event.currentTarget);
      let newFiles = [...uploadedFiles];
      
      // Upload tous les nouveaux fichiers sélectionnés
      for (const file of selectedFiles) {
        try {
          const uploaded = await uploadQuoteFile(file, quote?.id || 'new');
          newFiles.push(uploaded);
        } catch (error) {
          toast.error(`Erreur lors de l'upload du fichier ${file.name}`);
        }
      }

      // Récupérer et valider les dates
      const quoteDateValue = formData.get('quoteDate') as string;
      const validUntilValue = formData.get('validUntil') as string;
      
      const data: Partial<Quote> = {
        reference: formData.get('reference') as string,
        status: formData.get('status') as QuoteStatus,
        notes: formData.get('notes') as string,
        quoteDate: quoteDateValue ? new Date(quoteDateValue) : new Date(),
        ...(validUntilValue ? { validUntil: new Date(validUntilValue) } : {}),
        files: newFiles,
      };

      await onSubmit(data);
      
      // Nettoyer les previews
      filePreviews.forEach(preview => {
        if (preview) URL.revokeObjectURL(preview);
      });
      
      setSelectedFiles([]);
      setFilePreviews([]);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement du devis');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Référence</Label>
              <Input
                id="reference"
                name="reference"
                defaultValue={quote?.reference || initialReference || ''}
                required
                disabled={isSubmitting || isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <select
                id="status"
                name="status"
                defaultValue={quote?.status || 'draft'}
                disabled={isSubmitting || isUploading}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="draft">Brouillon</option>
                <option value="sent">Envoyé</option>
                <option value="accepted">Accepté</option>
                <option value="rejected">Refusé</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={contact.name}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task">Tâche</Label>
              <Input
                id="task"
                value={task.title}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quoteDate">Date du devis</Label>
              <Input
                id="quoteDate"
                name="quoteDate"
                type="date"
                defaultValue={getValidDateString(quote?.quoteDate)}
                required
                disabled={isSubmitting || isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Date de validité (optionnelle)</Label>
              <Input
                id="validUntil"
                name="validUntil"
                type="date"
                defaultValue={quote?.validUntil ? getValidDateString(quote.validUntil) : undefined}
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes et fichiers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={quote?.notes}
              disabled={isSubmitting || isUploading}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">Fichiers</Label>
            <div className="flex flex-col gap-2">
              {/* Fichiers déjà uploadés */}
              {uploadedFiles.length > 0 && uploadedFiles.map((file, idx) => (
                <div key={file.fileUrl} className="flex items-center gap-2 p-2 border rounded">
                  <FileIcon className="w-5 h-5" />
                  <span className="text-sm">{file.fileName}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => viewFile(file.fileUrl)} disabled={isSubmitting || isUploading}>
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeUploadedFile(file.fileUrl)} disabled={isSubmitting || isUploading}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {/* Fichiers sélectionnés (pas encore uploadés) */}
              {selectedFiles.length > 0 && selectedFiles.map((file, idx) => (
                <div key={file.name + idx} className="flex items-center gap-2 p-2 border rounded">
                  {filePreviews[idx] ? (
                    <img src={filePreviews[idx] as string} alt="Preview" className="w-10 h-10 object-cover" />
                  ) : (
                    <FileIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm">{file.name}</span>
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeSelectedFile(idx)} disabled={isSubmitting || isUploading}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileChange}
                className="max-w-xs"
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting || isUploading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 