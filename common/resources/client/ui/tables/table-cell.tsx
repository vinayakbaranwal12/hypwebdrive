import {useContext, useMemo} from 'react';
import {cellStyle} from './table-style';
import {TableContext} from './table-context';
import {TableDataItem} from './types/table-data-item';
import {RowContext} from '@common/datatable/column-config';

interface TableCellProps {
  rowIsHovered: boolean;
  rowIndex: number;
  index: number;
  item: TableDataItem;
  id?: string;
}
export function TableCell({
  rowIndex,
  rowIsHovered,
  index,
  item,
  id,
}: TableCellProps) {
  const {enableSelection, columns} = useContext(TableContext);
  const isFirst = enableSelection ? false : index === 0;
  const isLast = index === columns.length - 1;
  const column = columns[index];

  const rowContext: RowContext = useMemo(() => {
    return {
      index: rowIndex,
      isHovered: rowIsHovered,
      isPlaceholder: item.isPlaceholder,
    };
  }, [rowIndex, rowIsHovered, item.isPlaceholder]);

  return (
    <td
      id={id}
      tabIndex={-1}
      data-testid={`col-${column.key}`}
      className={cellStyle({isFirst, isLast, column})}
    >
      {column.body(item, rowContext)}
    </td>
  );
}
