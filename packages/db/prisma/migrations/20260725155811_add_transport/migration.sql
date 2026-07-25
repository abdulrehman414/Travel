-- CreateEnum
CREATE TYPE "TransportType" AS ENUM ('AIRPORT_TRANSFER', 'INTERCITY', 'ZIYARAT', 'HOURLY', 'CITY_TOUR');

-- CreateEnum
CREATE TYPE "VehicleClass" AS ENUM ('SEDAN', 'SUV', 'VAN', 'BUS', 'LUXURY');

-- CreateTable
CREATE TABLE "TransportService" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "TransportType" NOT NULL,
    "vehicleClass" "VehicleClass" NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "descriptionEn" TEXT NOT NULL,
    "descriptionAr" TEXT NOT NULL,
    "fromCity" TEXT,
    "toCity" TEXT,
    "city" TEXT,
    "durationHours" INTEGER,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'SAR',
    "pricingUnit" TEXT NOT NULL DEFAULT 'per_trip',
    "imageUrl" TEXT,
    "featuresEn" TEXT[],
    "featuresAr" TEXT[],
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransportService_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TransportService_slug_key" ON "TransportService"("slug");

-- CreateIndex
CREATE INDEX "TransportService_type_active_idx" ON "TransportService"("type", "active");

-- CreateIndex
CREATE INDEX "TransportService_featured_idx" ON "TransportService"("featured");
