import { HIERARCHY_RANK } from "./AutomaticAdjustmentPage";

export interface DrillDownNode<T> {
  item: T;
  children: DrillDownNode<T>[];
  hasChildren: boolean;
  level: number;
}

export interface HierarchyTreeResult<T> {
  tree: DrillDownNode<T>[];
  parentMap: Record<string, string>;
  hasChildrenMap: Record<string, boolean>;
  allParentIds: string[];
}

/**
 * Membangun struktur tree hierarkis dari array datar berdasarkan urutan HIERARCHY_RANK.
 */
export function buildHierarchyTree<T extends { id: string; type: string }>(
  items: T[],
  hierarchyRank: Record<string, number> = HIERARCHY_RANK
): HierarchyTreeResult<T> {
  const tree: DrillDownNode<T>[] = [];
  const parentMap: Record<string, string> = {};
  const hasChildrenMap: Record<string, boolean> = {};
  const allParentIds: string[] = [];

  const stack: { node: DrillDownNode<T>; rank: number }[] = [];

  for (const item of items) {
    const rank = hierarchyRank[item.type] ?? 99;
    const node: DrillDownNode<T> = {
      item,
      children: [],
      hasChildren: false,
      level: rank,
    };

    while (stack.length > 0 && stack[stack.length - 1].rank >= rank) {
      stack.pop();
    }

    if (stack.length === 0) {
      tree.push(node);
    } else {
      const parent = stack[stack.length - 1].node;
      parent.children.push(node);
      if (!parent.hasChildren) {
        parent.hasChildren = true;
        hasChildrenMap[parent.item.id] = true;
        allParentIds.push(parent.item.id);
      }
      parentMap[item.id] = parent.item.id;
    }

    stack.push({ node, rank });
  }

  return { tree, parentMap, hasChildrenMap, allParentIds };
}

/**
 * Menghasilkan daftar baris datar yang visible berdasarkan status expand / collapse node.
 */
export function getVisibleRowsFromTree<T extends { id: string }>(
  tree: DrillDownNode<T>[],
  expandedMap: Record<string, boolean>
): T[] {
  const result: T[] = [];
  function traverse(nodes: DrillDownNode<T>[]) {
    for (const n of nodes) {
      result.push(n.item);
      // Default expanded jika belum ada di map (atau jika expanded === true)
      const isExpanded = expandedMap[n.item.id] !== false;
      if (n.hasChildren && isExpanded) {
        traverse(n.children);
      }
    }
  }
  traverse(tree);
  return result;
}
