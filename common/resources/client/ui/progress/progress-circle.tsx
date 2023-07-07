import React, {ComponentPropsWithoutRef, CSSProperties} from 'react';
import clsx from 'clsx';
import {InputSize} from '../forms/input-field/input-size';
import {clamp} from '../../utils/number/clamp';
import {useNumberFormatter} from '../../i18n/use-number-formatter';

export interface ProgressCircleProps extends ComponentPropsWithoutRef<'div'> {
  value?: number;
  minValue?: number;
  maxValue?: number;
  size?: 'sm' | 'md' | 'lg';
  isIndeterminate?: boolean;
  className?: string;
}
export const ProgressCircle = React.forwardRef<
  HTMLDivElement,
  ProgressCircleProps
>((props, ref) => {
  let {
    value = 0,
    minValue = 0,
    maxValue = 100,
    size = 'md',
    isIndeterminate = false,
    className,
    ...domProps
  } = props;

  value = clamp(value, minValue, maxValue);
  const circleStyle = getCircleStyle(size);

  const percentage = (value - minValue) / (maxValue - minValue);
  const formatter = useNumberFormatter({style: 'percent'});

  let valueLabel = '';
  if (!isIndeterminate && !valueLabel) {
    valueLabel = formatter.format(percentage);
  }

  const subMask1Style: CSSProperties = {};
  const subMask2Style: CSSProperties = {};
  if (!isIndeterminate) {
    const percentage = ((value - minValue) / (maxValue - minValue)) * 100;
    let angle;
    if (percentage > 0 && percentage <= 50) {
      angle = -180 + (percentage / 50) * 180;
      subMask1Style.transform = `rotate(${angle}deg)`;
      subMask2Style.transform = 'rotate(-180deg)';
    } else if (percentage > 50) {
      angle = -180 + ((percentage - 50) / 50) * 180;
      subMask1Style.transform = 'rotate(0deg)';
      subMask2Style.transform = `rotate(${angle}deg)`;
    }
  }

  return (
    <div
      {...domProps}
      aria-valuenow={isIndeterminate ? undefined : value}
      aria-valuemin={minValue}
      aria-valuemax={maxValue}
      aria-valuetext={isIndeterminate ? undefined : valueLabel}
      role="progressbar"
      ref={ref}
      className={clsx(
        'relative progress-circle',
        circleStyle.size,
        isIndeterminate && 'indeterminate',
        className
      )}
    >
      <div
        className={`track ${circleStyle.size} border-4 ${circleStyle.radius}`}
      />
      <div
        className={clsx(
          'fills absolute w-full h-full top-0 left-0',
          isIndeterminate && 'progress-circle-fills-animate'
        )}
      >
        <FillMask
          sizeStyle={circleStyle}
          subMaskStyle={subMask1Style}
          subMaskClassName={clsx(
            isIndeterminate && 'progress-circle-fill-submask-1-animate'
          )}
          isIndeterminate={isIndeterminate}
          className="rotate-180"
        />
        <FillMask
          sizeStyle={circleStyle}
          subMaskStyle={subMask2Style}
          isIndeterminate={isIndeterminate}
          subMaskClassName={clsx(
            isIndeterminate && 'progress-circle-fill-submask-2-animate'
          )}
        />
      </div>
    </div>
  );
});

interface FillMaskProps {
  className?: string;
  sizeStyle: SizeStyle;
  subMaskStyle: CSSProperties;
  subMaskClassName: string;
  isIndeterminate?: boolean;
}
function FillMask({
  subMaskStyle,
  subMaskClassName,
  className,
  sizeStyle,
  isIndeterminate,
}: FillMaskProps) {
  return (
    <div
      className={clsx(
        'w-1/2 h-full origin-[100%] absolute overflow-hidden',
        className
      )}
    >
      <div
        className={clsx(
          'w-full h-full origin-[100%] overflow-hidden rotate-180',
          !isIndeterminate && 'transition-transform duration-100',
          subMaskClassName
        )}
        style={subMaskStyle}
      >
        <div
          className={`${sizeStyle.size} border-4 border-primary ${sizeStyle.radius}`}
        />
      </div>
    </div>
  );
}

interface SizeStyle {
  size: string;
  radius: string;
}
function getCircleStyle(size: InputSize): SizeStyle {
  switch (size) {
    case 'sm':
      return {size: 'w-24 h-24', radius: 'rounded-[16px]'};
    case 'lg':
      return {size: 'w-42 h-42', radius: 'rounded-[64px]'};
    default:
      return {size: 'w-32 h-32', radius: 'rounded-[32px]'};
  }
}
