import React, {
  cloneElement,
  ComponentPropsWithoutRef,
  JSXElementConstructor,
  MutableRefObject,
  ReactElement,
  useCallback,
  useContext,
  useMemo,
} from 'react';
import {useControlledState} from '@react-stately/utils';
import {rowStyle} from './table-style';
import {SortDescriptor} from './types/sort-descriptor';
import {useGridNavigation} from './navigate-grid';
import {RowElementProps, TableRow} from './table-row';
import {
  TableContext,
  TableContextValue,
  TableSelectionStyle,
} from './table-context';
import {HeaderCell} from './header-cell';
import {SelectAllCell} from './select-all-cell';
import {ColumnConfig} from '../../datatable/column-config';
import {TableDataItem} from './types/table-data-item';
import clsx from 'clsx';
import {useInteractOutside} from '@react-aria/interactions';
import {mergeProps, useObjectRef} from '@react-aria/utils';
import {isCtrlKeyPressed} from '@common/utils/keybinds/is-ctrl-key-pressed';

export interface TableProps<T extends TableDataItem>
  extends ComponentPropsWithoutRef<'table'> {
  className?: string;
  columns: ColumnConfig<T>[];
  hideHeaderRow?: boolean;
  data: T[];
  meta?: any;
  tableRef?: MutableRefObject<HTMLTableElement>;
  selectedRows?: (number | string)[];
  defaultSelectedRows?: (number | string)[];
  onSelectionChange?: (keys: (number | string)[]) => void;
  sortDescriptor?: SortDescriptor;
  onSortChange?: (descriptor: SortDescriptor) => any;
  enableSorting?: boolean;
  onDelete?: (items: T[]) => void;
  enableSelection?: boolean;
  selectionStyle?: TableSelectionStyle;
  ariaLabelledBy?: string;
  onAction?: (item: T, index: number) => void;
  selectRowOnContextMenu?: boolean;
  renderRowAs?: JSXElementConstructor<RowElementProps<T>>;
  tableBody?: ReactElement<TableBodyProps>;
  hideBorder?: boolean;
  closeOnInteractOutside?: boolean;
}
export function Table<T extends TableDataItem>({
  className,
  columns,
  hideHeaderRow,
  data,
  selectedRows: propsSelectedRows,
  defaultSelectedRows: propsDefaultSelectedRows,
  onSelectionChange: propsOnSelectionChange,
  sortDescriptor: propsSortDescriptor,
  onSortChange: propsOnSortChange,
  enableSorting = true,
  onDelete,
  enableSelection = true,
  selectionStyle = 'checkbox',
  ariaLabelledBy,
  selectRowOnContextMenu,
  onAction,
  renderRowAs,
  tableBody,
  meta,
  tableRef: propsTableRef,
  hideBorder = false,
  closeOnInteractOutside = false,
  ...domProps
}: TableProps<T>) {
  const [selectedRows, onSelectionChange] = useControlledState(
    propsSelectedRows,
    propsDefaultSelectedRows || [],
    propsOnSelectionChange
  );

  const [sortDescriptor, onSortChange] = useControlledState(
    propsSortDescriptor,
    undefined,
    propsOnSortChange
  );

  const toggleRow = useCallback(
    (item: TableDataItem) => {
      const newValues = [...selectedRows];
      if (!newValues.includes(item.id)) {
        newValues.push(item.id);
      } else {
        const index = newValues.indexOf(item.id);
        newValues.splice(index, 1);
      }
      onSelectionChange(newValues);
    },
    [selectedRows, onSelectionChange]
  );

  const selectRow = useCallback(
    // allow deselecting all rows by passing in null
    (item: TableDataItem | null, merge?: boolean) => {
      let newValues: (string | number)[] = [];
      if (item) {
        newValues = merge
          ? [...selectedRows?.filter(id => id !== item.id), item.id]
          : [item.id];
      }
      onSelectionChange(newValues);
    },
    [selectedRows, onSelectionChange]
  );

  const contextValue: TableContextValue<T> = useMemo(() => {
    return {
      selectedRows,
      onSelectionChange,
      enableSorting,
      enableSelection,
      selectionStyle,
      data,
      columns,
      sortDescriptor,
      onSortChange,
      toggleRow,
      selectRow,
      onAction,
      selectRowOnContextMenu,
      meta,
    };
  }, [
    columns,
    data,
    enableSelection,
    enableSorting,
    selectionStyle,
    onAction,
    selectRowOnContextMenu,
    onSelectionChange,
    onSortChange,
    selectedRows,
    sortDescriptor,
    toggleRow,
    selectRow,
    meta,
  ]);

  const navProps = useGridNavigation({
    cellCount: enableSelection ? columns.length + 1 : columns.length,
    rowCount: data.length + 1,
  });

  const headerRow = hideHeaderRow ? null : (
    <thead>
      <tr aria-rowindex={1} className={rowStyle({isHeader: true})}>
        <SelectAllCell />
        {columns.map((column, columnIndex) => (
          <HeaderCell index={columnIndex} key={column.key} />
        ))}
      </tr>
    </thead>
  );

  const rowRenderer = renderRowAs as any;
  if (!tableBody) {
    tableBody = (
      <BasicTableBody renderRowAs={rowRenderer} hideBorder={hideBorder} />
    );
  } else {
    tableBody = cloneElement(tableBody, {renderRowAs: rowRenderer, hideBorder});
  }

  // deselect rows when clicking outside the table
  const tableRef = useObjectRef(propsTableRef);
  useInteractOutside({
    ref: tableRef,
    onInteractOutside: e => {
      if (
        closeOnInteractOutside &&
        enableSelection &&
        selectedRows?.length &&
        // don't deselect if clicking on a dialog (for example is table row has a context menu)
        !(e.target as HTMLElement).closest('[role="dialog"]')
      ) {
        onSelectionChange([]);
      }
    },
  });

  return (
    <TableContext.Provider value={contextValue as any}>
      <table
        {...mergeProps(domProps, navProps, {
          onKeyDown: (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              if (selectedRows?.length) {
                onSelectionChange([]);
              }
            } else if (e.key === 'Delete') {
              e.preventDefault();
              e.stopPropagation();
              if (selectedRows?.length) {
                onDelete?.(
                  data.filter(item => selectedRows?.includes(item.id))
                );
              }
            } else if (isCtrlKeyPressed(e) && e.key === 'a') {
              e.preventDefault();
              e.stopPropagation();
              if (enableSelection) {
                onSelectionChange(data.map(item => item.id));
              }
            }
          },
        })}
        ref={tableRef}
        aria-multiselectable={enableSelection ? true : undefined}
        aria-labelledby={ariaLabelledBy}
        className={clsx(
          className,
          'select-none isolate outline-none text-sm w-full max-w-full align-top'
        )}
      >
        {headerRow}
        {tableBody}
      </table>
    </TableContext.Provider>
  );
}

export interface TableBodyProps {
  renderRowAs?: TableProps<TableDataItem>['renderRowAs'];
  hideBorder?: boolean;
}
function BasicTableBody({renderRowAs, hideBorder}: TableBodyProps) {
  const {data} = useContext(TableContext);
  return (
    <tbody>
      {data.map((item, rowIndex) => (
        <TableRow
          item={item}
          index={rowIndex}
          key={item.id}
          renderAs={renderRowAs}
          hideBorder={hideBorder}
        />
      ))}
    </tbody>
  );
}
