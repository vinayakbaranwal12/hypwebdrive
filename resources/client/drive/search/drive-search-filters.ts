import {
  BackendFilter,
  FilterControlType,
  FilterOperator,
} from '@common/datatable/filters/backend-filter';
import {FILE_ENTRY_TYPE_FILTER} from '@common/admin/file-entry/file-entry-index-filters';
import {
  CreatedAtFilter,
  UpdatedAtFilter,
} from '@common/datatable/filters/timestamp-filters';
import {message} from '@common/i18n/message';

export const driveSearchFilters: BackendFilter[] = [
  FILE_ENTRY_TYPE_FILTER,
  new BackendFilter({
    type: FilterControlType.Select,
    key: 'owner_id',
    label: message('Owner'),
    description: message('User file was uploaded by'),
    defaultValue: '02',
    options: [
      {
        key: '01',
        label: message('anyone'),
        value: {value: null, operator: '!='},
      },
      {
        key: '02',
        label: message('me'),
        value: '{authId}',
      },
      {
        key: '03',
        label: message('not me'),
        value: {value: '{authId}', operator: '!='},
      },
    ],
  }),
  new CreatedAtFilter({
    description: message('Date file was uploaded'),
  }),
  new UpdatedAtFilter({
    description: message('Date file was last changed'),
  }),
  new BackendFilter({
    type: FilterControlType.BooleanToggle,
    key: 'deleted_at',
    label: message('In trash'),
    description: message('Only show files that are in the trash'),
    defaultOperator: FilterOperator.ne,
    defaultValue: null,
  }),
  new BackendFilter({
    type: FilterControlType.BooleanToggle,
    key: 'shareableLink',
    label: message('Has shareable link'),
    description: message('Only show files that have a shareable link'),
    defaultValue: '*',
    defaultOperator: FilterOperator.has,
  }),
  new BackendFilter({
    type: FilterControlType.BooleanToggle,
    key: 'sharedByMe',
    label: message('Shared by me'),
    description: message('Only show files that are shared with someone'),
    defaultValue: true,
  }),
];
