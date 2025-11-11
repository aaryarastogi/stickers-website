/**
 * Utility functions for localStorage operations
 * Optimized to prevent quota exceeded errors by storing only essential user data
 */

/**
 * Extracts only essential user fields to prevent localStorage quota exceeded errors
 * @param {Object} user - Full user object from API
 * @returns {Object} - Minimal user object with only essential fields
 */
export const extractEssentialUserData = (user) => {
  if (!user) return null;

  // Only store essential fields
  const essentialData = {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    // Only store profileImageUrl if it's a URL (not base64)
    // Base64 images can be very large and cause quota errors
    profileImageUrl: user.profileImageUrl && !user.profileImageUrl.startsWith('data:') 
      ? user.profileImageUrl 
      : null,
  };

  return essentialData;
};

/**
 * Safely stores user data in localStorage with size check
 * @param {Object} user - User object to store
 * @returns {boolean} - True if successful, false if quota exceeded
 */
export const setUserInStorage = (user) => {
  try {
    const essentialData = extractEssentialUserData(user);
    const jsonString = JSON.stringify(essentialData);
    
    // Check size before storing (localStorage limit is typically 5-10MB)
    // Warn if approaching limit (4MB threshold)
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInMB = sizeInBytes / (1024 * 1024);
    
    if (sizeInMB > 4) {
      console.warn('User data is large:', sizeInMB.toFixed(2), 'MB');
    }
    
    localStorage.setItem('user', jsonString);
    return true;
  } catch (error) {
    if (error.name === 'QuotaExceededError' || error.message.includes('quota')) {
      console.error('localStorage quota exceeded. Clearing old data and retrying...');
      // Try to clear and retry once
      try {
        // Clear only non-essential items
        const token = localStorage.getItem('token');
        localStorage.clear();
        if (token) {
          localStorage.setItem('token', token);
        }
        const essentialData = extractEssentialUserData(user);
        localStorage.setItem('user', JSON.stringify(essentialData));
        return true;
      } catch (retryError) {
        console.error('Failed to store user data after clearing:', retryError);
        return false;
      }
    }
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Gets user data from localStorage
 * @returns {Object|null} - User object or null if not found
 */
export const getUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    if (!userData) return null;
    return JSON.parse(userData);
  } catch (error) {
    console.error('Error reading user data from localStorage:', error);
    return null;
  }
};

/**
 * Updates specific user field in localStorage
 * @param {string} field - Field name to update
 * @param {any} value - New value
 * @returns {boolean} - True if successful
 */
export const updateUserFieldInStorage = (field, value) => {
  try {
    const user = getUserFromStorage();
    if (!user) return false;
    
    user[field] = value;
    return setUserInStorage(user);
  } catch (error) {
    console.error('Error updating user field:', error);
    return false;
  }
};

