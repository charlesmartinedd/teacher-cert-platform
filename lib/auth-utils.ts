import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return session.user;
}

export function isSubscribed(subscriptionStatus?: string) {
  return subscriptionStatus === 'active' || subscriptionStatus === 'trialing';
}

export function hasAccessToContent(
  subscriptionTier?: string,
  requiredTier: 'free' | 'basic' | 'pro' | 'premium' = 'free'
) {
  const tierHierarchy = ['free', 'basic', 'pro', 'premium'];
  const userTierLevel = tierHierarchy.indexOf(subscriptionTier || 'free');
  const requiredTierLevel = tierHierarchy.indexOf(requiredTier);

  return userTierLevel >= requiredTierLevel;
}
