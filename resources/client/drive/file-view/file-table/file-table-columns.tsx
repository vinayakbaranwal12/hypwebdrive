import {ColumnConfig} from '@common/datatable/column-config';
import {DriveEntry} from '../../files/drive-entry';
import {Trans} from '@common/i18n/trans';
import {FileThumbnail} from '@common/uploads/file-type-icon/file-thumbnail';
import {FormattedDate} from '@common/i18n/formatted-date';
import {prettyBytes} from '@common/uploads/utils/pretty-bytes';
import React from 'react';
import memoize from 'nano-memoize';

const formatFileSize = memoize(bytes => {
  return prettyBytes(bytes);
});

export const fileTableColumns: ColumnConfig<DriveEntry>[] = [
  {
    key: 'name',
    allowsSorting: true,
    header: () => <Trans message="Name" />,
    body: entry => (
      <div className="flex items-center gap-14">
        <div>
          <FileThumbnail
            className="w-24 h-24 rounded"
            iconClassName="w-24 h-24"
            file={entry}
          />
        </div>
        <div className="overflow-hidden overflow-ellipsis">{entry.name}</div>
      </div>
    ),
    width: 'w-5/6 max-w-1',
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    header: () => <Trans message="Last modified" />,
    body: user => <FormattedDate date={user.updated_at} />,
  },
  {
    key: 'file_size',
    allowsSorting: true,
    header: () => <Trans message="Size" />,
    body: entry => formatFileSize(entry.file_size) ?? '-',
  },
];
