import clsx from 'clsx';
import type {ColumnConfig} from '../../datatable/column-config';

interface CellStyleProps {
  isFirst?: boolean;
  isLast?: boolean;
  width?: string;
  isRowHeader?: boolean;
  column?: ColumnConfig<any>;
}
export function cellStyle({
  isFirst,
  isLast,
  isRowHeader,
  width,
  column,
}: CellStyleProps = {}): string {
  const finalWidth = column?.width || width || '';
  const userPadding = column?.padding;

  let justify = 'text-left';
  if (column?.align === 'center') {
    justify = 'text-center';
  } else if (column?.align === 'end') {
    justify = 'text-right';
  }

  return clsx(
    'overflow-hidden whitespace-nowrap overflow-ellipsis h-48 outline-none focus-visible:outline focus-visible:outline-offset-2',
    justify,
    !userPadding && isFirst && 'pl-24 pr-16',
    !userPadding && isLast && 'pr-24 pl-16',
    !isFirst && !isLast && !userPadding && 'px-16',
    userPadding,
    finalWidth,
    column?.className
  );
}

interface RowStyleProps {
  isHeader?: boolean;
  isSelected?: boolean;
  enableSelection?: boolean;
  isFirst?: boolean;
  isDarkMode?: boolean;
  hideBorder?: boolean;
}
export function rowStyle({
  isHeader,
  isSelected,
  enableSelection,
  isFirst,
  isDarkMode,
  hideBorder,
}: RowStyleProps = {}): string {
  return clsx(
    'break-inside-avoid outline-none',
    !isHeader && !hideBorder && 'border-b',
    // put border on the first row, instead of the header, so it's easier to style
    // row border color via :has selector when sorting rows via drag and drop
    !isHeader && isFirst && !hideBorder && 'border-t',
    isSelected &&
      !isDarkMode &&
      'bg-primary/selected hover:bg-primary/focus focus-visible:bg-primary/focus',
    isSelected &&
      isDarkMode &&
      'bg-selected hover:bg-focus focus-visible:bg-focus',
    !isSelected &&
      !isHeader &&
      enableSelection &&
      'focus-visible:bg-focus hover:bg-hover'
  );
}
