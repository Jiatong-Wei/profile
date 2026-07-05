"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type { GraphEdge, GraphNode } from "@/lib/types";

const nodePositions = [
  { x: 50, y: 48 },
  { x: 27, y: 30 },
  { x: 73, y: 31 },
  { x: 31, y: 69 },
  { x: 70, y: 68 },
  { x: 51, y: 22 },
  { x: 18, y: 52 },
  { x: 84, y: 52 },
  { x: 47, y: 79 },
  { x: 62, y: 16 },
  { x: 20, y: 79 },
  { x: 86, y: 80 }
];

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
  const selectedNodes = useMemo(() => nodes.slice(0, compact ? 7 : 12), [compact, nodes]);
  const positionById = useMemo(
    () => new Map(selectedNodes.map((node, index) => [node.id, nodePositions[index % nodePositions.length]])),
    [selectedNodes]
  );
  const visibleEdges = useMemo(
    () => edges.filter((edge) => positionById.has(edge.source) && positionById.has(edge.target)),
    [edges, positionById]
  );

  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ active: false, x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const suppressClickRef = useRef(false);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    dragRef.current = {
      active: true,
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!dragRef.current.active) {
      return;
    }

    const dx = event.clientX - dragRef.current.x;
    const dy = event.clientY - dragRef.current.y;

    if (Math.abs(dx) + Math.abs(dy) > 4) {
      suppressClickRef.current = true;
    }

    setOffset({
      x: dragRef.current.offsetX + dx,
      y: dragRef.current.offsetY + dy
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    dragRef.current.active = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      className={`knowledge-graph ${compact ? "knowledge-graph-compact" : ""} ${isDragging ? "is-dragging" : ""}`}
      aria-label="Knowledge graph preview"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={(event) => {
        if (suppressClickRef.current) {
          event.preventDefault();
          event.stopPropagation();
          suppressClickRef.current = false;
        }
      }}
    >
      <div className="graph-canvas" style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}>
        <svg className="graph-lines" viewBox="0 0 100 100" role="img" aria-hidden="true">
          {visibleEdges.map((edge) => {
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
              style={{ left: `${position.x}%`, top: `${position.y}%`, animationDelay: `${index * 55}ms` }}
            >
              <span className="graph-dot" aria-hidden="true" />
              <span className="graph-node-text">
                <strong>{node.title}</strong>
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
