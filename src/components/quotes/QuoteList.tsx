import { useEffect, useState } from 'react';
import { Quote } from '@/types/quote';
import { getQuotesByTask } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { Plus } from 'lucide-react';

interface QuoteListProps {
  taskId: string;
  onCreateQuote: () => void;
  onQuoteClick: (quote: Quote) => void;
}

export function QuoteList({ taskId, onCreateQuote, onQuoteClick }: QuoteListProps) {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuotes = async () => {
      try {
        const fetchedQuotes = await getQuotesByTask(taskId);
        setQuotes(fetchedQuotes);
      } catch (error) {
        console.error('Error loading quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadQuotes();
  }, [taskId]);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'text-gray-500';
      case 'sent':
        return 'text-blue-500';
      case 'accepted':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusLabel = (status: Quote['status']) => {
    switch (status) {
      case 'draft':
        return 'Brouillon';
      case 'sent':
        return 'Envoyé';
      case 'accepted':
        return 'Accepté';
      case 'rejected':
        return 'Refusé';
      default:
        return status;
    }
  };

  if (loading) {
    return <div>Chargement des devis...</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Devis</CardTitle>
        <Button onClick={onCreateQuote} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouveau devis
        </Button>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center text-gray-500 py-4">
            Aucun devis pour cette tâche
          </div>
        ) : (
          <div className="space-y-4">
            {quotes.map((quote) => (
              <div
                key={quote.id}
                className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => onQuoteClick(quote)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">{quote.reference}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(quote.quoteDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className={`text-sm font-medium ${getStatusColor(quote.status)}`}>
                    {getStatusLabel(quote.status)}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {quote.validUntil ? `Valide jusqu'au ${new Date(quote.validUntil).toLocaleDateString()}` : 'Sans date de validité'}
                  </div>
                  <div className="font-medium">
                    {quote.fileUrl && (
                      <a
                        href={quote.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Voir le devis
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 