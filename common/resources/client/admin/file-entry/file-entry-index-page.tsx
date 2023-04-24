import React from 'react';
import {DataTablePage} from '../../datatable/page/data-table-page';
import {IconButton} from '../../ui/buttons/icon-button';
import {FormattedDate} from '../../i18n/formatted-date';
import {ColumnConfig} from '../../datatable/column-config';
import {Trans} from '../../i18n/trans';
import {DeleteSelectedItemsAction} from '../../datatable/page/delete-selected-items-action';
import {DataTableEmptyStateMessage} from '../../datatable/page/data-table-emty-state-message';
import {DialogTrigger} from '../../ui/overlays/dialog/dialog-trigger';
import {FileEntry} from '../../uploads/file-entry';
import {NameWithAvatar} from '../../datatable/column-templates/name-with-avatar';
import {User} from '../../auth/user';
import {CheckIcon} from '../../icons/material/Check';
import {CloseIcon} from '../../icons/material/Close';
import {FormattedBytes} from '../../uploads/formatted-bytes';
import {VisibilityIcon} from '../../icons/material/Visibility';
import uploadSvg from './upload.svg';
import {FilePreviewDialog} from '../../uploads/preview/file-preview-dialog';
import {FILE_ENTRY_INDEX_FILTERS} from './file-entry-index-filters';
import {FileTypeIcon} from '../../uploads/file-type-icon/file-type-icon';

const columnConfig: ColumnConfig<FileEntry>[] = [
  {
    key: 'name',
    allowsSorting: true,
    header: () => <Trans message="Name" />,
    body: entry => (
      <div>
        <div>{entry.name}</div>
        <div className="text-muted text-xs">{entry.file_name}</div>
      </div>
    ),
  },
  {
    key: 'owner_id',
    allowsSorting: true,
    header: () => <Trans message="Uploader" />,
    body: entry => {
      const user = entry.users?.[0] as User;
      if (!user) return null;
      return (
        <NameWithAvatar
          image={user.avatar}
          label={user.display_name}
          description={user.email}
        />
      );
    },
  },
  {
    key: 'type',
    allowsSorting: true,
    header: () => <Trans message="Type" />,
    body: entry => (
      <div className="flex items-center gap-12">
        <FileTypeIcon type={entry.type} className="w-24 h-24 overflow-hidden" />
        <div className="capitalize">{entry.type}</div>
      </div>
    ),
  },
  {
    key: 'public',
    allowsSorting: true,
    width: 'w-1',
    header: () => <Trans message="Public" />,
    body: entry =>
      entry.public ? (
        <CheckIcon className="icon-md text-positive" />
      ) : (
        <CloseIcon className="icon-md text-danger" />
      ),
  },
  {
    key: 'file_size',
    allowsSorting: true,
    width: 'w-1',
    header: () => <Trans message="File size" />,
    body: entry => <FormattedBytes bytes={entry.file_size} />,
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    width: 'w-1',
    header: () => <Trans message="Last updated" />,
    body: entry => <FormattedDate date={entry.updated_at} />,
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    width: 'w-1',
    hideHeader: true,
    align: 'end',
    body: entry => {
      return (
        <DialogTrigger type="modal">
          <IconButton size="md" className="text-muted">
            <VisibilityIcon />
          </IconButton>
          <FilePreviewDialog entries={[entry]} />
        </DialogTrigger>
      );
    },
  },
];

export function FileEntryIndexPage() {
  return (
    <DataTablePage
      endpoint="file-entries"
      title={<Trans message="Uploaded files and folders" />}
      columns={columnConfig}
      filters={FILE_ENTRY_INDEX_FILTERS}
      selectedActions={<DeleteSelectedItemsAction />}
      emptyStateMessage={
        <DataTableEmptyStateMessage
          image={uploadSvg}
          title={<Trans message="Nothing has been uploaded yet" />}
          filteringTitle={<Trans message="No matching files or folders" />}
        />
      }
    />
  );
}
