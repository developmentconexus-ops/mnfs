import type { MissionPlanContent } from '../domain/mission-plan.js';
import { escapeHtml } from './html.js';

type GraphNodeKind = 'milestone' | 'feature';

interface GraphNode {
  readonly id: string;
  readonly title: string;
  readonly kind: GraphNodeKind;
  readonly dependsOn: readonly string[];
  readonly order: number;
}

interface PositionedNode {
  readonly node: GraphNode;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 82;
const COLUMN_GAP = 96;
const ROW_GAP = 28;
const PADDING = 28;

function collectNodes(content: MissionPlanContent): GraphNode[] {
  const nodes: GraphNode[] = [];
  for (const milestone of content.milestones) {
    nodes.push({
      id: milestone.id,
      title: milestone.title,
      kind: 'milestone',
      dependsOn: milestone.dependsOn,
      order: nodes.length,
    });
  }
  for (const milestone of content.milestones) {
    for (const feature of milestone.features) {
      nodes.push({
        id: feature.id,
        title: feature.title,
        kind: 'feature',
        dependsOn: feature.dependsOn,
        order: nodes.length,
      });
    }
  }
  return nodes;
}

function nodeDepth(
  node: GraphNode,
  nodesById: ReadonlyMap<string, GraphNode>,
  memo: Map<string, number>,
  visiting: Set<string>,
): number {
  const cached = memo.get(node.id);
  if (cached !== undefined) return cached;
  if (visiting.has(node.id)) return 0;

  visiting.add(node.id);
  let depth = 0;
  for (const dependencyId of node.dependsOn) {
    const dependency = nodesById.get(dependencyId);
    if (dependency !== undefined) {
      depth = Math.max(depth, nodeDepth(dependency, nodesById, memo, visiting) + 1);
    }
  }
  visiting.delete(node.id);
  memo.set(node.id, depth);
  return depth;
}

function titleLines(title: string): readonly string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current.length === 0 ? word : `${current} ${word}`;
    if (candidate.length <= 28 || current.length === 0) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  if (lines.length <= 2) return lines;

  const first = lines.shift() ?? '';
  const remaining = lines.join(' ');
  const second = remaining.length <= 27 ? remaining : `${remaining.slice(0, 26)}…`;
  return [first, second];
}

function renderNode(positioned: PositionedNode): string {
  const { node, x, y } = positioned;
  const lines = titleLines(node.title);
  const titleSpans = lines
    .map((line, index) => `<tspan x="16" dy="${index === 0 ? 0 : 18}">${escapeHtml(line)}</tspan>`)
    .join('');

  return `<g class="dependency-node dependency-node-${node.kind}" data-node="${escapeHtml(node.id)}" transform="translate(${x} ${y})">
    <title>${escapeHtml(`${node.id}: ${node.title}`)}</title>
    <rect width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="14"></rect>
    <text class="dependency-node-id" x="16" y="24">${escapeHtml(node.id)}</text>
    <text class="dependency-node-title" x="16" y="48">${titleSpans}</text>
  </g>`;
}

export function renderDependencyGraphSvg(content: MissionPlanContent): string | undefined {
  const nodes = collectNodes(content);
  const edges = nodes.flatMap((node) => node.dependsOn.map((sourceId) => ({ sourceId, targetId: node.id })));
  if (edges.length === 0) return undefined;

  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const depthMemo = new Map<string, number>();
  const grouped = new Map<number, GraphNode[]>();
  let maximumDepth = 0;

  for (const node of nodes) {
    const depth = nodeDepth(node, nodesById, depthMemo, new Set());
    maximumDepth = Math.max(maximumDepth, depth);
    const column = grouped.get(depth) ?? [];
    column.push(node);
    grouped.set(depth, column);
  }

  const maximumRows = Math.max(...Array.from(grouped.values(), (column) => column.length));
  const width = PADDING * 2 + (maximumDepth + 1) * NODE_WIDTH + maximumDepth * COLUMN_GAP;
  const height = PADDING * 2 + maximumRows * NODE_HEIGHT + Math.max(0, maximumRows - 1) * ROW_GAP;
  const positions = new Map<string, PositionedNode>();

  for (let depth = 0; depth <= maximumDepth; depth += 1) {
    const column = (grouped.get(depth) ?? []).sort((left, right) => left.order - right.order);
    const columnHeight = column.length * NODE_HEIGHT + Math.max(0, column.length - 1) * ROW_GAP;
    const offsetY = PADDING + Math.round((height - PADDING * 2 - columnHeight) / 2);
    column.forEach((node, row) => {
      positions.set(node.id, {
        node,
        depth,
        x: PADDING + depth * (NODE_WIDTH + COLUMN_GAP),
        y: offsetY + row * (NODE_HEIGHT + ROW_GAP),
      });
    });
  }

  const renderedEdges = edges.map(({ sourceId, targetId }) => {
    const source = positions.get(sourceId);
    const target = positions.get(targetId);
    if (source === undefined || target === undefined) return '';
    const sourceX = source.x + NODE_WIDTH;
    const sourceY = source.y + NODE_HEIGHT / 2;
    const targetX = target.x;
    const targetY = target.y + NODE_HEIGHT / 2;
    const middleX = Math.round((sourceX + targetX) / 2);
    return `<path class="dependency-edge" data-edge="${escapeHtml(`${sourceId}->${targetId}`)}" d="M ${sourceX} ${sourceY} C ${middleX} ${sourceY}, ${middleX} ${targetY}, ${targetX} ${targetY}" marker-end="url(#mnfs-dependency-arrow)"></path>`;
  }).join('');

  const renderedNodes = nodes
    .map((node) => positions.get(node.id))
    .filter((position): position is PositionedNode => position !== undefined)
    .map(renderNode)
    .join('');

  return `<svg class="dependency-graph" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="dependency-graph-title dependency-graph-description" xmlns="http://www.w3.org/2000/svg">
    <title id="dependency-graph-title">Mission dependency graph</title>
    <desc id="dependency-graph-description">Milestone and feature dependencies. Arrows point from prerequisites to dependent work.</desc>
    <defs>
      <marker id="mnfs-dependency-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" class="dependency-arrow"></path>
      </marker>
    </defs>
    <g class="dependency-edges">${renderedEdges}</g>
    <g class="dependency-nodes">${renderedNodes}</g>
  </svg>`;
}
