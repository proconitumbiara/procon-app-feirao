"use server";

import Image from "next/image";
import Link from "next/link";

import { PageContainer } from "@/components/ui/page-container";
import { db } from "@/db";

import SectorCard from "./_components/sector-card";

export default async function SectorsSelectionPage() {
  const sectors = await db.query.sectorsTable.findMany({
    orderBy: (sectors, { asc }) => asc(sectors.createdAT),
  });

  return (
    <PageContainer className="bg-background flex h-full flex-col p-4">
      <header className="mb-6 flex flex-row items-center justify-between gap-2">
        <p className="text-md">
          Olá, seja bem-vindo ao atendimento da Feirão de Renegociação 2025 do
          Procon Itumbiara!
        </p>
        <Image src="/LogoFeirao.png" alt="Logo" width={120} height={120} />
      </header>

      <section className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
        <h1 className="mt-4 text-2xl font-semibold">Selecione seu serviço:</h1>
        {sectors.map((sector) => (
          <Link
            key={sector.id}
            href={`/setores-atendimento/${sector.id}`}
            className="h-full"
          >
            <SectorCard name={sector.name} />
          </Link>
        ))}
      </section>
    </PageContainer>
  );
}
