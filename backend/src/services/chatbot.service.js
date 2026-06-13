import OpenAI from "openai";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";
import { encryptCaesar, decryptCaesar } from "../lib/caesarCipher.js";

// ─── OpenAI client ────────────────────────────────────────────────────────────
// ✅ only created when a message is actually sent
const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

// ─── Fallback messages ────────────────────────────────────────────────────────
const FALLBACK = {
  NO_KEY:
    "Hey! I'm ChatBot 👋, your guide to ChatWithMe — built by Bilal Jarifa. My AI brain isn't connected right now, but feel free to explore messaging, groups, friends, themes, and reactions while I'm offline!",
  RATE_LIMITED:
    "I'm a little overwhelmed with messages right now! Give me a moment and try again — I'll be right back. ⏳",
  AUTH_ERROR:
    "I'm having trouble authenticating right now. The team has been notified. Try again shortly!",
  GENERIC:
    "Something went wrong on my end. Try sending your message again in a moment!",
};

// ─── Main handler ─────────────────────────────────────────────────────────────
export const handleChatBotMessage = async (userMessage, senderId, chatbotId) => {
  // Grab the user's socket ID early so we can always clean up
  const userSocketId = getReceiverSocketId(senderId.toString());

  try {
    // 1. Start typing indicator
    if (userSocketId) {
      io.to(userSocketId).emit("typing", { senderId: chatbotId });
    }

    // 2. Fetch last 10 messages for context
    const recentMessages = await Message.find({
      $or: [
        { senderId, receiverId: chatbotId },
        { senderId: chatbotId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(10);

    recentMessages.reverse();

    const conversationHistory = recentMessages.map((msg) => {
      let text = msg.text || "";
      if (msg.isEncrypted && text) {
        try {
          text = decryptCaesar(text);
        } catch (err) {
          console.warn(`Could not decrypt message ${msg._id}:`, err.message);
          text = "[message unavailable]";
        }
      }
      return {
        role: msg.senderId.toString() === chatbotId.toString() ? "assistant" : "user",
        content: text,
      };
    });

    // 3. Build system prompt — detect new vs returning user
    const isNewUser = conversationHistory.length === 0;

    const systemPrompt = `You are ChatBot, the official AI assistant for ChatWithMe — a modern real-time chat platform built by Bilal Jarifa, a Full-Stack Developer.

Your identity:
- You are ChatBot, NOT Bilal. Never claim to be him.
- Only mention Bilal when crediting the platform (e.g. "ChatWithMe was built by Bilal Jarifa").
- You are warm, helpful, and conversational — not robotic.
- Keep every reply under 80 words. Two or three sentences is ideal.
- Use emojis sparingly — one per message at most, only when it adds warmth.

Your job:
- Welcome new users and help them feel at home.
- Help users discover features: real-time messaging, groups, friend connections, reactions, notifications, themes, profile customization, and sentiment analysis.
- Answer questions about the platform naturally, as a knowledgeable guide would.
- If you don't know something, say so honestly and suggest they explore the app.

Do not:
- Pretend to have feelings or personal experiences.
- Pretend to be human.
- Write long paragraphs.
${isNewUser ? "\nThis is the user's very first message. Introduce yourself warmly and briefly." : ""}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    // 4. Call OpenAI (or use fallback)
    let aiResponseText = "";

    try {
      const openai = getOpenAIClient();

      if (!openai) {
        aiResponseText = FALLBACK.NO_KEY;
      } else {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages,
          max_tokens: 180,
          temperature: 0.7,
        });

        const content = response.choices?.[0]?.message?.content?.trim();
        if (!content) throw new Error("Empty response from OpenAI");
        aiResponseText = content;
      }
    } catch (apiError) {
      console.error("OpenAI API Error:", apiError?.status, apiError?.message);

      if (apiError?.status === 429) {
        aiResponseText = FALLBACK.RATE_LIMITED;
      } else if (apiError?.status === 401 || apiError?.status === 403) {
        aiResponseText = FALLBACK.AUTH_ERROR;
      } else {
        aiResponseText = FALLBACK.GENERIC;
      }
    }
    // 5. Realistic typing delay — scales with response length
    const wordCount = aiResponseText.split(/\s+/).length;
    const delay = Math.min(Math.max(wordCount * 80, 600), 2500);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 6. Stop typing indicator
    if (userSocketId) {
      io.to(userSocketId).emit("stopTyping", { senderId: chatbotId });
    }

    // 7. Encrypt and save to database
    const encryptedText = encryptCaesar(aiResponseText);

    const botMessage = new Message({
      senderId: chatbotId,
      receiverId: senderId,
      text: encryptedText,
      sentiment: "neutral",
      isEncrypted: true,
      encryptionMethod: "caesar",
      encryptionKey: 4,
    });

    await botMessage.save();
    await botMessage.populate("senderId", "fullName profilePic email");
    await botMessage.populate("receiverId", "fullName profilePic email");

    // 8. Emit decrypted message to user via socket
    const messageForSocket = botMessage.toObject();
    messageForSocket.text = aiResponseText;
    messageForSocket.isDecryptedForDisplay = true;

    if (userSocketId) {
      io.to(userSocketId).emit("newMessage", messageForSocket);
    }

    console.log(`✅ ChatBot responded to user ${senderId} (newUser: ${isNewUser})`);

  } catch (error) {
    console.error("❌ Error in handleChatBotMessage:", error.message || error);

    // Always clean up the typing indicator on failure
    if (userSocketId) {
      io.to(userSocketId).emit("stopTyping", { senderId: chatbotId });
    }
  }
};  