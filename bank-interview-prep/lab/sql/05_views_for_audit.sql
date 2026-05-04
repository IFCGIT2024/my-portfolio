-- =====================================================================
-- DataGuard Academy Lab — 05_views_for_audit.sql
-- Helper views used by the Python audit report and exercise solutions.
-- =====================================================================
SET search_path TO bank, public;

-- All columns the bank holds, with classification status joined
CREATE OR REPLACE VIEW v_classification_coverage AS
SELECT
  c.table_schema,
  c.table_name,
  c.column_name,
  c.data_type,
  dc.classification_label,
  dc.confidence_score,
  dc.classified_by,
  dc.last_reviewed_at,
  CASE
    WHEN dc.catalog_id IS NULL                               THEN 'UNCLASSIFIED'
    WHEN dc.confidence_score < 0.80 AND dc.classified_by='auto' THEN 'NEEDS_REVIEW'
    WHEN dc.last_reviewed_at < now() - interval '180 days'   THEN 'STALE'
    ELSE 'OK'
  END AS coverage_status
FROM information_schema.columns c
JOIN information_schema.tables t
  ON t.table_schema = c.table_schema
 AND t.table_name  = c.table_name
 AND t.table_type  = 'BASE TABLE'   -- exclude views; we audit underlying tables only
LEFT JOIN data_catalog dc
  ON dc.schema_name = c.table_schema
 AND dc.table_name  = c.table_name
 AND dc.column_name = c.column_name
WHERE c.table_schema = 'bank';

-- Aggregate coverage by table
CREATE OR REPLACE VIEW v_coverage_by_table AS
SELECT
  table_schema,
  table_name,
  COUNT(*)                                                              AS total_columns,
  COUNT(*) FILTER (WHERE coverage_status='OK')                          AS ok_columns,
  COUNT(*) FILTER (WHERE coverage_status='UNCLASSIFIED')                AS unclassified,
  COUNT(*) FILTER (WHERE coverage_status='NEEDS_REVIEW')                AS needs_review,
  COUNT(*) FILTER (WHERE coverage_status='STALE')                       AS stale,
  ROUND(100.0 * COUNT(*) FILTER (WHERE coverage_status='OK') / COUNT(*), 1) AS coverage_pct
FROM v_classification_coverage
GROUP BY table_schema, table_name
ORDER BY coverage_pct ASC;

-- Top accessors of Restricted data in the last 30 days
CREATE OR REPLACE VIEW v_restricted_access_30d AS
SELECT
  e.employee_id,
  e.full_name,
  e.department,
  al.table_accessed,
  COUNT(*)                  AS access_count,
  SUM(al.rows_returned)     AS total_rows,
  MIN(al.accessed_at)       AS first_access,
  MAX(al.accessed_at)       AS last_access
FROM access_logs al
JOIN employees   e  ON e.employee_id = al.employee_id
WHERE al.accessed_at >= now() - interval '30 days'
  AND al.table_accessed IN (
    SELECT DISTINCT schema_name||'.'||table_name
    FROM data_catalog WHERE classification_label IN ('Restricted','Highly Restricted')
  )
GROUP BY e.employee_id, e.full_name, e.department, al.table_accessed
ORDER BY access_count DESC;
