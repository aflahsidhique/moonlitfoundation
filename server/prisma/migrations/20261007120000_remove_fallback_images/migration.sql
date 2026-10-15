
UPDATE "WebsiteContent"
SET "draft" = COALESCE((
  SELECT jsonb_object_agg(entry.key,
    CASE
      WHEN jsonb_typeof(entry.value) = 'string'
        AND (entry.value #>> '{}') ~ '^(\/images\/|https:\/\/(www\.)?(images\.unsplash\.com|randomuser\.me)\/)'
      THEN to_jsonb(''::text)
      ELSE entry.value
    END
  )
  FROM jsonb_each("WebsiteContent"."draft") AS entry
), '{}'::jsonb),
"published" = COALESCE((
  SELECT jsonb_object_agg(entry.key,
    CASE
      WHEN jsonb_typeof(entry.value) = 'string'
        AND (entry.value #>> '{}') ~ '^(\/images\/|https:\/\/(www\.)?(images\.unsplash\.com|randomuser\.me)\/)'
      THEN to_jsonb(''::text)
      ELSE entry.value
    END
  )
  FROM jsonb_each("WebsiteContent"."published") AS entry
), '{}'::jsonb);



DELETE FROM "WebsiteImage" WHERE "publicId" IS NULL;


UPDATE "Event"
SET "imageUrl" = NULL
WHERE "imageUrl" IS NOT NULL
  AND "imageUrl" NOT LIKE 'https://res.cloudinary.com/%/image/upload/%/moonlit/events/%';
