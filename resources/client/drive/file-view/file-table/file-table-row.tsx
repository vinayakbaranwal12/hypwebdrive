import {DriveEntry} from '../../files/drive-entry';
import {RowElementProps} from '@common/ui/tables/table-row';
import {mergeProps} from '@react-aria/utils';
import {useFileViewDnd} from '../use-file-view-dnd';
import clsx from 'clsx';
import React, {useContext} from 'react';
import {DashboardLayoutContext} from '@common/ui/layout/dashboard-layout-context';
import {driveState} from '../../drive-store';

export function FileTableRow({
  item,
  children,
  className,
  ...domProps
}: RowElementProps<DriveEntry>) {
  const {isMobileMode} = useContext(DashboardLayoutContext);
  const {draggableProps, droppableProps, itemClassName, ref} =
    useFileViewDnd<HTMLTableRowElement>(item);

  return (
    <tr
      className={clsx(className, itemClassName, isMobileMode ? 'h-64' : null)}
      ref={ref}
      {...mergeProps(draggableProps, droppableProps, domProps, {
        onContextMenu: (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          if (!isMobileMode) {
            if (!driveState().selectedEntries.has(item.id)) {
              driveState().selectEntries([item.id]);
            }
            driveState().setContextMenuData({x: e.clientX, y: e.clientY});
          }
        },
      })}
    >
      {children}
    </tr>
  );
}
