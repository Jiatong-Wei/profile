"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/types";
import { SITE } from "@/lib/site";

// basePath-aware href builder (mirrors withBasePath in site.ts)
function nodeHref(collection: string, id: string): string {
  const base = SITE.basePath; // "/profile"
  return `${base}/${collection}/${id}`;
}

const collectionColor: Record<string, string> = {
  wiki:     "#c9a57b",   // softer tan
  projects: "#d4a582",   // pale sienna
  papers:   "#a3b088"    // pale sage
};

interface SimNode extends d3.SimulationNodeDatum {
  id:         string;
  title:      string;
  collection: string;
  featured:   boolean;
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

interface KnowledgeGraphProps {
  nodes:    GraphNode[];
  edges:    GraphEdge[];
  compact?: boolean;
}

export function KnowledgeGraph({ nodes, edges, compact = false }: KnowledgeGraphProps) {
  const svgRef      = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const svg       = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const W = container.clientWidth  || 560;
    const H = container.clientHeight || 520;

    d3.select(svg).selectAll("*").remove();
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const simNodes: SimNode[] = nodes.map((n) => ({
      ...n,
      featured: n.featured ?? false
    }));

    const nodeSet = new Set(simNodes.map((n) => n.id));
    const simEdges: SimEdge[] = edges
      .filter((e) => nodeSet.has(e.source) && nodeSet.has(e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    // ── Simulation ────────────────────────────────────────────────
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force("link", d3.forceLink<SimNode, SimEdge>(simEdges)
        .id((d) => d.id)
        .distance(compact ? 80 : 110)
        .strength(0.55))
      .force("charge", d3.forceManyBody().strength(compact ? -160 : -240))
      .force("center", d3.forceCenter(W / 2, H / 2).strength(0.06))
      .force("collision", d3.forceCollide(compact ? 44 : 54))
      .force("x", d3.forceX(W / 2).strength(0.04))
      .force("y", d3.forceY(H / 2).strength(0.04));

    // ── Zoom/pan layer ────────────────────────────────────────────
    const root = d3.select(svg).append("g");
    d3.select(svg).call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.35, 3.5])
        .on("zoom", (ev) => root.attr("transform", ev.transform))
    );

    // ── Edges ─────────────────────────────────────────────────────
    const link = root.append("g")
      .attr("stroke", "rgba(69,97,95,0.28)")
      .attr("stroke-width", 1.2)
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(simEdges)
      .join("line");

    // ── Node groups ───────────────────────────────────────────────
    const R       = compact ? 9  : 11;   // circle radius
    const R_feat  = compact ? 13 : 15;   // featured node radius

    const nodeG = root.append("g")
      .selectAll<SVGGElement, SimNode>("g")
      .data(simNodes)
      .join("g")
      .attr("class", "obs-node")
      .style("cursor", "pointer");

    // Outer glow ring (always visible, subtle)
    nodeG.append("circle")
      .attr("r", (d) => (d.featured ? R_feat : R) + 5)
      .attr("fill", (d) => collectionColor[d.collection] ?? "#0a9b92")
      .attr("opacity", 0.12);

    // Main filled circle
    nodeG.append("circle")
      .attr("r", (d) => d.featured ? R_feat : R)
      .attr("fill", (d) => collectionColor[d.collection] ?? "#0a9b92")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Label below the circle
    nodeG.append("text")
      .attr("y", (d) => (d.featured ? R_feat : R) + 14)
      .attr("text-anchor", "middle")
      .attr("font-size", compact ? "11" : "12")
      .attr("font-family", "Inter, system-ui, sans-serif")
      .attr("font-weight", (d) => d.featured ? "600" : "400")
      .attr("fill", "#0e2a28")
      .attr("pointer-events", "none")
      // truncate very long titles (allow more room for CJK)
      .text((d) => d.title.length > 18 ? d.title.slice(0, 17) + "…" : d.title);

    // Invisible wider hit-area for easy clicking
    nodeG.append("circle")
      .attr("r", (d) => (d.featured ? R_feat : R) + 10)
      .attr("fill", "transparent")
      .on("click", (_ev, d) => {
        window.location.href = nodeHref(d.collection, d.id);
      })
      .on("mouseover", function(_ev, d) {
        const parent = d3.select(this.parentNode as SVGGElement);
        parent.select<SVGCircleElement>("circle:nth-child(2)")
          .attr("r", (d.featured ? R_feat : R) * 1.25)
          .attr("stroke-width", 2.5);
        parent.select<SVGCircleElement>("circle:first-child")
          .attr("opacity", 0.22);
      })
      .on("mouseout", function(_ev, d) {
        const parent = d3.select(this.parentNode as SVGGElement);
        parent.select<SVGCircleElement>("circle:nth-child(2)")
          .attr("r", d.featured ? R_feat : R)
          .attr("stroke-width", 2);
        parent.select<SVGCircleElement>("circle:first-child")
          .attr("opacity", 0.12);
      });

    // ── Drag ─────────────────────────────────────────────────────
    nodeG.call(
      d3.drag<SVGGElement, SimNode>()
        .on("start", (ev, d) => {
          if (!ev.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
        .on("end", (ev, d) => {
          if (!ev.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
    );

    // ── Tick ──────────────────────────────────────────────────────
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeG.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    const timer = setTimeout(() => setReady(true), 300);
    return () => { simulation.stop(); clearTimeout(timer); };
  }, [nodes, edges, compact]);

  return (
    <div
      ref={containerRef}
      className={`knowledge-graph ${compact ? "knowledge-graph-compact" : ""}`}
      aria-label="Knowledge graph"
      style={{ opacity: ready ? 1 : 0, transition: "opacity 500ms ease" }}
    >
      <svg
        ref={svgRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
