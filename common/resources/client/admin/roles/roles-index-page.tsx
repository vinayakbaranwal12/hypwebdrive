import React, {Fragment} from 'react';
import {Link} from 'react-router-dom';
import {DataTablePage} from '../../datatable/page/data-table-page';
import {IconButton} from '../../ui/buttons/icon-button';
import {EditIcon} from '../../icons/material/Edit';
import {FormattedDate} from '../../i18n/formatted-date';
import {ColumnConfig} from '../../datatable/column-config';
import {Trans} from '../../i18n/trans';
import {Role} from '../../auth/role';
import teamSvg from './team.svg';
import {DeleteSelectedItemsAction} from '../../datatable/page/delete-selected-items-action';
import {DataTableEmptyStateMessage} from '../../datatable/page/data-table-emty-state-message';
import {RoleIndexPageFilters} from './role-index-page-filters';
import {DataTableExportCsvButton} from '../../datatable/csv-export/data-table-export-csv-button';
import {DataTableAddItemButton} from '../../datatable/data-table-add-item-button';

const columnConfig: ColumnConfig<Role>[] = [
  {
    key: 'name',
    allowsSorting: true,
    header: () => <Trans message="Role" />,
    body: role => (
      <div>
        <div>{role.name}</div>
        <div className="text-muted text-xs">{role.description}</div>
      </div>
    ),
  },
  {
    key: 'type',
    allowsSorting: true,
    header: () => <Trans message="Type" />,
    body: role => role.type,
    width: 'w-1',
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    header: () => <Trans message="Last updated" />,
    body: role => <FormattedDate date={role.updated_at} />,
    width: 'w-1',
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    body: role => {
      return (
        <Link to={`${role.id}/edit`}>
          <IconButton size="md" className="text-muted">
            <EditIcon />
          </IconButton>
        </Link>
      );
    },
  },
];

export function RolesIndexPage() {
  return (
    <DataTablePage
      endpoint="roles"
      title={<Trans message="Roles" />}
      columns={columnConfig}
      filters={RoleIndexPageFilters}
      actions={<Actions />}
      selectedActions={<DeleteSelectedItemsAction />}
      emptyStateMessage={
        <DataTableEmptyStateMessage
          image={teamSvg}
          title={<Trans message="No roles have been created yet" />}
          filteringTitle={<Trans message="No matching roles" />}
        />
      }
    />
  );
}

function Actions() {
  return (
    <Fragment>
      <DataTableExportCsvButton endpoint="roles/csv/export" />
      <DataTableAddItemButton elementType={Link} to="new">
        <Trans message="Add new role" />
      </DataTableAddItemButton>
    </Fragment>
  );
}
