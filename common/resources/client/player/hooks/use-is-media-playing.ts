import {usePlayerStore} from '@common/player/hooks/use-player-store';

export function useIsMediaPlaying(
  mediaId: string | number,
  groupId?: string | number
): boolean {
  return usePlayerStore(s => {
    return (
      s.status === 'playing' &&
      s.cuedMedia?.id === mediaId &&
      (!groupId || groupId === s.cuedMedia.groupId)
    );
  });
}
