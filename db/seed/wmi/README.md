# WMI Seed Content

Hand-authored past-paper JSON and glossary content that `npm run seed:wmi`
upserts into the WMI tables. No admin UI in v1; adding a paper means dropping a
JSON file here and re-running the script.

## Files

- `glossary.json`: array of glossary terms.
- `papers/<year>-grade-<n>-<round>.json`: one file per paper.
- `figures/`: PNG/JPG figures referenced from `figure_url` in question JSON.

## Markup

Use `[[slug]]` or `[[slug|display]]` inside question, choice, or hint strings.
Every slug must exist in `glossary.json` or the seed fails before DB writes.

## Analytics

Most-tapped glossary terms:

```sql
SELECT slug, COUNT(*) AS taps
FROM wmi_attempts CROSS JOIN LATERAL unnest(looked_up_terms) AS slug
GROUP BY slug ORDER BY taps DESC LIMIT 20;
```

Translation-reveal rate per question:

```sql
SELECT q.paper_id, q.number,
  SUM(CASE WHEN a.revealed_id_translation THEN 1 ELSE 0 END)::numeric / COUNT(*) AS reveal_rate
FROM wmi_attempts a JOIN wmi_questions q ON q.id = a.question_id
GROUP BY q.paper_id, q.number ORDER BY reveal_rate DESC;
```
