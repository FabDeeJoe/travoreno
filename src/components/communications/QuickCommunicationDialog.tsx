"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { addDoc, collection } from "firebase/firestore"
import { db } from "@/lib/firebase"

const communicationSchema = z.object({
  contactName: z.string().min(1, "Le nom est requis"),
  contactEmail: z.string().email("Email invalide").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  type: z.enum(["email", "phone", "meeting", "other"]),
  subject: z.string().min(1, "Le sujet est requis"),
  content: z.string().min(1, "Le contenu est requis"),
})

type FormData = z.infer<typeof communicationSchema>

export function QuickCommunicationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()
  const form = useForm<FormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: "meeting",
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      // Créer ou récupérer le contact
      const contactRef = await addDoc(collection(db, "contacts"), {
        name: data.contactName,
        email: data.contactEmail,
        phone: data.contactPhone,
        createdAt: new Date(),
      })

      // Créer la communication
      await addDoc(collection(db, "communications"), {
        contactId: contactRef.id,
        type: data.type,
        subject: data.subject,
        content: data.content,
        date: new Date(),
        createdAt: new Date(),
      })

      toast({
        title: "Communication créée",
        description: "La communication a été enregistrée avec succès.",
      })
      setIsOpen(false)
      form.reset()
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création de la communication.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle communication
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Nouvelle communication</DialogTitle>
            <DialogDescription>
              Créez rapidement une nouvelle communication avec un contact.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                {...form.register("contactName")}
                placeholder="Nom du contact"
              />
              {form.formState.errors.contactName && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.contactName.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                {...form.register("contactEmail")}
                placeholder="Email (optionnel)"
                type="email"
              />
              <Input
                {...form.register("contactPhone")}
                placeholder="Téléphone (optionnel)"
              />
            </div>
            <Select
              defaultValue={form.getValues("type")}
              onValueChange={(value) => form.setValue("type", value as FormData["type"])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Type de communication" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Téléphone</SelectItem>
                <SelectItem value="meeting">Rendez-vous</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
            <div className="grid gap-2">
              <Input
                {...form.register("subject")}
                placeholder="Sujet"
              />
              {form.formState.errors.subject && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.subject.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Textarea
                {...form.register("content")}
                placeholder="Contenu de la communication"
                className="h-32"
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.content.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Enregistrer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 