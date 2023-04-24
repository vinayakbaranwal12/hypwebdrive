import {ColumnConfig} from '@common/datatable/column-config';
import {DriveEntry} from '../../files/drive-entry';
import {Trans} from '@common/i18n/trans';
import {FileThumbnail} from '@common/uploads/file-type-icon/file-thumbnail';
import {FormattedDate} from '@common/i18n/formatted-date';
import {prettyBytes} from '@common/uploads/utils/pretty-bytes';
import {Checkbox} from '@common/ui/forms/toggle/checkbox';
import {EntryActionMenuTrigger} from '../../entry-actions/entry-action-menu-trigger';
import {IconButton} from '@common/ui/buttons/icon-button';
import {MoreVertIcon} from '@common/icons/material/MoreVert';
import React, {useContext} from 'react';
import memoize from 'nano-memoize';
import {TableContext} from '@common/ui/tables/table-context';

const formatFileSize = memoize(bytes => {
  return prettyBytes(bytes);
});

export const fileTableMobileColumns: ColumnConfig<DriveEntry>[] = [
  {
    key: 'name',
    allowsSorting: true,
    hideHeader: true,
    header: () => <Trans message="User" />,
    body: entry => (
      <div className="flex items-center gap-14">
        <FileThumbnail
          className="w-30 h-30 rounded"
          iconClassName="w-28 h-28"
          file={entry}
        />
        <div>
          <div>{entry.name}</div>
          <div className="text-muted text-xs flex items-center mt-4">
            <FormattedDate date={entry.updated_at} />
            <div>·</div>
            <div>{formatFileSize(entry.file_size)}</div>
          </div>
        </div>
      </div>
    ),
    width: 'col-w-3',
  },
  {
    key: 'actions',
    hideHeader: true,
    header: () => <Trans message="Actions" />,
    align: 'end',
    padding: 'pl-12 pr-4',
    body: entry => <ActionsBody entry={entry} />,
  },
];

interface ActionsBodyProps {
  entry: DriveEntry;
}
function ActionsBody({entry}: ActionsBodyProps) {
  const {selectedRows} = useContext(TableContext);
  return selectedRows.length ? (
    <Checkbox
      className="block mr-8"
      checked={selectedRows.includes(entry.id)}
    />
  ) : (
    <EntryActionMenuTrigger entries={[entry]}>
      <IconButton className="text-muted">
        <MoreVertIcon />
      </IconButton>
    </EntryActionMenuTrigger>
  );
}
