import * as React from "react";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { DashboardGrid } from "@/components/dashboard/dashboard-grid";
import { AgeDistributionItem } from "@/components/dashboard/widgets/age-distribution-widget";
import { GenderDistributionItem } from "@/components/dashboard/widgets/gender-distribution-widget";
import { ActivityFlowItem } from "@/components/dashboard/widgets/activity-flow-widget";
import { GeographicDistributionItem } from "@/components/dashboard/widgets/geographic-distribution-widget";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function sanitizeBigInt<T>(data: T): T {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? Number(value) : value
    )
  );
}

export default async function DashboardPage() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session?.user) {
    redirect("/login");
  }
  const userId = session.user.id;

  // Read request headers to extract client IP
  let clientIp = "127.0.0.1";
  try {
    const forwarded = reqHeaders.get("x-forwarded-for");
    const realIp = reqHeaders.get("x-real-ip");
    if (forwarded) {
      clientIp = forwarded.split(",")[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }
  } catch {
    // ignore
  }

  // Execute database queries in parallel scoped to authenticated user
  let totalPeople = 0;
  let totalGroups = 0;
  let ageData: AgeDistributionItem[] = [];
  let genderData: GenderDistributionItem[] = [];
  let geoData: GeographicDistributionItem[] = [];
  let activityData: ActivityFlowItem[] = [];

  try {
    const [
      peopleCount,
      groupsCount,
      rawAge,
      rawGender,
      rawGeo,
      rawActivity,
      rawTimeline,
    ] = await Promise.all([
      prisma.entity.count({ where: { userId } }).catch(() => 0),
      prisma.group.count({ where: { userId } }).catch(() => 0),
      prisma.$queryRaw<Array<{ age_group: string; count: bigint }>>`
        SELECT
          CASE
            WHEN EXTRACT(YEAR FROM AGE(NOW(), "birthDate")) BETWEEN 0 AND 19 THEN 'young'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), "birthDate")) BETWEEN 20 AND 59 THEN 'adult'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), "birthDate")) >= 60 THEN 'elderly'
            ELSE 'unknown'
          END AS age_group,
          COUNT(*) AS count
        FROM "Entity"
        WHERE "birthDate" IS NOT NULL AND "userId" = ${userId}
        GROUP BY age_group;
      `.catch(() => []),
      prisma.$queryRaw<Array<{ gender: string; count: bigint; percentage: number | null }>>`
        SELECT
          gender,
          COUNT(*) AS count,
          ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM "Entity" WHERE gender IS NOT NULL AND "userId" = ${userId}), 0), 1) AS percentage
        FROM "Entity"
        WHERE gender IS NOT NULL AND "userId" = ${userId}
        GROUP BY gender;
      `.catch(() => []),
      prisma.$queryRaw<Array<{ state: string | null; city: string | null; neighborhood: string | null; count: bigint }>>`
        SELECT a.state, a.city, a.neighborhood, COUNT(DISTINCT a."entityId") AS count
        FROM "Address" a
        JOIN "Entity" e ON e.id = a."entityId"
        WHERE e."userId" = ${userId}
        GROUP BY a.state, a.city, a.neighborhood;
      `.catch(() => []),
      prisma.$queryRaw<Array<{ date: Date | string; positive: bigint; negative: bigint }>>`
        SELECT
          DATE("createdAt") AS date,
          SUM(CASE WHEN action IN ('ADD', 'UPDATE') THEN 1 ELSE 0 END) AS positive,
          SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) AS negative
        FROM "ActivityLog"
        WHERE "createdAt" >= NOW() - INTERVAL '30 days' AND "userId" = ${userId}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC;
      `.catch(() => []),
      prisma.$queryRaw<Array<{ date: Date | string; count: bigint }>>`
        SELECT DATE("createdAt") AS date, COUNT(*) AS count
        FROM "Entity"
        WHERE "userId" = ${userId}
        GROUP BY DATE("createdAt")
        ORDER BY date DESC
        LIMIT 30;
      `.catch(() => []),
    ]);

    totalPeople = peopleCount;
    totalGroups = groupsCount;

    ageData = sanitizeBigInt(rawAge).map((item) => ({
      age_group: item.age_group,
      count: Number(item.count || 0),
    }));

    genderData = sanitizeBigInt(rawGender).map((item) => ({
      gender: item.gender,
      count: Number(item.count || 0),
      percentage: item.percentage ? Number(item.percentage) : 0,
    }));

    geoData = sanitizeBigInt(rawGeo).map((item) => ({
      state: item.state,
      city: item.city,
      neighborhood: item.neighborhood,
      count: Number(item.count || 0),
    }));

    if (rawActivity && rawActivity.length > 0) {
      activityData = sanitizeBigInt(rawActivity).map((item) => ({
        date: String(item.date),
        positive: Number(item.positive || 0),
        negative: Number(item.negative || 0),
      }));
    } else if (rawTimeline && rawTimeline.length > 0) {
      activityData = sanitizeBigInt(rawTimeline).map((item) => ({
        date: String(item.date),
        positive: Number(item.count || 0),
        negative: 0,
      }));
    }
  } catch (error) {
    console.error("Erro ao carregar métricas do dashboard:", error);
  }

  return (
    <DashboardGrid
      initialIp={clientIp}
      totalPeople={totalPeople}
      totalGroups={totalGroups}
      ageDistribution={ageData}
      genderDistribution={genderData}
      activityFlow={activityData}
      geographicDistribution={geoData}
    />
  );
}
