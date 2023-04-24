interface BaseMediaItem<T = any> {
  id: string | number;
  groupId?: string | number;
  provider: 'youtube' | 'htmlAudio' | 'htmlVideo';
  meta: T;
  // in seconds. Will be set by provider, but that might have a delay depending on provider.
  duration?: number;
}

export interface YoutubeMediaItem<T = any> extends BaseMediaItem<T> {
  provider: 'youtube';
  src?: 'resolve' | string;
}

export interface HtmlAudioMediaItem<T = any> extends BaseMediaItem<T> {
  provider: 'htmlAudio';
  src: string;
}

export interface HtmlVideoMediaItem<T = any> extends BaseMediaItem<T> {
  provider: 'htmlVideo';
  image?: string;
  src: string;
}

export type MediaItem<T = any> =
  | YoutubeMediaItem<T>
  | HtmlAudioMediaItem<T>
  | HtmlVideoMediaItem<T>;
