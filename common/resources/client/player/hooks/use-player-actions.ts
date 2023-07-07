import {useContext, useMemo} from 'react';
import {PlayerStoreContext} from '@common/player/player-context';
import {MediaItem} from '@common/player/media-item';

export function usePlayerActions() {
  const store = useContext(PlayerStoreContext);

  return useMemo(() => {
    const s = store.getState();

    const overrideQueueAndPlay = async (
      mediaItems: MediaItem[],
      queuePointer?: number
    ) => {
      s.stop();
      await s.overrideQueue(mediaItems, queuePointer);
      return s.play();
    };

    return {
      play: s.play,
      playNext: s.playNext,
      playPrevious: s.playPrevious,
      pause: s.pause,
      subscribe: s.subscribe,
      getCurrentTime: s.getCurrentTime,
      seek: s.seek,
      toggleRepeatMode: s.toggleRepeatMode,
      toggleShuffling: s.toggleShuffling,
      getState: store.getState,
      setVolume: s.setVolume,
      setMuted: s.setMuted,
      appendToQueue: s.appendToQueue,
      removeFromQueue: s.removeFromQueue,
      enterFullscreen: s.enterFullscreen,
      exitFullscreen: s.exitFullscreen,
      cue: s.cue,
      overrideQueueAndPlay,
    };
  }, [store]);
}
