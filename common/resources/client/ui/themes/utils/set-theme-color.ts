import {rootEl} from '../../../core/root-el';

export function setThemeColor(key: string, value: string) {
  rootEl?.style.setProperty(key, value);
}
