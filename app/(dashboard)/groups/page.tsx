import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GroupsClient } from "@/components/groups/groups-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Grupos & Organizações — V.I.G.I.A",
  description: "Gerenciamento e agrupamento de entidades investigadas na plataforma OSINT.",
};

export default async function GroupsPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const groups = await prisma.group.findMany({
    where: { userId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          entities: true,
        },
      },
    },
  });

  return <GroupsClient groups={groups} />;
}
