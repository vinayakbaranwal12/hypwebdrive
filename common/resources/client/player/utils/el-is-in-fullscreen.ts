import fscreen from 'fscreen';

export function elIsInFullscreen(el: HTMLElement): boolean {
  if (fscreen.fullscreenElement === el) return true;

  try {
    // Throws in iOS Safari...
    return el.classList.contains((fscreen as any).fullscreenPseudoClass);
  } catch (error) {
    return false;
  }
}
