import { formatDistanceToNow } from 'date-fns';

export const formatTimeAgo = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatShortTime = (date: string | Date): string => {
  const distance = formatDistanceToNow(new Date(date));
  
  // Convert "about 2 hours" to "2h"
  return distance
    .replace(/about\s+/, '')
    .replace(/less than a minute/, '1m')
    .replace(/(\d+)\s+minutes?/, '$1m')
    .replace(/(\d+)\s+hours?/, '$1h')
    .replace(/(\d+)\s+days?/, '$1d')
    .replace(/(\d+)\s+weeks?/, '$1w')
    .replace(/(\d+)\s+months?/, '$1mo')
    .replace(/(\d+)\s+years?/, '$1y');
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateAvatarUrl = (name: string): string => {
  // Generate a simple avatar URL using the first letter of the name
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return `https://ui-avatars.com/api/?name=${initial}&background=1976d2&color=fff&size=128`;
};

export const getUserDisplayName = (user: { firstName?: string; lastName?: string; username?: string; email?: string } | null | undefined): string => {
  if (!user) return '';
  
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  return user.username || user.email || '';
};

export const getUserHandle = (user: { username?: string; email?: string } | null | undefined): string => {
  if (!user) return '';
  
  return user.username || user.email?.split('@')[0] || '';
};

