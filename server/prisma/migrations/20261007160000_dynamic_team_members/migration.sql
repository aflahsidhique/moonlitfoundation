-- Convert the fixed About-page team fields into an ordered collection.
WITH members AS (
  SELECT * FROM jsonb_to_recordset(
    '[
      {"id":"arjun-krishnan","default_name":"Arjun Krishnan","default_role":"Founder & President","name_key":"about.team.name-arjun-krishnan","role_key":"about.team.role-founder-president","image_key":"about.team.img-https-randomuser-me-api-portraits-men-22-","row_number":1,"position":1},
      {"id":"nithya-menon","default_name":"Nithya Menon","default_role":"Vice President","name_key":"about.team.name-nithya-menon","role_key":"about.team.role-vice-president","image_key":"about.team.img-https-randomuser-me-api-portraits-women-2","row_number":1,"position":2},
      {"id":"rahul-suresh","default_name":"Rahul Suresh","default_role":"Blood Donation Lead","name_key":"about.team.name-rahul-suresh","role_key":"about.team.role-blood-donation-lead","image_key":"about.team.img-https-randomuser-me-api-portraits-men-45-","row_number":1,"position":3},
      {"id":"fathima-ashraf","default_name":"Fathima Ashraf","default_role":"Welfare Coordinator","name_key":"about.team.name-fathima-ashraf","role_key":"about.team.role-welfare-coordinator","image_key":"about.team.img-https-randomuser-me-api-portraits-women-5","row_number":1,"position":4},
      {"id":"vishnu-prasad","default_name":"Vishnu Prasad","default_role":"Disaster Response Lead","name_key":"about.team.name-vishnu-prasad","role_key":"about.team.role-disaster-response-lead","image_key":"about.team.img-https-randomuser-me-api-portraits-men-61-","row_number":2,"position":1},
      {"id":"anjali-thomas","default_name":"Anjali Thomas","default_role":"Environment Lead","name_key":"about.team.name-anjali-thomas","role_key":"about.team.role-environment-lead","image_key":"about.team.img-https-randomuser-me-api-portraits-women-6","row_number":2,"position":2},
      {"id":"sreejith-nair","default_name":"Sreejith Nair","default_role":"Youth Programs Lead","name_key":"about.team.name-sreejith-nair","role_key":"about.team.role-youth-programs-lead","image_key":"about.team.img-https-randomuser-me-api-portraits-men-72-","row_number":2,"position":3},
      {"id":"devika-raj","default_name":"Devika Raj","default_role":"Volunteer Coordinator","name_key":"about.team.name-devika-raj","role_key":"about.team.role-volunteer-coordinator","image_key":"about.team.img-https-randomuser-me-api-portraits-women-1","row_number":2,"position":4}
    ]'::jsonb
  ) AS member(id text, default_name text, default_role text, name_key text, role_key text, image_key text, row_number integer, position integer)
), converted AS (
  SELECT content.id,
    jsonb_agg(jsonb_build_object(
      'id', member.id,
      'name', COALESCE(NULLIF(content.draft ->> member.name_key, ''), member.default_name),
      'role', COALESCE(NULLIF(content.draft ->> member.role_key, ''), member.default_role),
      'image', COALESCE(content.draft ->> member.image_key, ''),
      'row', member.row_number,
      'order', member.position
    ) ORDER BY member.row_number, member.position) AS draft_members,
    jsonb_agg(jsonb_build_object(
      'id', member.id,
      'name', COALESCE(NULLIF(content.published ->> member.name_key, ''), member.default_name),
      'role', COALESCE(NULLIF(content.published ->> member.role_key, ''), member.default_role),
      'image', COALESCE(content.published ->> member.image_key, ''),
      'row', member.row_number,
      'order', member.position
    ) ORDER BY member.row_number, member.position) AS published_members
  FROM "WebsiteContent" AS content
  CROSS JOIN members AS member
  WHERE content.id = 'about'
  GROUP BY content.id
), old_keys AS (
  SELECT ARRAY[
    'about.team.name-arjun-krishnan','about.team.role-founder-president','about.team.img-https-randomuser-me-api-portraits-men-22-',
    'about.team.name-nithya-menon','about.team.role-vice-president','about.team.img-https-randomuser-me-api-portraits-women-2',
    'about.team.name-rahul-suresh','about.team.role-blood-donation-lead','about.team.img-https-randomuser-me-api-portraits-men-45-',
    'about.team.name-fathima-ashraf','about.team.role-welfare-coordinator','about.team.img-https-randomuser-me-api-portraits-women-5',
    'about.team.name-vishnu-prasad','about.team.role-disaster-response-lead','about.team.img-https-randomuser-me-api-portraits-men-61-',
    'about.team.name-anjali-thomas','about.team.role-environment-lead','about.team.img-https-randomuser-me-api-portraits-women-6',
    'about.team.name-sreejith-nair','about.team.role-youth-programs-lead','about.team.img-https-randomuser-me-api-portraits-men-72-',
    'about.team.name-devika-raj','about.team.role-volunteer-coordinator','about.team.img-https-randomuser-me-api-portraits-women-1'
  ]::text[] AS keys
)
UPDATE "WebsiteContent" AS content
SET draft = (content.draft - old_keys.keys) || jsonb_build_object('about.team.members', converted.draft_members),
    published = (content.published - old_keys.keys) || jsonb_build_object('about.team.members', converted.published_members)
FROM converted, old_keys
WHERE content.id = converted.id;
