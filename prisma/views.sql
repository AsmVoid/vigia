-- V.I.G.I.A — Views de Estatísticas (PostgreSQL + Prisma camelCase)

CREATE OR REPLACE VIEW v_age_distribution AS
SELECT
  CASE
    WHEN EXTRACT(YEAR FROM AGE(NOW(), "birthDate")) BETWEEN 0 AND 19 THEN 'young'
    WHEN EXTRACT(YEAR FROM AGE(NOW(), "birthDate")) BETWEEN 20 AND 59 THEN 'adult'
    WHEN EXTRACT(YEAR FROM AGE(NOW(), "birthDate")) >= 60 THEN 'elderly'
    ELSE 'unknown'
  END AS age_group,
  COUNT(*) AS count
FROM "Entity"
WHERE "birthDate" IS NOT NULL
GROUP BY age_group;

CREATE OR REPLACE VIEW v_gender_distribution AS
SELECT
  gender,
  COUNT(*) AS count,
  ROUND(COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM "Entity" WHERE gender IS NOT NULL), 0), 1) AS percentage
FROM "Entity"
WHERE gender IS NOT NULL
GROUP BY gender;

CREATE OR REPLACE VIEW v_geographic_distribution AS
SELECT a.state, a.city, a.neighborhood, COUNT(DISTINCT a."entityId") AS count
FROM "Address" a
GROUP BY a.state, a.city, a.neighborhood;

CREATE OR REPLACE VIEW v_people_timeline AS
SELECT DATE("createdAt") AS date, COUNT(*) AS count
FROM "Entity"
GROUP BY DATE("createdAt")
ORDER BY date DESC
LIMIT 30;

CREATE OR REPLACE VIEW v_activity_flow AS
SELECT
  DATE("createdAt") AS date,
  SUM(CASE WHEN action IN ('ADD', 'UPDATE') THEN 1 ELSE 0 END) AS positive,
  SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) AS negative
FROM "ActivityLog"
WHERE "createdAt" >= NOW() - INTERVAL '30 days'
GROUP BY DATE("createdAt")
ORDER BY date ASC;
