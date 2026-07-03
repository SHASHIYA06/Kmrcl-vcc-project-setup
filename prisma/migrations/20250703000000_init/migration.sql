-- CreateEnum
CREATE TYPE "ValidationStatus" AS ENUM ('VERIFIED', 'UNVERIFIED', 'SYNTHETIC', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ENGINEER', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Train" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Train_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "carType" TEXT NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subsystem" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Subsystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "subsystemId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "drawingId" TEXT,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Connector" (
    "id" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "designator" TEXT NOT NULL,

    CONSTRAINT "Connector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pin" (
    "id" TEXT NOT NULL,
    "connectorId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "function" TEXT,

    CONSTRAINT "Pin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wire" (
    "id" TEXT NOT NULL,
    "wireNumber" TEXT NOT NULL,
    "sourcePinId" TEXT NOT NULL,
    "destPinId" TEXT NOT NULL,
    "cable" TEXT,
    "trainline" TEXT,
    "drawingId" TEXT,
    "validationStatus" "ValidationStatus" NOT NULL DEFAULT 'UNVERIFIED',

    CONSTRAINT "Wire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Drawing" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "revision" TEXT,
    "parentId" TEXT,
    "title" TEXT,
    "pdfPath" TEXT,
    "pdfPage" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Drawing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Diagnostic" (
    "id" TEXT NOT NULL,
    "faultCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "probableCause" TEXT,
    "testProcedure" TEXT,
    "repairProcedure" TEXT,

    CONSTRAINT "Diagnostic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VCCKnowledge" (
    "id" TEXT NOT NULL,
    "systemId" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "powerFlow" TEXT,
    "signalFlow" TEXT,
    "testingNotes" TEXT,

    CONSTRAINT "VCCKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Train_code_key" ON "Train"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Car_trainId_position_key" ON "Car"("trainId", "position");

-- CreateIndex
CREATE INDEX "System_code_idx" ON "System"("code");

-- CreateIndex
CREATE INDEX "Connector_designator_idx" ON "Connector"("designator");

-- CreateIndex
CREATE UNIQUE INDEX "Pin_connectorId_number_key" ON "Pin"("connectorId", "number");

-- CreateIndex
CREATE INDEX "Wire_wireNumber_idx" ON "Wire"("wireNumber");

-- CreateIndex
CREATE INDEX "Wire_validationStatus_idx" ON "Wire"("validationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Wire_wireNumber_sourcePinId_destPinId_key" ON "Wire"("wireNumber", "sourcePinId", "destPinId");

-- CreateIndex
CREATE INDEX "Drawing_number_idx" ON "Drawing"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Drawing_number_revision_key" ON "Drawing"("number", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "Diagnostic_faultCode_key" ON "Diagnostic"("faultCode");

-- CreateIndex
CREATE UNIQUE INDEX "VCCKnowledge_systemId_key" ON "VCCKnowledge"("systemId");

-- AddForeignKey
ALTER TABLE "Car" ADD CONSTRAINT "Car_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "Train"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "System" ADD CONSTRAINT "System_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subsystem" ADD CONSTRAINT "Subsystem_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_subsystemId_fkey" FOREIGN KEY ("subsystemId") REFERENCES "Subsystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Equipment" ADD CONSTRAINT "Equipment_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "Drawing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Connector" ADD CONSTRAINT "Connector_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pin" ADD CONSTRAINT "Pin_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "Connector"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wire" ADD CONSTRAINT "Wire_sourcePinId_fkey" FOREIGN KEY ("sourcePinId") REFERENCES "Pin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wire" ADD CONSTRAINT "Wire_destPinId_fkey" FOREIGN KEY ("destPinId") REFERENCES "Pin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wire" ADD CONSTRAINT "Wire_drawingId_fkey" FOREIGN KEY ("drawingId") REFERENCES "Drawing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Drawing" ADD CONSTRAINT "Drawing_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Drawing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Diagnostic" ADD CONSTRAINT "Diagnostic_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VCCKnowledge" ADD CONSTRAINT "VCCKnowledge_systemId_fkey" FOREIGN KEY ("systemId") REFERENCES "System"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
