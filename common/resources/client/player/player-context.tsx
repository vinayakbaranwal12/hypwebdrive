import {createContext, ReactNode, useState} from 'react';
import {StoreApi} from 'zustand';
import {createPlayerStore} from '@common/player/player-store';
import {PlayerStoreOptions} from '@common/player/player-store-options';
import {PlayerState} from '@common/player/player-state';

export const PlayerStoreContext = createContext<StoreApi<PlayerState>>(null!);

interface PlayerContextProps {
  children: ReactNode;
  id: string | number;
  options: PlayerStoreOptions;
}
export function PlayerContext({children, id, options}: PlayerContextProps) {
  //lazily create store object only once
  const [store] = useState(() => {
    return createPlayerStore(id, options);
  });

  return (
    <PlayerStoreContext.Provider value={store as StoreApi<PlayerState>}>
      {children}
    </PlayerStoreContext.Provider>
  );
}
