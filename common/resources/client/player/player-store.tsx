import {createStore} from 'zustand';
import {immer} from 'zustand/middleware/immer';
import {YoutubeProvider} from '@common/player/providers/youtube-provider';
import {MediaItem} from '@common/player/media-item';
import {setInLocalStorage as _setInLocalStorage} from '@common/utils/hooks/local-storage';
import {shuffleArray} from '@common/utils/array/shuffle-array';
import {PlayerStoreOptions} from '@common/player/player-store-options';
import {
  getPlayerStateFromLocalStorage,
  PersistablePlayerState,
} from '@common/player/player-local-storage';
import {HtmlVideoProvider} from '@common/player/providers/html-video-provider';
import fscreen from 'fscreen';
import {prependToArrayAtIndex} from '@common/utils/array/prepend-to-array-at-index';
import deepMerge from 'deepmerge';
import {resetMediaSession} from '@common/player/utils/reset-media-session';
import {playerQueue} from '@common/player/player-queue';
import {
  PlayerState,
  ProviderListeners,
  RepeatMode,
} from '@common/player/player-state';
import {handlePlayerKeybinds} from '@common/player/handle-player-keybinds';
import {initPlayerMediaSession} from '@common/player/init-player-media-session';
import {isSameMedia} from '@common/player/utils/is-same-media';

