import { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { Quote } from '@/types/quote';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';
import { QuoteList } from '../quotes/QuoteList';
import QuoteModal from '../quotes/QuoteModal';
import { createQuote, updateQuote, getContact } from '@/lib/firestore';
import { TaskStatusBadge } from './TaskStatusBadge';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { Contact } from '@/types/contact';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export function TaskDetails({ task, onClose, onUpdate }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | undefined>();
  const [contact, setContact] = useState<Contact | null>(null);

  useEffect(() => {
    const loadContact = async () => {
      if (task.assignedTo) {
        try {
          const fetchedContact = await getContact(task.assignedTo);
          setContact(fetchedContact);
        } catch (error) {
          console.error('Error loading contact:', error);
        }
      }
    };

    loadContact();
  }, [task.assignedTo]);

  const handleSave = async () => {
    // ... existing handleSave code ...
  };

  const handleCreateQuote = () => {
    setSelectedQuote(undefined);
    setIsQuoteModalOpen(true);
  };

  const handleQuoteClick = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsQuoteModalOpen(true);
  };

  const handleQuoteSubmit = async (data: Partial<Quote>) => {
    try {
      if (selectedQuote?.id) {
        await updateQuote(selectedQuote.id, data);
      } else {
        await createQuote(data);
      }
      setIsQuoteModalOpen(false);
      setSelectedQuote(undefined);
    } catch (error) {
      console.error('Error saving quote:', error);
    }
  };

  if (!task.id) {
    return null;
  }

  return (
    <Dialog open onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
              {isEditing ? (
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="ml-2"
                />
              ) : (
                <span className="ml-2">{task.title}</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="ghost" onClick={() => setIsEditing(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>Enregistrer</Button>
                </>
              ) : (
                <Button variant="ghost" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* ... existing task details ... */}

          <div className="space-y-4">
            <QuoteList
              taskId={task.id}
              onCreateQuote={handleCreateQuote}
              onQuoteClick={handleQuoteClick}
            />
          </div>
        </div>

        {isQuoteModalOpen && contact && selectedQuote && (
          <QuoteModal
            quote={selectedQuote}
            contact={contact}
            task={task}
            isOpen={true}
            onClose={() => {
              setIsQuoteModalOpen(false);
              setSelectedQuote(undefined);
            }}
            onUpdate={() => {
              // Rafraîchir la liste des devis
              const quoteList = document.querySelector('.quote-list');
              if (quoteList) {
                quoteList.dispatchEvent(new Event('refresh'));
              }
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
} 