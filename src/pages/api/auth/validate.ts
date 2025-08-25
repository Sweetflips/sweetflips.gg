import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Enable CORS for Unity WebGL
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ 
      isValid: false, 
      message: "Method not allowed" 
    });
  }

  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        isValid: false,
        userId: 0,
        message: "No authorization token provided" 
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    // First, try to validate as a Supabase token
    if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_ANON_KEY
      );

      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          return res.status(200).json({
            isValid: true,
            userId: user.user_metadata?.user_id || 0,
            authUserId: user.id,
            message: "Token is valid"
          });
        }
      } catch (supabaseError) {
        console.log("Not a valid Supabase token, trying other validation methods");
      }
    }

    // If not a Supabase token, try to validate as a Kick OAuth token
    // For Kick tokens, we'll just check if they can fetch user info
    try {
      const kickUserRes = await fetch("https://api.kick.com/public/v1/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (kickUserRes.ok) {
        const kickData = await kickUserRes.json();
        const kickUser = kickData?.data?.[0];
        
        if (kickUser) {
          return res.status(200).json({
            isValid: true,
            userId: kickUser.user_id || 0,
            message: "Kick token is valid"
          });
        }
      }
    } catch (kickError) {
      console.log("Not a valid Kick token either");
    }

    // If we get here, token is invalid
    return res.status(401).json({
      isValid: false,
      userId: 0,
      message: "Invalid or expired token"
    });

  } catch (error) {
    console.error("Token validation error:", error);
    return res.status(500).json({
      isValid: false,
      userId: 0,
      message: "Internal server error during validation"
    });
  }
}