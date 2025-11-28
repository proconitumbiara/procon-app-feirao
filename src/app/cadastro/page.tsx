import Image from "next/image";
import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import RegisterForm from "./_components/register-form";

const RegisterPage = async () => {
  const session = await getSession();

  if (session?.user) {
    redirect("/atendimento");
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <div className="flex h-full w-full flex-col items-center justify-center gap-4">
        <Image
          src="/LogoFeirao.png"
          alt="Procon Logo"
          width={200}
          height={0}
          priority
        />
        <div className="h-auto w-full max-w-md rounded-md">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
