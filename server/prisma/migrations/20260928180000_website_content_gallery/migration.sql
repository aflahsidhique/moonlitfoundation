CREATE TABLE "WebsiteContent" (
  "id" TEXT NOT NULL,
  "draft" JSONB NOT NULL,
  "published" JSONB NOT NULL,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "publishedRevision" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteContent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "WebsiteImage" (
  "id" TEXT NOT NULL,
  "publicId" TEXT,
  "imageUrl" TEXT NOT NULL,
  "contentHash" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "bytes" INTEGER,
  "format" TEXT NOT NULL DEFAULT 'webp',
  "title" TEXT NOT NULL,
  "alt" TEXT NOT NULL,
  "caption" TEXT NOT NULL DEFAULT '',
  "category" TEXT NOT NULL DEFAULT 'welfare',
  "status" TEXT NOT NULL DEFAULT 'draft',
  "inGallery" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "revision" INTEGER NOT NULL DEFAULT 1,
  "deletedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WebsiteImage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "WebsiteImage_publicId_key" ON "WebsiteImage"("publicId");
CREATE UNIQUE INDEX "WebsiteImage_contentHash_key" ON "WebsiteImage"("contentHash");
CREATE INDEX "WebsiteImage_inGallery_status_deletedAt_sortOrder_idx" ON "WebsiteImage"("inGallery", "status", "deletedAt", "sortOrder");

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-1','https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=1400&q=85','external','Donor day at the Medical College camp','Donor day at the Medical College camp','Donor day at the Medical College camp','blood','published',true,10,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-2','https://images.unsplash.com/photo-1593113598332-cd288d649433?w=1400&q=85','external','Packing monthly grocery kits','Packing monthly grocery kits','Packing monthly grocery kits','welfare','published',true,20,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-3','https://images.unsplash.com/photo-1547683905-f686c993aae5?w=1400&q=85','external','Boat team during the monsoon floods','Boat team during the monsoon floods','Boat team during the monsoon floods','relief','published',true,30,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-4','https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=1400&q=85','external','Kappad Beach cleanup crew','Kappad Beach cleanup crew','Kappad Beach cleanup crew','environment','published',true,40,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-5','https://images.unsplash.com/photo-1529390079861-591de354faf5?w=1400&q=85','external','Leadership workshop, Kozhikode','Leadership workshop, Kozhikode','Leadership workshop, Kozhikode','youth','published',true,50,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-6','https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1400&q=85','external','Hands in — annual volunteer meet','Hands in — annual volunteer meet','Hands in — annual volunteer meet','youth','published',true,60,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-7','https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1400&q=85','external','800 saplings in one morning','800 saplings in one morning','800 saplings in one morning','environment','published',true,70,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-8','https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1400&q=85','external','Relief kits reaching elders first','Relief kits reaching elders first','Relief kits reaching elders first','welfare','published',true,80,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-9','https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1400&q=85','external','The team that started it all','The team that started it all','The team that started it all','youth','published',true,90,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-10','https://images.unsplash.com/photo-1595429035839-c99c298ffdde?w=1400&q=85','external','A smile worth every kilometre','A smile worth every kilometre','A smile worth every kilometre','welfare','published',true,100,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-11','https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1400&q=85','external','First-time donor, lifelong habit','First-time donor, lifelong habit','First-time donor, lifelong habit','blood','published',true,110,CURRENT_TIMESTAMP);

INSERT INTO "WebsiteImage" ("id","imageUrl","format","title","alt","caption","category","status","inGallery","sortOrder","updatedAt") VALUES ('legacy-gallery-12','https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1400&q=85','external','Community hands rebuild faster','Community hands rebuild faster','Community hands rebuild faster','relief','published',true,120,CURRENT_TIMESTAMP);
