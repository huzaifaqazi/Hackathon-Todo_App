/**
 * Utility functions for handling date and time formatting in the chat application
 */

/**
 * Format a timestamp for message display (shows time like "02:27 PM")
 */
export function formatMessageTime(timestamp: string): string {
  try {
    // Ensure the timestamp is treated as UTC by appending 'Z' if no timezone info is present
    let normalizedTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
      // If timestamp is in format like "2026-02-03T18:41:12.979239" without timezone indicator,
      // append 'Z' to indicate it's UTC
      normalizedTimestamp = timestamp + 'Z';
    }

    const date = new Date(normalizedTimestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string provided to formatMessageTime:', timestamp);
      return 'Invalid time';
    }

    // Format to 12-hour time with AM/PM
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting message time:', error);
    return 'Invalid time';
  }
}

/**
 * Format a timestamp for relative time display (shows "5m ago", "2h ago", etc.)
 */
export function formatRelativeTime(timestamp: string): string {
  try {
    // Parse the timestamp ensuring it's treated as UTC
    // If no timezone info is present, assume it's UTC by appending 'Z'
    let normalizedTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
      normalizedTimestamp = timestamp + 'Z';
    }

    const date = new Date(normalizedTimestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string provided to formatRelativeTime:', timestamp);
      return 'Invalid time';
    }

    const now = new Date();

    // Calculate the difference in seconds
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Handle future dates (edge case, accounting for potential clock skew)
    if (diffInSeconds < 0) {
      // If the timestamp is slightly in the future (within 1 minute), consider it "Just now"
      // This accounts for minor clock differences between client and server
      if (diffInSeconds >= -60) {
        return 'Just now';
      } else {
        // For dates significantly in the future, return "Just now" to avoid confusing negative time displays
        return 'Just now';
      }
    }

    // Less than a minute ago
    if (diffInSeconds < 60) {
      return 'Just now';
    }

    // Less than an hour ago
    if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    }

    // Less than a day ago
    if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    }

    // Less than a week ago
    if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }

    // For older dates, show in a more readable format
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateWithoutTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const yesterdayWithoutTime = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const todayWithoutTime = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (dateWithoutTime.getTime() === todayWithoutTime.getTime()) {
      return 'Today';
    } else if (dateWithoutTime.getTime() === yesterdayWithoutTime.getTime()) {
      return 'Yesterday';
    } else {
      // Use toLocaleDateString to format according to user's locale
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid time';
  }
}

/**
 * Format a timestamp for absolute date display (shows "Jan 23, 2026")
 */
export function formatDate(timestamp: string): string {
  try {
    // Ensure the timestamp is treated as UTC by appending 'Z' if no timezone info is present
    let normalizedTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
      normalizedTimestamp = timestamp + 'Z';
    }

    const date = new Date(normalizedTimestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string provided to formatDate:', timestamp);
      return 'Invalid date';
    }

    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

/**
 * Format a timestamp for absolute time display (shows "Jan 23, 2026 at 2:27 PM")
 */
export function formatDateTime(timestamp: string): string {
  try {
    // Ensure the timestamp is treated as UTC by appending 'Z' if no timezone info is present
    let normalizedTimestamp = timestamp;
    if (!timestamp.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(timestamp)) {
      normalizedTimestamp = timestamp + 'Z';
    }

    const date = new Date(normalizedTimestamp);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      console.error('Invalid date string provided to formatDateTime:', timestamp);
      return 'Invalid date';
    }

    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid date';
  }
}