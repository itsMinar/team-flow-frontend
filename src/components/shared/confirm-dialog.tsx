"use client";

import { Dialog } from "@/components/shared/dialog";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  isPending = false,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
}) {
  return (
    <Dialog
      description={description}
      onOpenChange={onOpenChange}
      open={open}
      title={title}
    >
      <div className="flex justify-end gap-3">
        <button
          className="h-10 rounded-md border border-[#cbd4ce] px-4 text-sm font-medium hover:bg-[#f5f7f3] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#346e58]"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          Cancel
        </button>
        <button
          className="h-10 rounded-md bg-rose-700 px-4 text-sm font-semibold text-white hover:bg-rose-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700 disabled:opacity-60"
          disabled={isPending}
          onClick={onConfirm}
          type="button"
        >
          {confirmLabel}
        </button>
      </div>
    </Dialog>
  );
}
