import {useContext} from 'react';
import {TableContext} from './table-context';
import {cellStyle} from './table-style';
import {Checkbox} from '../forms/toggle/checkbox';
import {TableDataItem} from './types/table-data-item';
import {useIsMobileMediaQuery} from '../../utils/hooks/is-mobile-media-query';

interface CheckboxCellProps {
  item: TableDataItem;
}
export function CheckboxCell({item}: CheckboxCellProps) {
  const isMobile = useIsMobileMediaQuery();
  const {selectedRows, enableSelection, toggleRow, selectionStyle} =
    useContext(TableContext);

  if (!enableSelection || selectionStyle === 'highlight' || isMobile)
    return null;

  return (
    <td
      className={cellStyle({
        isFirst: true,
        width: 'w-64 flex-shrink-0 flex-grow-0',
      })}
    >
      <Checkbox
        checked={selectedRows.includes(item.id)}
        onChange={() => {
          toggleRow(item);
        }}
      />
    </td>
  );
}
