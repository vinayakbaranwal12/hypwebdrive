import {ReactNode} from 'react';

interface Props {
  title: ReactNode;
  titleSuffix?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}
export function AccountSettingsPanel({
  title,
  titleSuffix,
  children,
  actions,
}: Props) {
  return (
    <section className="bg-paper rounded border px-24 py-20 mb-24 w-full max-w-850">
      <div className="border-b pb-10 flex items-center gap-14">
        <div className="text-lg font-light">{title}</div>
        {titleSuffix && <div className="ml-auto">{titleSuffix}</div>}
      </div>
      <div className="pt-24">{children}</div>
      {actions && (
        <div className="pt-10 mt-36 border-t flex justify-end">{actions}</div>
      )}
    </section>
  );
}
