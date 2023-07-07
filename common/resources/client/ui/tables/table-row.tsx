import React, {
  ComponentPropsWithoutRef,
  HTMLAttributes,
  JSXElementConstructor,
  KeyboardEventHandler,
  MouseEventHandler,
  useContext,
  useRef,
  useState,
} from 'react';
import {rowStyle} from './table-style';
import {TableContext} from './table-context';
import {CheckboxCell} from './checkbox-cell';
import {TableCell} from './table-cell';
import {TableDataItem} from './types/table-data-item';
import {createEventHandler} from '../../utils/dom/create-event-handler';
import {usePointerEvents} from '../interactions/use-pointer-events';
import {isCtrlOrShiftPressed} from '../../utils/keybinds/is-ctrl-or-shift-pressed';
import {useIsDarkMode} from '@common/ui/themes/use-is-dark-mode';

const interactableElements = ['button', 'a', 'input', 'select', 'textarea'];

export interface RowElementProps<T = TableDataItem>
  extends ComponentPropsWithoutRef<'tr'> {
  item: T & {isPlaceholder?: boolean};
}

interface TableRowProps {
  item: TableDataItem;
  index: number;
  renderAs?: JSXElementConstructor<RowElementProps>;
  hideBorder?: boolean;
}
export function TableRow({item, index, renderAs, hideBorder}: TableRowProps) {
  const {
    selectedRows,
    columns,
    toggleRow,
    selectRow,
    onAction,
    selectRowOnContextMenu,
    enableSelection,
    selectionStyle,
  } = useContext(TableContext);

  const isTouchDevice = useRef(false);
  const isDarkMode = useIsDarkMode();
  const isRowSelected = selectedRows.includes(item.id);
  const [isHovered, setIsHovered] = useState(false);

  const clickedOnInteractable = (e: React.MouseEvent | PointerEvent) => {
    return (e.target as HTMLElement).closest(interactableElements.join(','));
  };

  const doubleClickHandler: MouseEventHandler<HTMLDivElement> = e => {
    if (
      selectionStyle === 'highlight' &&
      onAction &&
      !isTouchDevice.current &&
      !clickedOnInteractable(e)
    ) {
      e.preventDefault();
      e.stopPropagation();
      onAction(item, index);
    }
  };

  const anyRowsSelected = !!selectedRows.length;

  const handleRowTap = (e: PointerEvent) => {
    if (clickedOnInteractable(e)) return;
    if (selectionStyle == 'checkbox') {
      if (enableSelection && (anyRowsSelected || !onAction)) {
        toggleRow(item);
      } else if (onAction) {
        onAction(item, index);
      }
    } else if (selectionStyle === 'highlight') {
      if (isTouchDevice.current) {
        if (enableSelection && anyRowsSelected) {
          toggleRow(item);
        } else {
          onAction?.(item, index);
        }
      } else if (enableSelection) {
        selectRow(item, isCtrlOrShiftPressed(e));
      }
    }
  };

  const {domProps} = usePointerEvents({
    onPointerDown: e => {
      isTouchDevice.current = e.pointerType === 'touch';
    },
    onPress: handleRowTap,
    onLongPress: enableSelection
      ? () => {
          if (isTouchDevice.current) {
            toggleRow(item);
          }
        }
      : undefined,
  });

  const keyboardHandler: KeyboardEventHandler = e => {
    if (enableSelection && e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (selectionStyle === 'checkbox') {
        toggleRow(item);
      } else {
        selectRow(item);
      }
    } else if (e.key === 'Enter' && !selectedRows.length && onAction) {
      e.preventDefault();
      e.stopPropagation();
      onAction(item, index);
    }
  };

  const contextMenuHandler: MouseEventHandler = e => {
    if (selectRowOnContextMenu) {
      if (!selectedRows.includes(item.id)) {
        selectRow(item);
      }
    }
    // prevent context menu on mobile
    if (isTouchDevice.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const tableRowProps: HTMLAttributes<HTMLDivElement> = {
    'aria-selected': isRowSelected,
    className: rowStyle({
      isSelected: isRowSelected,
      enableSelection,
      isFirst: index === 0,
      isDarkMode,
      hideBorder,
    }),
    onDoubleClick: createEventHandler(doubleClickHandler),
    onKeyDown: createEventHandler(keyboardHandler),
    onContextMenu: createEventHandler(contextMenuHandler),
    onPointerEnter: createEventHandler(() => setIsHovered(true)),
    onPointerLeave: createEventHandler(() => setIsHovered(false)),
    ...domProps,
  };

  const RowElement = renderAs || 'tr';

  return (
    <RowElement
      item={RowElement === 'tr' ? (undefined as any) : item}
      {...tableRowProps}
    >
      <CheckboxCell item={item} />
      {columns.map((column, cellIndex) => (
        <TableCell
          rowIndex={index}
          rowIsHovered={isHovered}
          index={cellIndex}
          item={item}
          key={`${item.id}-${column.key}`}
        />
      ))}
    </RowElement>
  );
}
