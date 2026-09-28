import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TreeClient, TreeGroupData } from "@/components/tree/tree-client";
import { calculateDataCompleteness } from "@/lib/data-completeness";
import { PersonCardData } from "@/components/tree/person-card";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Árvore de Dados — V.I.G.I.A",
  description: "Visualização hierárquica e dossiês de pessoas físicas em formato de árvore OSINT.",
};

export default async function TreePage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  const [groupsRaw, unassignedRaw] = await Promise.all([
    prisma.group.findMany({
      where: { userId },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        entities: {
          where: { userId },
          orderBy: { fullName: "asc" },
          include: {
            phones: {
              select: {
                isTelegram: true,
              },
            },
            socialProfiles: {
              select: {
                id: true,
                platform: true,
                username: true,
                url: true,
              },
            },
            _count: {
              select: {
                phones: true,
                emails: true,
                addresses: true,
                socialProfiles: true,
                documents: true,
              },
            },
          },
        },
      },
    }),
    prisma.entity.findMany({
      where: { userId, groupId: null },
      orderBy: { fullName: "asc" },
      include: {
        phones: {
          select: {
            isTelegram: true,
          },
        },
        socialProfiles: {
          select: {
            id: true,
            platform: true,
            username: true,
            url: true,
          },
        },
        _count: {
          select: {
            phones: true,
            emails: true,
            addresses: true,
            socialProfiles: true,
            documents: true,
          },
        },
      },
    }),
  ]);

  const mapEntityToCardData = (e: (typeof unassignedRaw)[0]): PersonCardData => {
    const completeness = calculateDataCompleteness({
      photo: e.photo,
      cpf: e.cpf,
      rg: e.rg,
      birthDate: e.birthDate,
      gender: e.gender,
      currentJob: e.currentJob,
      notes: e.notes,
      _count: e._count,
    });

    const hasTelegram = e.phones?.some((p) => p.isTelegram) || false;

    return {
      id: e.id,
      fullName: e.fullName,
      photo: e.photo,
      gender: e.gender,
      birthDate: e.birthDate ? e.birthDate.toISOString() : null,
      zodiacSign: e.zodiacSign,
      currentJob: e.currentJob,
      dataCompleteness: completeness,
      socialProfiles: e.socialProfiles,
      isBurner: (e as any).isBurner || false,
      expiresAt: (e as any).expiresAt ? (e as any).expiresAt.toISOString() : null,
      hasTelegram,
    };
  };

  const formattedGroups: TreeGroupData[] = groupsRaw.map((group) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    color: group.color,
    icon: group.icon,
    entities: group.entities.map(mapEntityToCardData),
  }));

  const formattedUnassigned: PersonCardData[] = unassignedRaw.map(mapEntityToCardData);

  return (
    <TreeClient
      groups={formattedGroups}
      unassignedEntities={formattedUnassigned}
    />
  );
}
