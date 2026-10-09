type Verdict = "triadic" | "dyadic" | null;

const nodes = {
  U: { x: 64, y: 156 },
  A: { x: 180, y: 48 },
  C: { x: 296, y: 156 },
} as const;

export function TriadDiagram({
  verdict,
  labels,
}: {
  verdict: Verdict;
  labels: { U: string; A: string; C: string };
}) {
  const pipe = verdict === "dyadic";
  const edges: Array<["U" | "A" | "C", "U" | "A" | "C"]> = pipe
    ? [
        ["U", "A"],
        ["A", "C"],
      ]
    : [
        ["U", "A"],
        ["A", "C"],
        ["U", "C"],
      ];

  return (
    <svg
      viewBox="0 0 360 214"
      role="img"
      className="h-auto w-full text-foreground"
      aria-label="User, algorithm, and counterpart"
    >
      {edges.map(([from, to]) => (
        <line
          key={`${from}${to}`}
          x1={nodes[from].x}
          y1={nodes[from].y}
          x2={nodes[to].x}
          y2={nodes[to].y}
          stroke="currentColor"
          strokeWidth="1.6"
          strokeDasharray={verdict === null ? "4 4" : undefined}
          opacity="0.7"
        />
      ))}
      {(Object.keys(nodes) as Array<keyof typeof nodes>).map((key) => {
        const node = nodes[key];
        const isAlgorithm = key === "A";
        const filled = isAlgorithm && verdict === "triadic";
        return (
          <g key={key}>
            <circle
              cx={node.x}
              cy={node.y}
              r="22"
              fill={filled ? "var(--accent)" : "var(--card)"}
              stroke={isAlgorithm ? "var(--accent)" : "currentColor"}
              strokeWidth="1.8"
            />
            <text
              x={node.x}
              y={node.y + 5}
              textAnchor="middle"
              fontSize="13"
              fontFamily="var(--font-display), serif"
              fill={filled ? "var(--accent-foreground)" : "currentColor"}
            >
              {key}
            </text>
            <text
              x={node.x}
              y={key === "A" ? node.y - 30 : node.y + 38}
              textAnchor="middle"
              fontSize="12"
              fill="currentColor"
              opacity="0.75"
            >
              {labels[key]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
