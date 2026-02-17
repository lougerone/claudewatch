import { prisma } from '@claudewatch/database';
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';
const ALGORITHM = 'aes-256-gcm';

export class UserService {
  /**
   * Encrypt API key for storage
   */
  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypt API key from storage
   */
  private decrypt(encrypted: string): string {
    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = parts[2];
    
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Create or update user with API key
   */
  async upsertUser(apiKey: string, monthlyBudget?: number): Promise<string> {
    const encryptedKey = this.encrypt(apiKey);
    
    const user = await prisma.user.upsert({
      where: { apiKey: encryptedKey },
      update: { 
        lastActive: new Date(),
        monthlyBudget: monthlyBudget !== undefined ? monthlyBudget : undefined,
      },
      create: { 
        apiKey: encryptedKey,
        monthlyBudget,
      },
    });

    return user.id;
  }

  /**
   * Get user by API key
   */
  async getUserByApiKey(apiKey: string): Promise<{ id: string; monthlyBudget?: number } | null> {
    const encryptedKey = this.encrypt(apiKey);
    
    const user = await prisma.user.findUnique({
      where: { apiKey: encryptedKey },
      select: {
        id: true,
        monthlyBudget: true,
      },
    });

    return user;
  }

  /**
   * Get decrypted API key for user
   */
  async getApiKey(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { apiKey: true },
    });

    if (!user) return null;

    return this.decrypt(user.apiKey);
  }

  /**
   * Update user's monthly budget
   */
  async updateBudget(userId: string, monthlyBudget: number): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { monthlyBudget },
    });
  }
}

export const userService = new UserService();
