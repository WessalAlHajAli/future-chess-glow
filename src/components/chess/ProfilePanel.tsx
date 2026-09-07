import { useRef, useState } from "react";
import { Pencil, Star, User } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import type { Preferences } from "../../lib/chess-preferences";

interface Props {
  prefs: Preferences;
  elo: string;
  onChangePref: <K extends keyof Preferences>(k: K, v: Preferences[K]) => void;
}

async function toSmallDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 200;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const side = Math.min(bitmap.width, bitmap.height);
  ctx.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    size,
    size,
  );
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function ProfilePanel({ prefs, elo, onChangePref }: Props) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const avatar = prefs.playerAvatar ? (
    <img
      src={prefs.playerAvatar}
      alt="Your profile"
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <User className="h-9 w-9 text-primary/85" strokeWidth={1.6} />
  );

  return (
    <>
      <div className="panel animate-fade-in flex flex-col items-center gap-3 p-5 text-center">
        <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border-2 border-primary/50">
          {avatar}
        </div>
        <div>
          <p className="font-serif text-xl font-medium text-foreground">
            {prefs.playerName || "You"}
          </p>
          <p className="mt-0.5 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-muted-foreground">
            ELO {elo}
            <Star className="h-3 w-3 fill-primary text-primary" />
          </p>
          {prefs.playerCountry && (
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              {prefs.playerCountry}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Pencil className="mr-2 h-3.5 w-3.5" /> Edit profile
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif tracking-widest">Your profile</DialogTitle>
            <DialogDescription>
              Add your photo, name and country. Saved on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-primary/50">
                {avatar}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  Choose photo
                </Button>
                {prefs.playerAvatar && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChangePref("playerAvatar", "")}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  const url = await toSmallDataUrl(file);
                  if (url) onChangePref("playerAvatar", url);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Name</Label>
              <Input
                value={prefs.playerName}
                maxLength={24}
                onChange={(e) => onChangePref("playerName", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Country</Label>
              <Input
                value={prefs.playerCountry}
                maxLength={32}
                placeholder="e.g. Saudi Arabia"
                onChange={(e) => onChangePref("playerCountry", e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
