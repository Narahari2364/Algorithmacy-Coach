import { useId } from "react";

import type { NodeId } from "@/lib/explain";

const nodes = {
  U: { x: 64, y: 156 },
  A: { x: 180, y: 48 },
  C: { x: 296, y: 156 },
} as const;

const possible: Array<[NodeId, NodeId]> = [
  ["U", "A"],
  ["A", "U"],
  ["A", "C"],
  ["C", "A"],
  ["U", "C"],
  ["C", "U"],
];

function shorten(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const length = Math.hypot(dx, dy) || 1;
  const ux = dx / length;
  const uy = dy / length;
  const radius = 28;
  return {
    x1: x1 + ux * radius,
    y1: y1 + uy * radius,
    x2: x2 - ux * (radius + 8),
    y2: y2 - uy * (radius + 8),
  };
}

export function TriadDiagram({
  labels,
  core,
  edges,
}: {
  labels: { U: string; A: string; C: string };
  core: string[] | null;
  edges: Array<[NodeId, NodeId]>;
}) {
  const markerId = useId().replace(/:/g, "");
  const members = new Set(core ?? []);
  const shown = new Set(edges.map(([from, to]) => `${from}${to}`));

  return (
    <svg
      viewBox="0 0 360 214"
      role="img"
      className="h-auto w-full text-foreground"
      aria-label="User, algorithm, and counterpart"
    >
      <defs>
        <marker id={markerId} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L7,3 L0,6 Z" fill="currentColor" />
        </marker>
      </defs>
      {possible.map(([from, to]) => {
        const line = shorten(nodes[from].x, nodes[from].y, nodes[to].x, nodes[to].y);
        const visible = shown.has(`${from}${to}`);
        return (
          <line
            key={`${from}${to}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="currentColor"
            strokeWidth="1.6"
            markerEnd={visible ? `url(#${markerId})` : undefined}
            style={{
              opacity: visible ? 0.8 : 0,
              transition: "opacity 300ms ease",
            }}
          />
        );
      })}
      {(Object.keys(nodes) as NodeId[]).map((key) => {
        const node = nodes[key];
        const inside = members.has(key);
        return (
          <g key={key} style={{ opacity: inside ? 1 : 0.38, transition: "opacity 300ms ease" }}>
            <circle
              cx={node.x}
              cy={node.y}
              r="22"
              fill={inside ? "var(--accent)" : "var(--card)"}
              stroke={inside ? "var(--accent)" : "currentColor"}
              strokeWidth="1.8"
              style={{ transition: "fill 300ms ease, stroke 300ms ease" }}
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="13"
              fontFamily="var(--font-display), serif"
              fill={inside ? "var(--accent-foreground)" : "currentColor"}
              style={{ transition: "fill 300ms ease" }}
            >
              {key}
            </text>
            <text
              x={node.x}
              y={key === "A" ? node.y - 34 : node.y + 42}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
            >
              {labels[key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
