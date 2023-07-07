import {Fragment, memo} from 'react';
import {useTrans, UseTransReturn} from '@common/i18n/use-trans';
import {message} from '@common/i18n/message';

interface FormattedTrackDurationProps {
  ms?: number;
  seconds?: number;
  verbose?: boolean;
}
export const FormattedDuration = memo(
  ({ms, seconds, verbose = false}: FormattedTrackDurationProps) => {
    const {trans} = useTrans();

    if (seconds) {
      ms = seconds * 1000;
    }
    if (!ms) {
      ms = 0;
    }

    return <Fragment>{formatDuration(ms, verbose, trans)}</Fragment>;
  }
);

interface ParsedMS {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function formatDuration(
  ms: number,
  verbose = false,
  trans: UseTransReturn['trans']
) {
  const unsignedMs = ms < 0 ? -ms : ms;
  const parsedMS: ParsedMS = {
    days: Math.trunc(unsignedMs / 86400000),
    hours: Math.trunc(unsignedMs / 3600000) % 24,
    minutes: Math.trunc(unsignedMs / 60000) % 60,
    seconds: Math.trunc(unsignedMs / 1000) % 60,
  };

  if (verbose) {
    return formatVerbose(parsedMS, trans);
  } else {
    return formatCompact(parsedMS);
  }
}

function formatVerbose(t: ParsedMS, trans: UseTransReturn['trans']) {
  const output: string[] = [];

  if (t.days) {
    output.push(`${t.days}${trans(message('d'))}`);
  }
  if (t.hours) {
    output.push(`${t.hours}${trans(message('hr'))}`);
  }
  if (t.minutes) {
    output.push(`${t.minutes}${trans(message('min'))}`);
  }
  if (t.seconds && !t.hours) {
    output.push(`${t.seconds}${trans(message('sec'))}`);
  }

  return output.join(' ');
}

function formatCompact(t: ParsedMS) {
  const seconds = addZero(t.seconds);
  let output = '';
  if (t.days && !output) {
    output =
      t.days +
      ':' +
      addZero(t.hours) +
      ':' +
      addZero(t.minutes) +
      ':' +
      seconds;
  }
  if (t.hours && !output) {
    output = addZero(t.hours) + ':' + addZero(t.minutes) + ':' + seconds;
  }
  if (!output) {
    output = addZero(t.minutes) + ':' + seconds;
  }

  return output;
}

function addZero(v: number) {
  let value = `${v}`;
  if (value.length === 1) {
    value = '0' + value;
  }
  return value;
}
