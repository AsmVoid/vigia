import * as React from "react";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateDataCompleteness } from "@/lib/data-completeness";
import { DossierClient } from "@/components/entity/dossier-client";
import { CommonPersonItem } from "@/components/entity/person-profile";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) return { title: "Dossiê — V.I.G.I.A" };

  const entity = await prisma.entity.findFirst({
    where: { id, userId: session.user.id },
    select: { fullName: true, currentJob: true },
  });

  return {
    title: entity
      ? `${entity.fullName} — Dossiê V.I.G.I.A`
      : "Dossiê Investigativo — V.I.G.I.A",
    description: entity?.currentJob
      ? `Dossiê consolidado de inteligência OSINT para ${entity.fullName} (${entity.currentJob}).`
      : "Dossiê consolidado de inteligência e inteligência OSINT.",
  };
}

export default async function EntityDossierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Single comprehensive query including all relations scoped to user
  const entity = await prisma.entity.findFirst({
    where: { id, userId },
    include: {
      group: true,
      phones: { orderBy: { createdAt: "asc" } },
      emails: { orderBy: { createdAt: "asc" } },
      addresses: { orderBy: { createdAt: "asc" } },
      socialProfiles: { orderBy: { platform: "asc" } },
      documents: { orderBy: { type: "asc" } },
      vehicles: { orderBy: { createdAt: "asc" } },
      jobs: { orderBy: { isCurrent: "desc" } },
      educations: { orderBy: { isCurrent: "desc" } },
      // SECURITY: Exclude identifier from initial HTML payload
      financialAccounts: {
        select: {
          id: true,
          type: true,
          institution: true,
          metadata: true,
          createdAt: true,
        },
      },
      // SECURITY: Exclude passwordHash from initial HTML payload
      credentials: {
        select: {
          id: true,
          platform: true,
          username: true,
          notes: true,
          createdAt: true,
        },
      },
      media: { orderBy: { sortOrder: "asc" } },
      noteWidgets: { orderBy: { createdAt: "desc" } },
      father: {
        select: { id: true, fullName: true, photo: true, gender: true },
      },
      mother: {
        select: { id: true, fullName: true, photo: true, gender: true },
      },
      childrenAsFather: {
        select: { id: true, fullName: true, photo: true, gender: true },
      },
      childrenAsMother: {
        select: { id: true, fullName: true, photo: true, gender: true },
      },
      siblings: {
        select: { id: true, fullName: true, photo: true, gender: true },
      },
      siblingOf: {
        select: { id: true, fullName: true, photo: true, gender: true },
      },
      siblingNames: true,
      relationships: {
        include: {
          relatedEntity: {
            select: { id: true, fullName: true, photo: true, gender: true },
          },
        },
      },
      relatedIn: {
        include: {
          entity: {
            select: { id: true, fullName: true, photo: true, gender: true },
          },
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
  });

  if (!entity) {
    notFound();
  }

  const completeness = calculateDataCompleteness(entity);

  // Assemble "Pessoas em Comum" list (parents, siblings, free names, friends, partners)
  const commonPeople: CommonPersonItem[] = [];
  const seenIds = new Set<string>();

  // 1. Pai
  if (entity.father) {
    commonPeople.push({
      id: entity.father.id,
      name: entity.father.fullName,
      photo: entity.father.photo,
      role: "Pai",
      isRegistered: true,
    });
    seenIds.add(entity.father.id);
  } else if (entity.fatherName) {
    commonPeople.push({
      name: entity.fatherName,
      role: "Pai",
      isRegistered: false,
    });
  }

  // 2. Mãe
  if (entity.mother) {
    commonPeople.push({
      id: entity.mother.id,
      name: entity.mother.fullName,
      photo: entity.mother.photo,
      role: "Mãe",
      isRegistered: true,
    });
    seenIds.add(entity.mother.id);
  } else if (entity.motherName) {
    commonPeople.push({
      name: entity.motherName,
      role: "Mãe",
      isRegistered: false,
    });
  }

  // 3. Irmãos cadastrados
  if (entity.siblings) {
    for (const sib of entity.siblings) {
      if (!seenIds.has(sib.id)) {
        commonPeople.push({
          id: sib.id,
          name: sib.fullName,
          photo: sib.photo,
          role: "Irmão(ã)",
          isRegistered: true,
        });
        seenIds.add(sib.id);
      }
    }
  }

  // 4. Irmãos nomes livres
  if (entity.siblingNames) {
    for (const sn of entity.siblingNames) {
      commonPeople.push({
        name: sn.name,
        role: "Irmão(ã)",
        isRegistered: false,
      });
    }
  }

  // 5. Relacionamentos diretos e inversos (Amigos, Sócios, etc.)
  if (entity.relationships) {
    for (const rel of entity.relationships) {
      if (rel.relatedEntity && !seenIds.has(rel.relatedEntity.id)) {
        const roleName = rel.label || formatRelationshipType(rel.type);
        commonPeople.push({
          id: rel.relatedEntity.id,
          name: rel.relatedEntity.fullName,
          photo: rel.relatedEntity.photo,
          role: roleName,
          isRegistered: true,
        });
        seenIds.add(rel.relatedEntity.id);
      }
    }
  }

  if (entity.relatedIn) {
    for (const rel of entity.relatedIn) {
      if (rel.entity && !seenIds.has(rel.entity.id)) {
        const roleName = rel.label || formatRelationshipType(rel.type);
        commonPeople.push({
          id: rel.entity.id,
          name: rel.entity.fullName,
          photo: rel.entity.photo,
          role: roleName,
          isRegistered: true,
        });
        seenIds.add(rel.entity.id);
      }
    }
  }

  // Serialized media and notes for client components
  const serializedMedia = entity.media.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  const serializedNotes = entity.noteWidgets.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }));

  // Serialized entity for client components (ensures Prisma Decimal, BigInt, Date are plain JSON)
  const serializedEntity = JSON.parse(
    JSON.stringify(entity, (key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      return value;
    })
  );

  return (
    <DossierClient
      entity={serializedEntity}
      completeness={completeness}
      commonPeople={commonPeople}
      media={serializedMedia}
      notes={serializedNotes}
    />
  );
}

function formatRelationshipType(type: string): string {
  switch (type) {
    case "FRIEND":
      return "Amigo(a)";
    case "BUSINESS_PARTNER":
      return "Sócio(a)";
    case "COLLEAGUE":
      return "Colega";
    case "SPOUSE":
      return "Cônjuge";
    case "CHILD":
      return "Filho(a)";
    case "FATHER":
      return "Pai";
    case "MOTHER":
      return "Mãe";
    case "SIBLING":
      return "Irmão(ã)";
    case "GRANDPARENT":
      return "Avô/Avó";
    default:
      return "Vínculo";
  }
}
