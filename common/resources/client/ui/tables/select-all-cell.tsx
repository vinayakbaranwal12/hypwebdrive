import {useContext} from 'react';
import {TableContext} from './table-context';
import {cellStyle} from './table-style';
import {Checkbox} from '../forms/toggle/checkbox';
import {useTrans} from '../../i18n/use-trans';
import {useIsMobileMediaQuery} from '../../utils/hooks/is-mobile-media-query';

export function SelectAllCell() {
  const isMobile = useIsMobileMediaQuery();
  const {trans} = useTrans();
  const {
    data,
    selectedRows,
    onSelectionChange,
    enableSelection,
    selectionStyle,
  } = useContext(TableContext);

  if (!enableSelection || selectionStyle === 'highlight' || isMobile)
    return null;

  const allRowsSelected = !!data.length && data.length === selectedRows.length;
  const someRowsSelected = !allRowsSelected && !!selectedRows.length;

  return (
    <th
      aria-colindex={1}
      className={cellStyle({
        width: 'w-64 flex-shrink-0 flex-grow-0',
        isFirst: true,
      })}
    >
      <Checkbox
        aria-label={trans({message: 'Select all'})}
        inputTestId="select-all-checkbox"
        isIndeterminate={someRowsSelected}
        checked={allRowsSelected}
        onChange={() => {
          if (allRowsSelected) {
            onSelectionChange([]);
          } else {
            onSelectionChange(data.map(d => d.id));
          }
        }}
      />
    </th>
  );
}
