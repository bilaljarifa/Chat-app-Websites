import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", token, {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
      httpOnly: true,       // prevent XSS attacks
      sameSite: isProduction ? "none" : "lax",  // "none" required for cross-domain (Netlify <-> Render)
      secure: isProduction, // must be true when sameSite="none"
    });

    return token;
  } catch (error) {
    console.error("❌ Error generating token:", error);
    throw error;
  }
};
