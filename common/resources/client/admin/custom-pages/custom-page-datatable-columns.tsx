import {ColumnConfig} from '@common/datatable/column-config';
import {CustomPage} from '@common/admin/custom-pages/custom-page';
import {Trans} from '@common/i18n/trans';
import {Link} from 'react-router-dom';
import {LinkStyle} from '@common/ui/buttons/external-link';
import {NameWithAvatar} from '@common/datatable/column-templates/name-with-avatar';
import {FormattedDate} from '@common/i18n/formatted-date';
import React from 'react';
import {IconButton} from '@common/ui/buttons/icon-button';
import {EditIcon} from '@common/icons/material/Edit';

export const CustomPageDatatableColumns: ColumnConfig<CustomPage>[] = [
  {
    key: 'slug',
    allowsSorting: true,
    header: () => <Trans message="Slug" />,
    body: page => (
      <Link target="_blank" to={`/pages/${page.slug}`} className={LinkStyle}>
        {page.slug}
      </Link>
    ),
  },
  {
    key: 'user_id',
    allowsSorting: true,
    header: () => <Trans message="Owner" />,
    body: page =>
      page.user && (
        <NameWithAvatar
          image={page.user.avatar}
          label={page.user.display_name}
          description={page.user.email}
        />
      ),
  },
  {
    key: 'type',
    header: () => <Trans message="Type" />,
    body: page => <Trans message={page.type} />,
    width: 'w-1',
  },
  {
    key: 'updated_at',
    allowsSorting: true,
    header: () => <Trans message="Last updated" />,
    body: page => <FormattedDate date={page.updated_at} />,
    width: 'w-1',
  },
  {
    key: 'actions',
    header: () => <Trans message="Actions" />,
    hideHeader: true,
    align: 'end',
    width: 'w-1',
    body: page => (
      <IconButton
        size="md"
        className="text-muted"
        elementType={Link}
        to={`${page.id}/edit`}
      >
        <EditIcon />
      </IconButton>
    ),
  },
];
