-- Convert the fixed About-page journey fields into ordered, image-ready milestones.
WITH milestones AS (
  SELECT * FROM jsonb_to_recordset(
    '[
      {"id":"2021-national-integration-camp-bihar","year":2021,"title_default":"National Integration Camp, Bihar","text_default":"Youth programs in India that bring students together from different states to promote unity, cultural sharing, and leadership.","year_key":"about.timeline.year-2021","title_key":"about.timeline.title-national-integration-camp-bihar","text_key":"about.timeline.text-youth-programs-in-india-that-bring-stude"},
      {"id":"2022-international-cultural-fest-nifaa-hariyana","year":2022,"title_default":"International Cultural Fest, NIFAA-Hariyana","text_default":"NIFAA organizes Haryana''s renowned international cultural festivals, uniting youth through vibrant traditions, arts, and cultural exchange.","year_key":"about.timeline.year-2022","title_key":"about.timeline.title-international-cultural-fest-nifaa-hariy","text_key":"about.timeline.text-nifaa-organizes-haryana-s-renowned-inter"},
      {"id":"2023-cultural-exchange-program-tripura","year":2023,"title_default":"Cultural Exchange Program, Tripura","text_default":"A cultural exchange program in Tripura promotes unity, friendship, and understanding by celebrating diverse traditions, customs, languages, arts, and heritage.","year_key":"about.timeline.year-2023","title_key":"about.timeline.title-cultural-exchange-program-tripura","text_key":"about.timeline.text-a-cultural-exchange-program-in-tripura-p"},
      {"id":"2024-adventure-camp-odissa","year":2024,"title_default":"Adventure Camp, Odissa","text_default":"Adventure Camp in Odisha offers exciting experiences through trekking, nature exploration, outdoor activities, teamwork, and learning while enjoying the beautiful environment.","year_key":"about.timeline.year-2024","title_key":"about.timeline.title-adventure-camp-odissa","text_key":"about.timeline.text-adventure-camp-in-odisha-offers-exciting"},
      {"id":"2025-workshop-on-flagship-scheme-keralam","year":2025,"title_default":"Workshop On Flagship Scheme, Keralam","text_default":"The workshop on flagship schemes in Kerala creates awareness about government initiatives, their benefits, implementation, and opportunities for public participation and development.","year_key":"about.timeline.year-2025","title_key":"about.timeline.title-workshop-on-flagship-scheme-keralam","text_key":"about.timeline.text-the-workshop-on-flagship-schemes-in-kera"},
      {"id":"2026-project-sulaimani-keralam","year":2026,"title_default":"Project Sulaimani, Keralam","text_default":"Project Sulaimani is a community-driven coastal cleanup initiative launched in April 2026 by the Moonlight Foundation to remove plastic and marine litter from Kozhikode Beach.","year_key":"about.timeline.year-2026","title_key":"about.timeline.title-project-sulaimani-keralam","text_key":"about.timeline.text-project-sulaimani-is-a-community-driven-"}
    ]'::jsonb
  ) AS milestone(id text, year integer, title_default text, text_default text, year_key text, title_key text, text_key text)
), converted AS (
  SELECT content.id,
    jsonb_agg(jsonb_build_object(
      'id', milestone.id,
      'year', COALESCE(CASE WHEN content.draft ->> milestone.year_key ~ '^[0-9]{4}$' THEN (content.draft ->> milestone.year_key)::integer END, milestone.year),
      'month', '', 'order', 1,
      'title', COALESCE(NULLIF(content.draft ->> milestone.title_key, ''), milestone.title_default),
      'text', COALESCE(NULLIF(content.draft ->> milestone.text_key, ''), milestone.text_default),
      'image', ''
    ) ORDER BY milestone.year) AS draft_items,
    jsonb_agg(jsonb_build_object(
      'id', milestone.id,
      'year', COALESCE(CASE WHEN content.published ->> milestone.year_key ~ '^[0-9]{4}$' THEN (content.published ->> milestone.year_key)::integer END, milestone.year),
      'month', '', 'order', 1,
      'title', COALESCE(NULLIF(content.published ->> milestone.title_key, ''), milestone.title_default),
      'text', COALESCE(NULLIF(content.published ->> milestone.text_key, ''), milestone.text_default),
      'image', ''
    ) ORDER BY milestone.year) AS published_items
  FROM "WebsiteContent" AS content
  CROSS JOIN milestones AS milestone
  WHERE content.id = 'about'
  GROUP BY content.id
), old_keys AS (
  SELECT ARRAY[
    'about.timeline.year-2021','about.timeline.title-national-integration-camp-bihar','about.timeline.text-youth-programs-in-india-that-bring-stude',
    'about.timeline.year-2022','about.timeline.title-international-cultural-fest-nifaa-hariy','about.timeline.text-nifaa-organizes-haryana-s-renowned-inter',
    'about.timeline.year-2023','about.timeline.title-cultural-exchange-program-tripura','about.timeline.text-a-cultural-exchange-program-in-tripura-p',
    'about.timeline.year-2024','about.timeline.title-adventure-camp-odissa','about.timeline.text-adventure-camp-in-odisha-offers-exciting',
    'about.timeline.year-2025','about.timeline.title-workshop-on-flagship-scheme-keralam','about.timeline.text-the-workshop-on-flagship-schemes-in-kera',
    'about.timeline.year-2026','about.timeline.title-project-sulaimani-keralam','about.timeline.text-project-sulaimani-is-a-community-driven-'
  ]::text[] AS keys
)
UPDATE "WebsiteContent" AS content
SET draft = (content.draft - old_keys.keys) || jsonb_build_object('about.timeline.items', converted.draft_items),
    published = (content.published - old_keys.keys) || jsonb_build_object('about.timeline.items', converted.published_items)
FROM converted, old_keys
WHERE content.id = converted.id;
