import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../../lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token, type } = req.body;

  if (!token || !type) {
    return res.status(400).json({ message: 'Token and type are required' });
  }

  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type, // 'email' for email verification
    });

    if (error) {
      console.error('Email verification error:', error);
      return res.status(400).json({ message: error.message });
    }

    if (data.user) {
      return res.status(200).json({ 
        message: 'Email verified successfully', 
        user: data.user 
      });
    } else {
      return res.status(400).json({ message: 'Invalid verification token' });
    }
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}