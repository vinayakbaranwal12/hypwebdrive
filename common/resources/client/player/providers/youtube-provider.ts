import {PlayerProvider} from '@common/player/providers/player-provider';
import {YoutubeMediaItem} from '@common/player/media-item';
import lazyLoader from '@common/utils/http/lazy-loader';
import {Required} from 'utility-types';
import {isSameMedia} from '@common/player/utils/is-same-media';

const YoutubePlayerVars: YT.PlayerVars = {
  autoplay: 0,
  rel: 0,
  showinfo: 0,
  disablekb: 1,
  controls: 0,
  modestbranding: 1,
  iv_load_policy: 3,
  playsinline: 1,
};

export class YoutubeProvider extends PlayerProvider {
  name = 'youtube' as const;

  youtube?: YT.Player;
  cuedMedia?: YoutubeMediaItem;
  protected containerEl?: HTMLDivElement;

  async play(media: YoutubeMediaItem) {
    await this.cueMedia(media);
    if (this.youtube?.playVideo) {
      this.youtube.playVideo();
    }
  }

  pause() {
    this.youtube?.pauseVideo();
  }

  stop() {
    this.youtube?.stopVideo();
  }

  seek(time: number) {
    this.youtube?.seekTo(time, true);
  }

  getDuration(): number {
    if (this.youtube?.getDuration) {
      this.youtube.getDuration();
    }
    return 0;
  }

  getCurrentTime(): number {
    return this.youtube?.getCurrentTime() || 0;
  }

  setVolume(number: number) {
    this.youtube?.setVolume(number);
  }

  setMuted(value: boolean) {
    if (value) {
      this.youtube?.mute();
    } else {
      this.youtube?.unMute();
    }
  }

  async cueMedia(media: YoutubeMediaItem): Promise<any> {
    if (isSameMedia(this.cuedMedia, media)) return;

    this.cuedMedia = media;

    const [, resolvedMedia] = await Promise.all([
      loadYoutubePlayer(),
      media.src === 'resolve'
        ? this.options.youtube?.srcResolver?.(media)
        : Promise.resolve(media),
    ]);

    if (!resolvedMedia?.src || !youtubePlayerIsLoaded()) {
      this.listeners.onError?.();
      return;
    }

    await this.cueYoutubeVideo(resolvedMedia as Required<YoutubeMediaItem>);
  }

  destroy() {
    try {
      super.destroy();
      this.youtube?.destroy();
    } catch (e) {
      //
    }
    this.containerEl?.remove();
    this.youtube = undefined;
    this.cuedMedia = undefined;
  }

  async cueYoutubeVideo(media: Required<YoutubeMediaItem>) {
    const currentYoutubeId = await this.getYoutubeId();
    if (media.src !== currentYoutubeId) {
      if (!this.youtube) {
        // YouTube player not initialized yet, do it now
        this.containerEl = document.createElement('div');
        this.options.ref.current!.appendChild(this.containerEl);
        await new Promise<void>(resolve => {
          this.youtube = new YT.Player(this.containerEl!, {
            videoId: media.src,
            playerVars: YoutubePlayerVars,
            events: {
              onReady: () => {
                if (this.initialState.muted) {
                  this.setMuted(true);
                }
                this.setVolume(this.initialState.volume ?? 30);
                resolve();
              },
              onError: this.listeners.onError,
              onStateChange: this.onYoutubeStateChange.bind(this),
            },
          });
        });
      } else {
        // YouTube player was initialized before, can just cue the video directly
        if (this.youtube?.loadVideoById) {
          this.youtube.loadVideoById({
            videoId: media.src,
            suggestedQuality: this.options.youtube?.suggestedQuality,
          });
        }
      }
    }

    this.cuedMedia = media;
  }

  public getYoutubeId(): string | undefined {
    const url = this.youtube?.getVideoUrl?.();
    return url ? url.split('v=')[1] : undefined;
  }

  protected onYoutubeStateChange(e: YT.OnStateChangeEvent) {
    this.options.youtube?.onStateChange?.(e);
    switch (e.data) {
      case YT.PlayerState.ENDED:
        this.listeners.onPlaybackEnd?.();
        break;
      case YT.PlayerState.PLAYING:
        this.listeners.onPlay?.();
        break;
      case YT.PlayerState.BUFFERING:
        this.listeners.onBuffering?.();
        break;
      case YT.PlayerState.PAUSED:
        this.listeners.onPause?.();
        break;
    }
  }

  getFullscreenEl() {
    return this.youtube?.getIframe();
  }
}

function loadYoutubePlayer() {
  return new Promise(resolve => {
    if (youtubePlayerIsLoaded()) {
      resolve(window.YT);
      return;
    } else {
      lazyLoader.loadAsset('https://www.youtube.com/iframe_api', {
        type: 'js',
      });
    }

    const previous = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (previous) {
        previous();
      }

      resolve(window.YT);
    };
  });
}

function youtubePlayerIsLoaded(): boolean {
  return window.YT && window.YT.Player && window.YT.Player instanceof Function;
}
