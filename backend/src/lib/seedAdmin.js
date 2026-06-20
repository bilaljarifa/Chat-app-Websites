import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import e2eEncryption from "./encryption.js";

export const seedAdmin = async () => {
  try {
    const adminEmail = "bey@email.com";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log("👤 Admin user not found. Seeding admin...");

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123456", salt);
      const { publicKey, privateKey, keyId } = await e2eEncryption.generateKeyPair();

      admin = new User({
        fullName: "Admin",
        email: adminEmail,
        password: hashedPassword,
        profilePic: "/BeyonderAdmin.png",
        isAdmin: true,
        publicKey,
        privateKey,
        keyId,
        encryptionEnabled: true,
        interests: ["Technology", "Management", "Support"],
      });

      await admin.save();
      console.log("✅ Admin user successfully seeded!");
    } else if (!admin.isAdmin) {
      admin.isAdmin = true;
      await admin.save();
      console.log("✅ Admin flag updated for existing user.");
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error);
  }
};
