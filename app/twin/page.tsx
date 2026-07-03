"use client";
import { useEffect, useState } from "react";

type Node = { id: string; [k: string]: any };

const LEVEL_ORDER = ["train", "car", "system", "subsystem", "equipment", "connector", "pin"] as const;
type Level = (typeof LEVEL_ORDER)[number];

function labelFor(level: Level, n: Node) {
  switch (level) {
    case "train": return n.name;
    case "car": return `Car ${n.position} (${n.carType})`;
    case "system": return `${n.code} — ${n.name}`;
    case "subsystem": return n.name;
    case "equipment": return `${n.tag} — ${n.name}`;
    case "connector": return n.designator;
    case "pin": return `Pin ${n.number} (${n.function ?? "n/a"})`;
  }
}

function childLevel(level: Level): Level | null {
  const i = LEVEL_ORDER.indexOf(level);
  return i < LEVEL_ORDER.length - 1 ? LEVEL_ORDER[i + 1] : null;
}

function TreeNode({ level, node }: { level: Level; node: Node }) {
  const [open, setOpen] = useState(false);
  const [children, setChildren] = useState<Node[] | null>(null);
  const next = childLevel(level);

  async function toggle() {
    if (!open && children === null && next) {
      const res = await fetch(`/api/hierarchy?level=${next}&parentId=${node.id}`);
      setChildren(await res.json());
    }
    setOpen(!open);
  }

  return (
    <li className="ml-2">
      <button onClick={toggle} className="text-left text-sm hover:underline">
        {next ? (open ? "▾ " : "▸ ") : "• "}
        {labelFor(level, node)}
      </button>
      {open && children && (
        <ul className="ml-4 border-l border-slate-200 pl-2">
          {children.map((c) => (
            <TreeNode key={c.id} level={next as Level} node={c} />
          ))}
          {children.length === 0 && <li className="text-xs text-slate-400">no children</li>}
        </ul>
      )}
    </li>
  );
}

export default function TwinExplorer() {
  const [trains, setTrains] = useState<Node[] | null>(null);

  useEffect(() => {
    fetch("/api/hierarchy?level=train").then((r) => r.json()).then(setTrains);
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Digital Twin Explorer</h1>
      <p className="mb-4 text-sm text-slate-600">Train → Car → System → Subsystem → Equipment → Connector → Pin</p>
      <ul>{trains?.map((t) => <TreeNode key={t.id} level="train" node={t} />)}</ul>
    </div>
  );
}
