import { useState } from "react";
import { toast } from "sonner";
import { Copy, Download, Upload } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pgn: string;
  fen: string;
  onLoadPgn: (pgn: string) => { ok: boolean; error?: string };
  onLoadFen: (fen: string) => { ok: boolean; error?: string };
}

const STORAGE_KEY = "aichess-saved-games-v1";

interface SavedGame {
  id: string;
  name: string;
  pgn: string;
  savedAt: number;
}

function loadSaved(): SavedGame[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeSaved(list: SavedGame[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function SaveLoadDialog({
  open,
  onOpenChange,
  pgn,
  fen,
  onLoadPgn,
  onLoadFen,
}: Props) {
  const [pgnInput, setPgnInput] = useState("");
  const [fenInput, setFenInput] = useState("");
  const [saveName, setSaveName] = useState("");
  const [saved, setSaved] = useState<SavedGame[]>(loadSaved());

  const refresh = () => setSaved(loadSaved());

  const doSave = () => {
    const name = saveName.trim() || new Date().toLocaleString();
    const list = [
      { id: crypto.randomUUID(), name, pgn, savedAt: Date.now() },
      ...loadSaved(),
    ].slice(0, 20);
    writeSaved(list);
    setSaved(list);
    setSaveName("");
    toast.success(`Saved as "${name}"`);
  };

  const doLoadSaved = (g: SavedGame) => {
    const res = onLoadPgn(g.pgn);
    if (res.ok) {
      toast.success(`Loaded "${g.name}"`);
      onOpenChange(false);
    } else {
      toast.error(res.error || "Failed to load");
    }
  };

  const doDelete = (id: string) => {
    const list = loadSaved().filter((g) => g.id !== id);
    writeSaved(list);
    setSaved(list);
  };

  const copy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Copy failed");
    }
  };

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const submitPgn = () => {
    const res = onLoadPgn(pgnInput.trim());
    if (res.ok) {
      toast.success("PGN loaded");
      onOpenChange(false);
    } else toast.error(res.error || "Invalid PGN");
  };

  const submitFen = () => {
    const res = onLoadFen(fenInput.trim());
    if (res.ok) {
      toast.success("Position loaded");
      onOpenChange(false);
    } else toast.error(res.error || "Invalid FEN");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (o) refresh();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif tracking-widest">
            Save &amp; Load
          </DialogTitle>
          <DialogDescription>
            Save games to your browser, or import / export as PGN or FEN.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="save" className="mt-2">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="save">Save</TabsTrigger>
            <TabsTrigger value="load">Load</TabsTrigger>
            <TabsTrigger value="pgn">PGN</TabsTrigger>
            <TabsTrigger value="fen">FEN</TabsTrigger>
          </TabsList>

          <TabsContent value="save" className="space-y-3">
            <Input
              placeholder="Name this game (optional)"
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
            />
            <Button onClick={doSave} className="w-full">
              Save current game
            </Button>
            <p className="text-xs text-muted-foreground">
              Games are stored locally in this browser.
            </p>
          </TabsContent>

          <TabsContent value="load" className="space-y-2">
            {saved.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No saved games yet.
              </p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-y-auto">
                {saved.map((g) => (
                  <li
                    key={g.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {g.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(g.savedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Button size="sm" onClick={() => doLoadSaved(g)}>
                        Load
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => doDelete(g.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="pgn" className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Current PGN
              </p>
              <Textarea
                readOnly
                value={pgn || "(no moves yet)"}
                className="min-h-24 font-mono text-xs"
              />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(pgn, "PGN")}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => download(pgn, "game.pgn")}
                >
                  <Download className="mr-1 h-3.5 w-3.5" /> Download
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Import PGN
              </p>
              <Textarea
                placeholder="Paste PGN here..."
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                className="min-h-24 font-mono text-xs"
              />
              <Button className="mt-2 w-full" onClick={submitPgn} disabled={!pgnInput.trim()}>
                <Upload className="mr-1 h-4 w-4" /> Load PGN
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="fen" className="space-y-3">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Current FEN
              </p>
              <Input readOnly value={fen} className="font-mono text-xs" />
              <div className="mt-2 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(fen, "FEN")}>
                  <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                </Button>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Import FEN
              </p>
              <Input
                placeholder="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                value={fenInput}
                onChange={(e) => setFenInput(e.target.value)}
                className="font-mono text-xs"
              />
              <Button className="mt-2 w-full" onClick={submitFen} disabled={!fenInput.trim()}>
                <Upload className="mr-1 h-4 w-4" /> Load FEN
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}