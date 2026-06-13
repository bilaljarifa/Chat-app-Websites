import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import e2eEncryption from "./encryption.js";

export const seedChatBot = async () => {
  try {
    const chatbotEmail = "chatbot@chatwithme.com";
    let chatbot = await User.findOne({ email: chatbotEmail });

    if (!chatbot) {
      console.log("🤖 ChatBot not found in DB. Seeding ChatBot...");
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("chatbot_secure_password_123!@#", salt);

      const { publicKey, privateKey, keyId } = await e2eEncryption.generateKeyPair();

      chatbot = new User({
        fullName: "ChatBot",
        email: chatbotEmail,
        password: hashedPassword,
        profilePic: "/chatbot_avatar.png",
        isSystemBot: true,
        publicKey,
        privateKey,
        keyId,
        encryptionEnabled: true,
        interests: ["Technology", "AI", "Chatting"]
      });

      await chatbot.save();
      console.log("✅ ChatBot successfully seeded!");
    } else {
      console.log("🤖 ChatBot already exists.");
      // Ensure it has the correct flags and avatar in case it was created earlier
      if (!chatbot.isSystemBot || chatbot.profilePic !== "/chatbot_avatar.png") {
        chatbot.isSystemBot = true;
        chatbot.profilePic = "/chatbot_avatar.png";
        await chatbot.save();
        console.log("✅ ChatBot updated with system flags and avatar.");
      }
    }
  } catch (error) {
    console.error("❌ Error seeding ChatBot:", error);
  }
};
