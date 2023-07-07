import {MediaItem} from '@common/player/media-item';
import {PlayerProvider} from '@common/player/providers/player-provider';

export type RepeatMode = 'one' | 'all' | false;

export interface ProviderListeners {
  onPlay?: (media?: MediaItem) => void;
  onPause?: () => void;
  onError?: (e?: any, player?: PlayerState) => void;
  onBuffering?: () => void;
  onSeek?: (time: number) => void;
  onPlaybackEnd?: (media?: MediaItem) => void;
  onCued?: (media?: MediaItem) => void;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface PlayerState {
  // queue
  originalQueue: MediaItem[];
  shuffledQueue: MediaItem[];
  cuedMedia?: MediaItem;

  // volume
  volume: number;
  setVolume: (value: number) => void;
  muted: boolean;
  setMuted: (isMuted: boolean) => void;

  status: 'playing' | 'paused' | 'buffering' | 'uninitialized';
  mediaDuration: number;
  getCurrentTime: () => number;

  repeat: RepeatMode;
  toggleRepeatMode: () => void;

  shuffling: boolean;
  toggleShuffling: () => void;

  isFullscreen: boolean;
  enterFullscreen: () => void;
  exitFullscreen: () => void;

  provider: PlayerProvider | null;

  // actions
  cue: (media: MediaItem) => Promise<void>;
  play: (media?: MediaItem) => Promise<void>;
  pause: () => void;
  stop: () => void;
  playPrevious: () => void;
  playNext: () => void;
  seek: (time: number) => void;
  overrideQueue: (
    mediaItems: MediaItem[],
    queuePointer?: number
  ) => Promise<void>;
  appendToQueue: (mediaItems: MediaItem[], afterCuedMedia?: boolean) => void;
  removeFromQueue: (mediaItems: MediaItem[]) => void;
  subscribe: (listeners: ProviderListeners) => () => void;
  destroy: () => void;
  init: () => void;
}