export const createPlayerStore = (
  id: string | number,
  options: PlayerStoreOptions
) => {
  const listeners = new Set<ProviderListeners>();
  // add initial listeners from options, these will be present for the entire lifetime of the player
  if (options.listeners) {
    listeners.add(options.listeners);
  }
  // initialData from options should take priority over local storage data
  const initialData = deepMerge(
    getPlayerStateFromLocalStorage(id, options),
    options.initialData || {}
  );

  const setInLocalStorage = (key: string, value: any) => {
    _setInLocalStorage(`player.${id}.${key}`, value);
  };

  return createStore<PlayerState>()(
    immer((set, get) => {
      const queue = playerQueue(get);

      const keybindsHandler = (e: KeyboardEvent) => {
        handlePlayerKeybinds(e, get);
      };

      const selectAndCreateProvider = (name: MediaItem['provider']) => {
        const storeListeners: ProviderListeners = {
          onPlay: () => {
            set(s => {
              s.status = 'playing';
            });
            listeners.forEach(l => l.onPlay?.(get().cuedMedia));
            const exactDuration = get().provider?.getDuration();
            if (exactDuration) {
              set(s => {
                s.mediaDuration = exactDuration;
              });
            }
          },
          onPause: () => {
            set(s => {
              s.status = 'paused';
            });
            listeners.forEach(l => l.onPause?.());
          },
          onError: e => {
            set(s => {
              s.status = 'paused';
            });
            listeners.forEach(l => l.onError?.(e, get()));
          },
          onBuffering: () => {
            set(s => {
              s.status = 'buffering';
            });
            listeners.forEach(l => l.onBuffering?.());
          },
          onSeek: time => {
            listeners.forEach(l => l.onSeek?.(time));
          },
          onPlaybackEnd: async () => {
            const media = get().cuedMedia;
            listeners.forEach(l => l.onPlaybackEnd?.(media));
            if (queue.isLast() && options.loadMoreMediaItems) {
              const items = await options.loadMoreMediaItems(media);
              if (items?.length) {
                get().appendToQueue(items);
              }
            }
            get().playNext();
          },
          onCued: () => {
            listeners.forEach(l => l.onCued?.(get().cuedMedia));
          },
          onFullscreenChange: isFullscreen => {
            listeners.forEach(l => l.onFullscreenChange?.(isFullscreen));
            set(s => {
              s.isFullscreen = isFullscreen;
            });
          },
        };

        const currentState: PersistablePlayerState = {
          ...initialData.state,
          volume: get().volume,
          muted: get().muted,
          shuffling: get().shuffling,
          repeat: get().repeat,
        };

        switch (name) {
          case 'youtube':
            return new YoutubeProvider(storeListeners, currentState, options);
          case 'htmlVideo':
            return new HtmlVideoProvider(storeListeners, currentState, options);
        }
      };

      const initialQueue = initialData.queue || [];

      return {
        originalQueue: initialQueue,
        shuffledQueue: initialData.state?.shuffling
          ? shuffleArray(initialQueue)
          : initialQueue,
        status: 'uninitialized',
        volume: initialData.state?.volume ?? 30,
        setVolume: value => {
          get().provider?.setVolume(value);
          set(s => {
            s.volume = value;
          });
          setInLocalStorage('volume', value);
        },
        muted: initialData.state?.muted ?? false,
        setMuted: isMuted => {
          get().provider?.setMuted(isMuted);
          set(s => {
            s.muted = isMuted;
          });
          setInLocalStorage('muted', isMuted);
        },
        repeat: initialData.state?.repeat ?? 'all',
        toggleRepeatMode: () => {
          let newRepeat: RepeatMode = 'all';
          const currentRepeat = get().repeat;
          if (currentRepeat === 'all') {
            newRepeat = 'one';
          } else if (currentRepeat === 'one') {
            newRepeat = false;
          }

          set(s => {
            s.repeat = newRepeat;
          });
          setInLocalStorage('repeat', newRepeat);
        },
        shuffling: initialData.state?.shuffling ?? false,
        toggleShuffling: () => {
          let newQueue: MediaItem[] = [];

          if (get().shuffling) {
            newQueue = get().originalQueue;
          } else {
            newQueue = shuffleArray([...get().shuffledQueue]);
          }

          set(s => {
            s.shuffling = !s.shuffling;
            s.shuffledQueue = newQueue;
          });
        },
        mediaDuration: 0,
        provider: null,
        seek: time => {
          get().provider?.seek(time);
          listeners.forEach(l => l.onSeek?.(time));
        },
        subscribe: newListeners => {
          listeners.add(newListeners);
          return () => listeners.delete(newListeners);
        },
        getCurrentTime: () => {
          return get().provider?.getCurrentTime() || 0;
        },
        play: async media => {
          // get currently active queue item, if none is provided
          if (media) {
            await get().cue(media);
          } else {
            media = get().cuedMedia || queue.getCurrent();
          }
          // if no media to play, stop player and bail
          if (!media) {
            get().stop();
            return;
          }
          const r = options.onBeforePlay?.(media);
          if (!r?.preventPlayback) {
            await get().provider?.play(media);
          }
        },
        pause: () => {
          get().provider?.pause();
        },
        stop: () => {
          if (get().status !== 'playing') return;
          get().pause();
          get().seek(0);

          set(s => {
            s.status = 'paused';
          });
        },
        playNext: async () => {
          get().stop();
          let media = queue.getCurrent();

          if (get().repeat === 'all' && queue.isLast()) {
            media = queue.getFirst();
          } else if (get().repeat !== 'one') {
            media = queue.getNext();
          }

          if (media) {
            await get().play(media);
          } else {
            get().seek(0);
            get().play();
          }
        },
        playPrevious: async () => {
          get().stop();
          let media = queue.getCurrent();

          if (get().repeat === 'all' && queue.getPointer() === 0) {
            media = queue.getLast();
          } else if (get().repeat !== 'one') {
            media = queue.getPrevious();
          }

          if (media) {
            await get().play(media);
          } else {
            get().seek(0);
            get().play();
          }
        },
        cue: async media => {
          if (isSameMedia(media, get().cuedMedia)) return;

          // select new provider (if needed) and destroy previous one
          if (get().provider?.name !== media.provider) {
            get().provider?.destroy();
            const newProvider = selectAndCreateProvider(media.provider);
            if (newProvider) {
              set(s => {
                return {...s, provider: newProvider};
              });
            }
          }

          set(s => {
            s.cuedMedia = media;
          });

          await get().provider!.cueMedia(media);

          // wait for provider to cue media before trying to get the duration
          set(s => {
            s.mediaDuration =
              get().provider?.getDuration() || get().cuedMedia?.duration || 0;
            s.status = 'paused';
          });

          if (media) {
            options.setMediaSessionMetadata?.(media);
          }

          listeners.forEach(listener => listener.onCued?.(media));
          // set status to "paused" and fire "onPause" event, as it might not
          // fire from provider, if cueing from a track that was already paused
          listeners.forEach(listener => listener.onPause?.());

          setInLocalStorage('cuedMediaId', media.id);
        },
        async overrideQueue(
          mediaItems: MediaItem[],
          queuePointer: number = 0
        ): Promise<any> {
          if (!mediaItems?.length) return;
          const items = [...mediaItems];
          set(s => {
            s.shuffledQueue = get().shuffling
              ? shuffleArray(items, true)
              : items;
            s.originalQueue = items;
          });
          setInLocalStorage('queue', get().originalQueue.slice(0, 15));
          const media =
            queuePointer > -1 ? mediaItems[queuePointer] : queue.getCurrent();
          if (media) {
            return get().cue(media);
          }
        },
        appendToQueue: (mediaItems, afterCuedMedia = true) => {
          const shuffledNewItems = get().shuffling
            ? shuffleArray([...mediaItems])
            : [...mediaItems];
          const index = afterCuedMedia ? queue.getPointer() : 0;
          set(s => {
            s.shuffledQueue = prependToArrayAtIndex(
              s.shuffledQueue,
              shuffledNewItems,
              index
            );
            s.originalQueue = prependToArrayAtIndex(
              s.originalQueue,
              mediaItems,
              index
            );
          });
          setInLocalStorage('queue', get().originalQueue.slice(0, 15));
        },
        removeFromQueue: mediaItems => {
          set(s => {
            s.shuffledQueue = s.shuffledQueue.filter(
              item => !mediaItems.find(m => isSameMedia(m, item))
            );
            s.originalQueue = s.originalQueue.filter(
              item => !mediaItems.find(m => isSameMedia(m, item))
            );
          });
          setInLocalStorage('queue', get().originalQueue.slice(0, 15));
        },
        isFullscreen: false,
        enterFullscreen: () => {
          get().provider?.enterFullscreen();
        },
        exitFullscreen: () => {
          fscreen.exitFullscreen();
        },
        destroy: () => {
          get().provider?.destroy();
          options?.onDestroy?.();
          resetMediaSession();
          listeners.clear();
          document.removeEventListener('keydown', keybindsHandler);
        },
        init: async () => {
          const mediaToCue = initialData.queue?.find(
            media => media.id === initialData.cuedMediaId
          );
          if (mediaToCue) {
            await get().cue(mediaToCue);
          }
          initPlayerMediaSession(get, options);
          document.addEventListener('keydown', keybindsHandler);
        },
      };
    })
  );
};
