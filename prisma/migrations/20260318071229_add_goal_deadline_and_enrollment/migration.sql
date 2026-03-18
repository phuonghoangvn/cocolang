-- AlterTable
ALTER TABLE "User" ADD COLUMN     "goalDeadlineDays" INTEGER DEFAULT 30,
ALTER COLUMN "activeTrack" SET DEFAULT 'UX_ENGLISH';

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "Category" NOT NULL,
    "learningGoal" TEXT,
    "currentLevel" TEXT,
    "targetLevel" TEXT,
    "goalDeadlineDays" INTEGER NOT NULL DEFAULT 30,
    "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_userId_category_key" ON "CourseEnrollment"("userId", "category");

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
