import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button.jsx';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog.jsx';
import { Input } from './input.jsx';
import { Label } from './label.jsx';

/**
 * Destructive-action confirmation. Optionally requires the user to type a
 * confirmation phrase (used for deleting a library, which has real consequences).
 */
export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'destructive',
  onConfirm,
  loading = false,
  confirmPhrase,
  children,
}) => {
  const [typed, setTyped] = useState('');
  const phraseOk = !confirmPhrase || typed.trim() === confirmPhrase;

  const handleConfirm = async () => {
    await onConfirm?.();
    setTyped('');
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) setTyped(''); onOpenChange?.(next); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        {children}

        {confirmPhrase ? (
          <div className="space-y-1.5">
            <Label htmlFor="confirm-phrase">
              Type <span className="font-semibold text-foreground">{confirmPhrase}</span> to continue
            </Label>
            <Input id="confirm-phrase" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" />
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange?.(false)} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button variant={tone} onClick={handleConfirm} loading={loading} disabled={!phraseOk}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
