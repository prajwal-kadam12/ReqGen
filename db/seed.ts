import { DatabaseStorage } from "./storage";

async function seedDatabase() {
  const storage = new DatabaseStorage();

  try {
    console.log("🌱 Seeding database with demo users...");

    const existingAnalyst = await storage.getUserByEmail("analyst@reqgen.com");
    if (!existingAnalyst) {
      await storage.createUser({
        username: "analyst",
        email: "analyst@reqgen.com",
        password: "analyst123",
        role: "analyst",
        name: "Demo Analyst",
      });
      console.log("✅ Created analyst user");
    } else {
      console.log("ℹ️  Analyst user already exists");
    }

    const existingAdmin = await storage.getUserByEmail("admin@reqgen.com");
    if (!existingAdmin) {
      await storage.createUser({
        username: "admin",
        email: "admin@reqgen.com",
        password: "admin123",
        role: "admin",
        name: "Demo Admin",
      });
      console.log("✅ Created admin user");
    } else {
      console.log("ℹ️  Admin user already exists");
    }

    const existingClient = await storage.getUserByEmail("client@reqgen.com");
    if (!existingClient) {
      await storage.createUser({
        username: "client",
        email: "client@reqgen.com",
        password: "client123",
        role: "client",
        name: "Demo Client",
      });
      console.log("✅ Created client user");
    } else {
      console.log("ℹ️  Client user already exists");
    }

    console.log("✅ Database seeding completed!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
