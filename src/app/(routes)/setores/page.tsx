import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { getSession } from "@/lib/session";

import AddSectorButton from "./_components/add-sector-button";
import SectorsGrid from "./_components/sectors-cards";

const AdminsSectors = async () => {
  const session = await getSession();
  if (!session?.user) {
    redirect("/");
  }

  const sectors = await db.query.sectorsTable.findMany({});

  return (
    <PageContainer className="flex flex-1 flex-col">
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Setores</PageTitle>
          <PageDescription>Gerencie seus setores.</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddSectorButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <SectorsGrid sectors={sectors} />
      </PageContent>
    </PageContainer>
  );
};

export default AdminsSectors;
