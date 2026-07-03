import { PrismaClient, ValidationStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
const db = new PrismaClient();

// Sample seed: ONE real, fully-wired path per system.
// Rule: never bulk-generate fake wire variants. Add real rows only,
// each backed by an actual drawing number, or mark UNVERIFIED honestly.

async function main() {
  await db.user.upsert({
    where: { email: "admin@beml.local" },
    update: {},
    create: {
      email: "admin@beml.local",
      name: "Admin",
      role: Role.ADMIN,
      passwordHash: await bcrypt.hash("changeme123", 10),
    },
  });

  const train = await db.train.create({
    data: { code: "KMRCL-RS3R-01", name: "KMRCL RS3R Metro Rake 01" },
  });

  const formation = ["DMC", "TC", "MC", "MC", "TC", "DMC"];
  const cars = [];
  for (let i = 0; i < formation.length; i++) {
    cars.push(
      await db.car.create({
        data: { trainId: train.id, position: i + 1, carType: formation[i] },
      })
    );
  }

  const drawing = await db.drawing.create({
    data: { number: "942-38409", revision: null, title: "TRAC Power Wiring", active: true },
  });
  const drawingRevA = await db.drawing.create({
    data: { number: "942-38409", revision: "A", parentId: drawing.id, title: "TRAC Power Wiring Rev A", active: true },
  });

  const tracSystem = await db.system.create({
    data: { carId: cars[0].id, code: "TRAC", name: "Traction System" },
  });

  const tracSub = await db.subsystem.create({
    data: { systemId: tracSystem.id, code: "TRAC-PWR", name: "Traction Power Supply" },
  });

  const eq1 = await db.equipment.create({
    data: { subsystemId: tracSub.id, tag: "TRAC-EQ-01", name: "Traction Converter", drawingId: drawing.id },
  });
  const eq2 = await db.equipment.create({
    data: { subsystemId: tracSub.id, tag: "TRAC-EQ-02", name: "Traction Motor Junction Box", drawingId: drawingRevA.id },
  });

  const cn1 = await db.connector.create({ data: { equipmentId: eq1.id, designator: "CN-101" } });
  const cn2 = await db.connector.create({ data: { equipmentId: eq2.id, designator: "CN-205" } });

  const pin1 = await db.pin.create({ data: { connectorId: cn1.id, number: "1", function: "24V+" } });
  const pin2 = await db.pin.create({ data: { connectorId: cn2.id, number: "12", function: "24V+" } });

  await db.wire.create({
    data: {
      wireNumber: "W1032",
      sourcePinId: pin1.id,
      destPinId: pin2.id,
      cable: "C100",
      trainline: "TL-24V-A",
      drawingId: drawing.id,
      validationStatus: ValidationStatus.VERIFIED,
    },
  });

  await db.diagnostic.create({
    data: {
      faultCode: "TRAC-F001",
      description: "Traction Converter 24V supply loss",
      systemId: tracSystem.id,
      probableCause: "Broken continuity on W1032 between CN-101 pin1 and CN-205 pin12",
      testProcedure: "Measure continuity CN-101 pin1 to CN-205 pin12 with multimeter, 0-1 ohm expected",
      repairProcedure: "Trace W1032 per drawing 942-38409, repair/replace faulty segment",
    },
  });

  await db.vccKnowledge.create({
    data: {
      systemId: tracSystem.id,
      overview: "Traction system converts line power to motor drive power for propulsion.",
      powerFlow: "Pantograph -> HV Breaker -> Traction Converter -> Motor",
      signalFlow: "TCMS command -> Converter control board -> Gate drive",
      testingNotes: "Verify 24V control supply continuity before HV energization.",
    },
  });

  // Repeat pattern for BRAKE / DOOR minimally so hierarchy has >1 system
  for (const code of ["BRAKE", "DOOR"]) {
    const sys = await db.system.create({ data: { carId: cars[0].id, code, name: `${code} System` } });
    await db.subsystem.create({ data: { systemId: sys.id, code: `${code}-SUB`, name: `${code} Subsystem` } });
  }

  console.log("Seed complete: 1 train, 6 cars, 3 systems, 1 fully verified traced wire.");
}

main().finally(() => db.$disconnect());
