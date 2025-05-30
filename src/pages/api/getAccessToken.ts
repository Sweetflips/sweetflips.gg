import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.post('https://api.kick.com/oauth/token', {
      client_id: process.env.NEXT_PUBLIC_KICK_CLIENT_ID,
      client_secret: process.env.KICK_CLIENT_SECRET,
      grant_type: 'client_credentials', // OAuth 2.0 Client Credentials Flow
    });

    const accessToken = response.data.access_token; // Get the token from the response
    res.status(200).json({ accessToken }); // Return the token
  } catch (error) {
    // TypeScript error: "error" is of type 'unknown'
    if (axios.isAxiosError(error)) {
      // Now TypeScript knows that "error" is an AxiosError
      console.error('Axios error:', error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || 'Unable to get access token' });
    } else {
      // If error is not an AxiosError, fallback to generic error handling
      console.error('Unexpected error:', error);
      res.status(500).json({ error: 'Unexpected error occurred' });
    }
  }
}