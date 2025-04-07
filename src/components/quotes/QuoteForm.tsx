import { useState } from 'react';
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
}

export default function QuoteForm({ quote, contact, task, onSubmit, isSubmitting = false }: QuoteFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier est trop volumineux (max 5MB)');
        return;
      }

      // Vérifier le type de fichier
      const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Type de fichier non supporté (PDF, PNG, JPG uniquement)');
        return;
      }

      setSelectedFile(file);

      // Créer un aperçu pour les images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.onerror = () => {
          toast.error('Erreur lors de la lecture du fichier');
          setSelectedFile(null);
          setFilePreview(null);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    } catch (error) {
      console.error('Error handling file:', error);
      toast.error('Erreur lors de la sélection du fichier');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
  };

  const viewFile = () => {
    if (quote?.fileUrl) {
      window.open(quote.fileUrl, '_blank');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsUploading(true);

    try {
      const formData = new FormData(event.currentTarget);
      let fileData = quote?.fileUrl ? { fileUrl: quote.fileUrl, fileName: quote.fileName } : undefined;

      // Gérer l'upload du fichier si un nouveau fichier est sélectionné
      if (selectedFile) {
        try {
          // Si un fichier existant, le supprimer d'abord
          if (quote?.fileUrl) {
            await deleteQuoteFile(quote.fileUrl).catch(error => {
              console.error('Error deleting old file:', error);
              // Continue même si la suppression échoue
            });
          }
          
          // Upload le nouveau fichier
          fileData = await uploadQuoteFile(selectedFile, quote?.id || 'new');
        } catch (error) {
          console.error('Error handling file upload:', error);
          toast.error('Erreur lors de l\'upload du fichier');
          return;
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
        ...fileData,
      };

      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting quote:', error);
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
                defaultValue={quote?.reference}
                required
                disabled={isSubmitting || isUploading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select name="status" defaultValue={quote?.status || 'draft'} disabled={isSubmitting || isUploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Brouillon</SelectItem>
                  <SelectItem value="sent">Envoyé</SelectItem>
                  <SelectItem value="accepted">Accepté</SelectItem>
                  <SelectItem value="rejected">Refusé</SelectItem>
                </SelectContent>
              </Select>
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
                defaultValue={quote?.quoteDate ? new Date(quote.quoteDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
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
                defaultValue={quote?.validUntil ? new Date(quote.validUntil).toISOString().split('T')[0] : undefined}
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
            <Label htmlFor="file">Fichier</Label>
            <div className="flex items-center gap-4">
              {quote?.fileUrl && !selectedFile && (
                <div className="flex items-center gap-2 p-2 border rounded">
                  <FileIcon className="w-5 h-5" />
                  <span className="text-sm">{quote.fileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={viewFile}
                    disabled={isSubmitting || isUploading}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    disabled={isSubmitting || isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {selectedFile && (
                <div className="flex items-center gap-2 p-2 border rounded">
                  {filePreview ? (
                    <img src={filePreview} alt="Preview" className="w-10 h-10 object-cover" />
                  ) : (
                    <FileIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm">{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    disabled={isSubmitting || isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <Input
                id="file"
                name="file"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="max-w-xs"
                disabled={isSubmitting || isUploading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting || isUploading ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
} 