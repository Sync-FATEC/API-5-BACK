type DecodedToken = {
    name: string;
    picture: string;
    iss: string;
    aud: string;
    auth_time: number;
    user_id: string;
    sub: string;
    iat: number;
    exp: number;
    email: string;
    email_verified: boolean;
    firebase: {
        identities: {
            "google.com": string[];
            email: string[];
        };
        sign_in_provider: string;
    };
};

export function getToken(req: any): DecodedToken | null {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());;
}