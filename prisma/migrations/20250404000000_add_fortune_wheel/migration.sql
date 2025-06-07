-- CreateTable
CREATE TABLE "FortuneWheel" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "telegram_username" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "spin_outcome" TEXT,

    CONSTRAINT "FortuneWheel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FortuneWheel_email_key" ON "FortuneWheel"("email");
