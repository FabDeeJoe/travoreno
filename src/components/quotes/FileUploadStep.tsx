import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileIcon, X, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadStepProps {
  onComplete: (files: File[], detectedReference: string | null) => void;
  onCancel: () => void;
}

export function FileUploadStep({ onComplete, onCancel }: FileUploadStepProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const detectReferenceFromFileName = (fileName: string): string | null => {
    // Recherche une séquence de chiffres dans le nom du fichier
    const matches = fileName.match(/\d+/g);
    return matches ? matches[0] : null;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setSelectedFiles(files);

    // Créer des previews pour les images
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setFilePreviews(newPreviews);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
    setFilePreviews(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = useCallback(async () => {
    if (selectedFiles.length === 0) {
      toast.error('Veuillez sélectionner au moins un fichier');
      return;
    }

    setIsProcessing(true);
    try {
      // Détecter la référence à partir du premier fichier
      const detectedReference = detectReferenceFromFileName(selectedFiles[0].name);
      onComplete(selectedFiles, detectedReference);
    } catch (error) {
      toast.error('Une erreur est survenue lors du traitement des fichiers');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, onComplete]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Ajouter un nouveau devis</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <Input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="file"
              className="flex flex-col items-center justify-center cursor-pointer"
            >
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <span className="text-sm text-gray-600">
                Cliquez pour sélectionner ou déposez vos fichiers ici
              </span>
              <span className="text-xs text-gray-400 mt-2">
                PDF, PNG, JPG ou JPEG acceptés
              </span>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              {selectedFiles.map((file, idx) => (
                <div key={file.name + idx} className="flex items-center gap-2 p-2 border rounded">
                  {filePreviews[idx] ? (
                    <img src={filePreviews[idx]} alt="Preview" className="w-10 h-10 object-cover" />
                  ) : (
                    <FileIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm flex-1 truncate">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSelectedFile(idx)}
                    disabled={isProcessing}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Annuler
        </Button>
        <Button onClick={handleSubmit} disabled={selectedFiles.length === 0 || isProcessing}>
          {isProcessing ? 'Traitement...' : 'Continuer'}
        </Button>
      </CardFooter>
    </Card>
  );
} 