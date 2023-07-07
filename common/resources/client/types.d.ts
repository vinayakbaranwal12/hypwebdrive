declare module '@react-stately/utils' {
  function useControlledState<T>(
    value?: T,
    defaultValue?: T,
    onChange?: (val: T, ...args: any[]) => void
  ): [T, (val: T | ((prevState: T) => T), ...args: any[]) => void];
}

declare module 'mime-match' {
  function match(typeA: string, typeB: string): boolean;
  export = match;
}

interface Window {
  grecaptcha?: {
    ready: (callback: () => void) => void;
    execute: (siteKey: string, options: {action: string}) => Promise<string>;
  };
  bootstrapData: string;
  onYouTubeIframeAPIReady: () => void;
}
