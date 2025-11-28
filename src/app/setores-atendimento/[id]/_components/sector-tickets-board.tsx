"use client";

import { useState } from "react";

import CallNextButton from "./call-next-button";
import TicketsList from "./tickets-list";

type SectorTicketsBoardProps = {
  sectorId: string;
};

export default function SectorTicketsBoard({
  sectorId,
}: SectorTicketsBoardProps) {
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = () => {
    setRefreshToken((prev) => prev + 1);
  };

  return (
    <section className="flex flex-1 flex-col gap-6">
      <CallNextButton sectorId={sectorId} onCalled={handleRefresh} />
      <TicketsList sectorId={sectorId} refreshToken={refreshToken} />
    </section>
  );
}
