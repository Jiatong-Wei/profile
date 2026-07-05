import Link from "next/link";
import type { GraphEdge, GraphNode } from "@/lib/types";

const nodePositions = [
  { x: 50, y: 46 },
  { x: 24, y: 28 },
  { x: 76, y: 27 },
  { x: 30, y: 70 },
  { x: 73, y: 68 },
  { x: 50, y: 82 },
  { x: 16, y: 53 },
  { x: 86, y: 50 },
  { x: 41, y: 18 },
  { x: 62, y: 17 },
  { x: 18, y: 78 },
  { x: 86, y: 80 }
];

const collectionLabels = {
  wiki: "Wiki",
  projects: "Project",
  papers: "Paper"
};

const collectionHref = {
  wiki: "/wiki",
  projects: "/projects",
  papers: "/papers"
};

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  compact?: boolean;
}

export function KnowledgeGraph({ nodes, edges, compact = false }: KnowledgeGraphProps) {
  const selectedNodes = nodes.slice(0, compact ? 7 : 12);
  const positionById = new Map(
    selectedNodes.map((node, index) => [node.id, nodePositions[index % nodePositions.length]])
  );

  return (
    <div className={`knowledge-graph ${compact ? "knowledge-graph-compact" : ""}`} aria-label="Knowledge graph preview">
      <svg className="graph-lines" viewBox="0 0 100 100" role="img" aria-hidden="true">
        {edges
          .filter((edge) => positionById.has(edge.source) && positionById.has(edge.target))
          .map((edge) => {
            const source = positionById.get(edge.source)!;
            const target = positionById.get(edge.target)!;

            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
              />
            );
          })}
      </svg>
      {selectedNodes.map((node, index) => {
        const position = positionById.get(node.id)!;

        return (
          <Link
            className={`graph-node graph-node-${node.collection} ${node.featured ? "graph-node-featured" : ""}`}
            href={`${collectionHref[node.collection]}/${node.id}`}
            key={node.id}
            style={{ left: `${position.x}%`, top: `${position.y}%`, animationDelay: `${index * 80}ms` }}
          >
            <span>{collectionLabels[node.collection]}</span>
            <strong>{node.title}</strong>
          </Link>
        );
      })}
    </div>
  );
}
