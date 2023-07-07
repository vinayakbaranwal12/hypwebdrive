import React, {useContext} from 'react';
import {FileEntry} from '../file-entry';
import {useSettings} from '../../core/settings/use-settings';

export function useFileEntryUrls(
  entry?: FileEntry,
  options?: {thumbnail?: boolean; downloadHashes?: string[]}
): {previewUrl?: string; downloadUrl?: string} {
  const {base_url} = useSettings();
  const urlSearchParams = useContext(FileEntryUrlsContext);

  if (!entry) {
    return {};
  }

  const urls = {
    previewUrl: entry.url, // either relative or absolute
    downloadUrl: `${base_url}/api/v1/file-entries/download/${
      options?.downloadHashes || entry.hash
    }`,
  };

  if (urlSearchParams) {
    // preview url
    urls.previewUrl = addParams(
      urls.previewUrl,
      {...urlSearchParams, thumbnail: options?.thumbnail ? 'true' : ''},
      base_url
    );

    // download url
    urls.downloadUrl = addParams(urls.downloadUrl, urlSearchParams, base_url);
  }

  return urls;
}

export const FileEntryUrlsContext = React.createContext<
  Record<string, string | number | null | undefined>
>(null!);

function addParams(urlString: string, params: object, baseUrl: string): string {
  const url = new URL(urlString, baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value as string);
  });
  return url.toString();
}
