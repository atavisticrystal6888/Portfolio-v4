interface Window {
  va?: {
    track: (event: string, data?: Record<string, unknown>) => void;
  };
}
