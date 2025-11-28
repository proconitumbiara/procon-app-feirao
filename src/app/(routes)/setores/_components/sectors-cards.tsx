"use client";
import { Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteSector } from "@/actions/delete-sector";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { sectorsTable } from "@/db/schema";

import UpsertSectorForm from "./upsert-sector-form";

interface SectorsGridProps {
  sectors: (typeof sectorsTable.$inferSelect & {})[];
}

const SectorsGrid = ({ sectors }: SectorsGridProps) => {
  const [openSectorForm, setOpenSectorForm] = useState<string | null>(null);

  // Hook deve ser chamado no topo do componente!
  const deleteSectorAction = useAction(deleteSector, {
    onSuccess: () => {
      toast.success("Setor deletado com sucesso!");
    },
    onError: () => {
      toast.error(`Erro ao deletar setor.`);
    },
  });

  const handleDeleteSector = (sectorId: string) => {
    if (!sectorId) {
      toast.error("Setor não encontrado.");
      return;
    }
    deleteSectorAction.execute({ id: sectorId });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {sectors.map((sector) => (
        <Card key={sector.id}>
          <CardHeader>
            <CardTitle>{sector.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-2">
            <Dialog
              open={openSectorForm === sector.id}
              onOpenChange={(open) =>
                setOpenSectorForm(open ? sector.id : null)
              }
            >
              <DialogTrigger asChild>
                <Button variant="default" className="w-1/2">
                  <Pencil className="h-4 w-4 cursor-pointer" />
                  Editar
                </Button>
              </DialogTrigger>
              <UpsertSectorForm
                sector={{ ...sector }}
                onSuccess={() => setOpenSectorForm(null)}
              />
            </Dialog>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-1/2">
                  <Trash2 className="h-4 w-4 cursor-pointer" />
                  Excluir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Tem certeza que deseja deletar esse setor?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Essa ação não pode ser desfeita. Todos os dados relacionados
                    a esse setor serão perdidos permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDeleteSector(sector.id)}
                  >
                    Deletar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SectorsGrid;
