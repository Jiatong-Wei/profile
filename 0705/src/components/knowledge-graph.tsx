"use client";

import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
import type { GraphEdge, GraphNode } from "@/lib/types";

const collectionHref: Record<string, string> = {
  wiki: "/wiki",
  projects: "/projects",
  papers: "/papers"
};

const collectionColor: Record<string, string> = {
  wiki: "var(--teal)",
  projects: "var(--orange)",
  papers: "var(--blue)"
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  collection: string;
  featured: boolean;
}

interface SimEdge extends d3.SimulationLinkDatum<SimNode> {
  source: string | SimNode;
  target: string | SimNode;
}

interface KnowledgeGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  compact?: boolean;
}

export function KnowledgeGraph({ nodes, edges, compact = false }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const W = container.clientWidth  || 560;
    const H = container.clientHeight || 520;

    // Clear previous render
    d3.select(svg).selectAll("*").remove();

    svg.setAttribute("width",  String(W));
    svg.setAttribute("height", String(H));
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

    const simNodes: SimNode[] = nodes.map((n) => ({ ...n, featured: n.featured ?? false }));
    const simEdges: SimEdge[] = edges
      .filter((e) => simNodes.some((n) => n.id === e.source) && simNodes.some((n) => n.id === e.target))
      .map((e) => ({ source: e.source, target: e.target }));

    // ── Defs: arrow marker ──────────────────────────────────────────
    const defs = d3.select(svg).append("defs");
    defs.append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -4 8 8")
      .attr("refX", 18)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L8,0L0,4")
      .attr("fill", "rgba(69,97,95,0.35)");

    // ── Simulation ───────────────────────────────────────────────────
    const simulation = d3.forceSimulation<SimNode>(simNodes)
      .force("link", d3.forceLink<SimNode, SimEdge>(simEdges)
        .id((d) => d.id)
        .distance(compact ? 90 : 120)
        .strength(0.6))
      .force("charge", d3.forceManyBody().strength(compact ? -180 : -260))
      .force("center", d3.forceCenter(W / 2, H / 2).strength(0.08))
      .force("collision", d3.forceCollide(compact ? 48 : 60))
      .force("x", d3.forceX(W / 2).strength(0.04))
      .force("y", d3.forceY(H / 2).strength(0.04));

    // ── Zoom/pan layer ───────────────────────────────────────────────
    const root = d3.select(svg).append("g").attr("class", "graph-root");

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .on("zoom", (event) => root.attr("transform", event.transform));

    d3.select(svg).call(zoom);

    // ── Edges ────────────────────────────────────────────────────────
    const link = root.append("g")
      .selectAll<SVGLineElement, SimEdge>("line")
      .data(simEdges)
      .join("line")
      .attr("stroke", "rgba(69,97,95,0.22)")
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    // ── Nodes (foreignObject for HTML labels) ────────────────────────
    const NODE_W = compact ? 110 : 130;
    const NODE_H = compact ? 32  : 36;

    const nodeGroup = root.append("g")
      .selectAll<SVGForeignObjectElement, SimNode>("foreignObject")
      .data(simNodes)
      .join("foreignObject")
      .attr("width", NODE_W)
      .attr("height", NODE_H)
      .attr("overflow", "visible")
      .style("cursor", "pointer");

    // Inner HTML node
    nodeGroup.append("xhtml:a")
      .attr("href", (d) => `${collectionHref[d.collection] ?? "/wiki"}/${d.id}`)
      .attr("class", "fg-node")
      .style("display", "inline-flex")
      .style("align-items", "center")
      .style("gap", "7px")
      .style("max-width", `${NODE_W}px`)
      .style("padding", "6px 10px")
      .style("border", "1px solid rgba(214,230,220,0.8)")
      .style("border-radius", "999px")
      .style("background", "rgba(255,255,255,0.92)")
      .style("box-shadow", "0 2px 10px rgba(14,42,40,0.07)")
      .style("text-decoration", "none")
      .style("white-space", "nowrap")
      .style("overflow", "hidden")
      .style("font-family", "Inter, system-ui, sans-serif")
      .style("font-size", compact ? "0.78rem" : "0.84rem")
      .style("color", "var(--ink,#0e2a28)")
      .style("transition", "background 140ms, box-shadow 140ms, border-color 140ms")
      .on("mouseover", function() {
        d3.select(this)
          .style("background", "rgba(255,255,255,1)")
          .style("box-shadow", "0 6px 20px rgba(14,42,40,0.14)")
          .style("border-color", "rgba(10,155,146,0.55)");
      })
      .on("mouseout", function() {
        d3.select(this)
          .style("background", "rgba(255,255,255,0.92)")
          .style("box-shadow", "0 2px 10px rgba(14,42,40,0.07)")
          .style("border-color", "rgba(214,230,220,0.8)");
      })
      .each(function(d) {
        const anchor = d3.select(this);
        // Colored dot
        anchor.append("xhtml:span")
          .style("display", "inline-block")
          .style("flex-shrink", "0")
          .style("width", "8px")
          .style("height", "8px")
          .style("border-radius", "50%")
          .style("background", collectionColor[d.collection] ?? "var(--teal)");
        // Label
        anchor.append("xhtml:span")
          .style("overflow", "hidden")
          .style("text-overflow", "ellipsis")
          .style("font-weight", d.featured ? "700" : "500")
          .text(d.title);
      });

    // ── Drag behavior ────────────────────────────────────────────────
    nodeGroup.call(
      d3.drag<SVGForeignObjectElement, SimNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    );

    // Prevent click-through when dragging
    nodeGroup.on("click", (event) => {
      if ((event as MouseEvent & { _dragged?: boolean })._dragged) {
        event.preventDefault();
      }
    });

    // ── Tick ─────────────────────────────────────────────────────────
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeGroup
        .attr("x", (d) => (d.x ?? 0) - NODE_W / 2)
        .attr("y", (d) => (d.y ?? 0) - NODE_H / 2);
    });

    // Fade in after initial settle
    const timer = setTimeout(() => setReady(true), 200);

    return () => {
      simulation.stop();
      clearTimeout(timer);
    };
  }, [nodes, edges, compact]);

  return (
    <div
      ref={containerRef}
      className={`knowledge-graph ${compact ? "knowledge-graph-compact" : ""}`}
      aria-label="Knowledge graph"
      style={{ opacity: ready ? 1 : 0, transition: "opacity 400ms ease" }}
    >
      <svg ref={svgRef} style={{ display: "block", width: "100%", height: "100%" }} />
    </div>
  );
}
