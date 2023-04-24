import {MediaItem} from '@common/player/media-item';
import {PersistablePlayerState} from '@common/player/player-local-storage';
import {PlayerStoreOptions} from '@common/player/player-store-options';
import {elIsInFullscreen} from '@common/player/utils/el-is-in-fullscreen';
import fscreen from 'fscreen';
import {ProviderListeners} from '@common/player/player-state';

export abstract class PlayerProvider {
  abstract name: MediaItem['provider'];

  constructor(
    public listeners: ProviderListeners,
    public initialState: PersistablePlayerState,
    public options: PlayerStoreOptions
  ) {}

  abstract play(media: MediaItem): Promise<void>;
  abstract pause(): void;
  abstract stop(): void;
  abstract seek(time: number): void;
  abstract getDuration(): number; // in seconds
  abstract getCurrentTime(): number; // in seconds
  abstract setVolume(volume: number): void;
  abstract setMuted(isMuted: boolean): void;
  abstract cueMedia(media: MediaItem): Promise<MediaItem>;
  destroy() {
    fscreen.removeEventListener(
      'fullscreenchange',
      this.fullscreenListener.bind(this)
    );
    fscreen.removeEventListener(
      'fullscreenerror',
      this.fullscreenListener.bind(this)
    );
  }

  protected abstract getFullscreenEl(): HTMLElement | undefined;
  protected fullscreenListener() {
    const el = this.getFullscreenEl();
    const isFullscreen = el != null && elIsInFullscreen(el);
    if (isFullscreen) {
      try {
        screen.orientation.lock('landscape').catch(() => {});
      } catch (e) {}
    } else {
      screen.orientation.unlock();
    }

    this.listeners.onFullscreenChange?.(el != null && elIsInFullscreen(el));
  }
  enterFullscreen() {
    const el = this.getFullscreenEl();
    if (el) {
      fscreen.addEventListener(
        'fullscreenchange',
        this.fullscreenListener.bind(this)
      );
      fscreen.addEventListener(
        'fullscreenerror',
        this.fullscreenListener.bind(this)
      );
      fscreen.requestFullscreen(el);
    }
  }
}
