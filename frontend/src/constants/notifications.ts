// Helper functions for notifications
export const showSuccess = (title: string, message?: string) => ({
  type: 'success' as const,
  title,
  message
});

export const showError = (title: string, message?: string) => ({
  type: 'error' as const,
  title,
  message
});

export const showWarning = (title: string, message?: string) => ({
  type: 'warning' as const,
  title,
  message
});

export const showInfo = (title: string, message?: string) => ({
  type: 'info' as const,
  title,
  message
});
