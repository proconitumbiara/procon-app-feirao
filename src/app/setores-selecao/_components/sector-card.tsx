import { Hand, HeartPulse, Palette, Scissors, Smile, Tag } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type SectorCardProps = {
  name: string;
};

function getIconBySectorName(name: string) {
  if (name === "Barbearia") {
    return <Scissors className="h-6 w-6" strokeWidth={1.5} />;
  }
  if (name === "Enfermagem") {
    return <HeartPulse className="h-6 w-6" strokeWidth={1.5} />;
  }
  if (name === "Massagem") {
    return <Hand className="h-6 w-6" strokeWidth={1.5} />;
  }
  if (name === "Manicure") {
    return <Palette className="h-6 w-6" strokeWidth={1.5} />;
  }
  if (name === "Limpeza de pele") {
    return <Smile className="h-6 w-6" strokeWidth={1.5} />;
  }
  return <Tag className="h-6 w-6" strokeWidth={1.5} />;
}

export default function SectorCard({ name }: SectorCardProps) {
  const icon = getIconBySectorName(name);

  return (
    <Card className="border-border border shadow-lg">
      <CardContent>
        <div className="text-primary flex items-center justify-center gap-2">
          {icon}
          <h1 className="text-md font-semibold">{name}</h1>
        </div>
      </CardContent>
    </Card>
  );
}
