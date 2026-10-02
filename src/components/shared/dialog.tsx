"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = "teamflow-dialog-title";
  const descriptionId = "teamflow-dialog-description";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      aria-modal="true"
      className="m-auto w-[calc(100%-2rem)] max-w-xl border-0 bg-transparent p-0 text-[#1b2d27] backdrop:bg-[#142d27]/55"
      onCancel={(event) => {
        event.preventDefault();
        onOpenChange(false);
      }}
      onClose={() => onOpenChange(false)}
      ref={dialogRef}
    >
      <section className="rounded-md border border-[#d5ddd6] bg-white p-5 shadow-2xl sm:p-7">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold" id={titleId}>
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-[#64756c]" id={descriptionId}>
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Close dialog"
            className="rounded p-1 text-[#64756c] hover:bg-[#f2f4ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X aria-hidden="true" size={20} />
          </button>
        </header>
        <div className="mt-6">{children}</div>
      </section>
    </dialog>
  );
}
