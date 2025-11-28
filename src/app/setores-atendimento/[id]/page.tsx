import { eq } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";
import { sectorsTable } from "@/db/schema";

import SectorTicketsBoard from "./_components/sector-tickets-board";

interface SectorAttendancePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SectorAttendancePage({
  params,
}: SectorAttendancePageProps) {
  const { id } = await params;
  const sector = await db.query.sectorsTable.findFirst({
    where: eq(sectorsTable.id, id),
  });

  if (!sector) {
    notFound();
  }

  return (
    <PageContainer className="bg-background relative flex h-full flex-col gap-6 p-4">
      <div className="absolute top-0 right-2 z-50 flex flex-col gap-6">
        <Image src="/LogoFeirao.png" alt="Logo" width={120} height={120} />
      </div>
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">{sector.name}</h1>
        <p className="text-muted-foreground text-xs">
          Seja bem-vindo ao atendimento do setor de <br /> {sector.name}!
        </p>
      </header>

      <SectorTicketsBoard sectorId={sector.id} />
    </PageContainer>
  );
}
