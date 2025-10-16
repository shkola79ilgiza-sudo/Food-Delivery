/**
 * Utility for consistent priority color mapping across components
 */

export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'high': return '#f44336';     // Red - Critical
    case 'medium': return '#ff9800';   // Orange - Warning
    case 'low': return '#4caf50';      // Green - Success/Info
    default: return '#2196f3';         // Blue - Default
  }
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#4caf50';   // Green - Excellent
  if (score >= 60) return '#ff9800';   // Orange - Good
  if (score >= 40) return '#ff5722';   // Deep Orange - Fair
  return '#f44336';                    // Red - Poor
};
