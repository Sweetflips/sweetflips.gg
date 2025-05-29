-- CreateTable
CREATE TABLE "StreamSchedule" (
    "id" SERIAL NOT NULL,
    "day" TEXT,
    "name" TEXT,
    "titel" TEXT,
    "time" TEXT,

    CONSTRAINT "StreamSchedule_pkey" PRIMARY KEY ("id")
);
