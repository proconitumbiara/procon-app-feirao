import { redirect } from "next/navigation";

import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { getSession } from "@/lib/session";

import SettingsForm from "./_components/settings-form";

const ConfiguracoesPage = async () => {
  const session = await getSession();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <PageContainer className="flex flex-1 flex-col">
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Configurações</PageTitle>
          <PageDescription>
            Atualize suas informações pessoais para manter seus dados seguros.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <SettingsForm user={session.user} />
      </PageContent>
    </PageContainer>
  );
};

export default ConfiguracoesPage;

