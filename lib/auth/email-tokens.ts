import jwt from 'jsonwebtoken';

/**
 * Token payload interface
 */
export interface ApprovalTokenPayload {
  stepId: string;
  approverId: string;
  action: 'approve' | 'reject';
  exp: number;
}

/**
 * Get JWT secret with validation
 */
function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}

/**
 * Generate a signed JWT token for email-based approval actions
 *
 * @param stepId - The approval step ID
 * @param approverId - The approver's user ID
 * @param action - The action to perform ('approve' or 'reject')
 * @returns A signed JWT token string
 */
export function generateApprovalToken(
  stepId: string,
  approverId: string,
  action: 'approve' | 'reject' = 'approve'
): string {
  // Token expires in 7 days
  const expiresIn = 7 * 24 * 60 * 60; // 7 days in seconds

  return jwt.sign(
    {
      stepId,
      approverId,
      action,
    },
    getJWTSecret(),
    { expiresIn }
  );
}

/**
 * Verify and decode an approval token
 *
 * @param token - The JWT token to verify
 * @returns The decoded token payload or null if invalid/expired
 */
export function verifyApprovalToken(token: string): ApprovalTokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJWTSecret()) as ApprovalTokenPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Generate a rejection token (alias for clarity)
 */
export function generateRejectionToken(stepId: string, approverId: string): string {
  return generateApprovalToken(stepId, approverId, 'reject');
}
