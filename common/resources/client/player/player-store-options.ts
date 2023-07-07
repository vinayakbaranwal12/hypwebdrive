import {MediaItem, YoutubeMediaItem} from '@common/player/media-item';
import {RefObject} from 'react';
import {PlayerInitialData} from '@common/player/player-local-storage';
import {ProviderListeners} from '@common/player/player-state';
import OnStateChangeEvent = YT.OnStateChangeEvent;

export interface PlayerStoreOptions {
  ref: RefObject<HTMLElement>;
  defaultVolume?: number;
  onBeforePlay?: (mediaItem?: MediaItem) => void | {preventPlayback?: boolean};
  loadMoreMediaItems?: (
    mediaItem?: MediaItem
  ) => Promise<MediaItem[] | undefined>;
  onDestroy?: () => void;
  youtube?: {
    srcResolver?: (mediaItem: YoutubeMediaItem) => Promise<YoutubeMediaItem>;
    suggestedQuality?: YT.SuggestedVideoQuality;
    onStateChange?: (e: OnStateChangeEvent) => void;
  };
  listeners?: ProviderListeners;
  setMediaSessionMetadata?: (mediaItem: MediaItem) => void;
  initialData?: PlayerInitialData;
}
