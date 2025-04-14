"use client";

import { parseMarkdownToTree } from "../lib/markdownParser";
import { v4 as uuidv4 } from "uuid";

import React, { useCallback, useEffect, useState } from "react";
import {
  Background,
  ReactFlow,
  addEdge,
  ConnectionLineType,
  Panel,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  MiniMap,
  useReactFlow,
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";

import "@xyflow/react/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    const textLength = node.data.label?.length || 10;
    const estimatedHeight = Math.min(200, 36 + Math.ceil(textLength / 30) * 18);
    dagreGraph.setNode(node.id, { width: nodeWidth, height: estimatedHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    const newNode = {
      ...node,
      targetPosition: isHorizontal ? "left" : "top",
      sourcePosition: isHorizontal ? "right" : "bottom",
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };

    return newNode;
  });

  return { nodes: newNodes, edges };
};

function convertTreeToReactFlow(tree: any) {
  const nodes: any[] = [];
  const edges: any[] = [];
  const queue: any[] = [];
  // 为了删除一开始的dummy root
  for (let node of tree.children) {
    const newNode = {
      node: node,
      depth: 0,
      parentId: null,
    };
    queue.push(newNode);
  }

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const { node, depth, parentId } = queue.shift();
      const curId = uuidv4();

      nodes.push({
        id: curId,
        data: { label: node.value || "Undefined" },
      });

      if (parentId) {
        edges.push({
          id: `e${parentId}-${curId}`,
          source: parentId,
          target: curId,
        });
      }

      // 将子节点加入队列，假设子节点存储在 node.children 数组中
      if (node.children && node.children.length > 0) {
        // 可以为每个子节点增加额外信息，例如当前节点的 id 作为 parentId，以及子节点的索引用于计算 y 坐标
        node.children.forEach((childNode, index) => {
          queue.push({
            node: childNode,
            depth: depth + 1,
            parentId: curId,
          });
        });
      }
    }
  }

  return { nodes, edges };
}

const Flow = ({ layoutedNodes, layoutedEdges }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const { fitView } = useReactFlow();

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          { ...params, type: ConnectionLineType.SmoothStep, animated: true },
          eds
        )
      ),
    []
  );
  const onLayout = useCallback(
    (direction) => {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      setTimeout(() => {
        fitView({
          includeHiddenNodes: false,
          padding: 0.3,
          duration: 500,
          minZoom: 0.9,
        });
      }, 100);
    },
    [nodes, edges]
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      connectionLineType={ConnectionLineType.SmoothStep}
      panOnScroll={true}
      fitView={true}
      fitViewOptions={{
        padding: 0.2,
        maxZoom: 1.2,
        minZoom: 0.5,
        duration: 300,
        includeHiddenNodes: false,
      }}
      onNodeClick={(_, node) => {
        fitView({
          nodes: [{ id: node.id }],
          duration: 600,
          padding: 1.2,
          minZoom: 0.9,
        });
      }}
      nodesDraggable={true}
      elementsSelectable={true}
      style={{ backgroundColor: "#F7F9FB" }}
    >
      <Panel position="top-right">
        <button onClick={() => onLayout("TB")}>vertical layout</button>
        <button onClick={() => onLayout("LR")}>horizontal layout</button>
      </Panel>
      <MiniMap
        className="minimap dark:bg-dt-surface-a10 rounded-2xl border border-t-0 border-l-0 border-gray-200 dark:border-dt-surface-a30"
        nodeColor="#A5A6F6"
        maskColor="rgba(0, 0, 0, 0.1)"
      />
      <Background color="#03090f" />
    </ReactFlow>
  );
};

// 假设 MarkdownTree 接受 markdown 字符串作为 prop
export default function MarkdownTree({ markdown }: { markdown: string }) {
  const tree = parseMarkdownToTree(markdown);

  const { nodes, edges } = convertTreeToReactFlow(tree);
  const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
    nodes,
    edges
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* <ReactFlow nodes={nodes} edges={edges} /> */}
      <ReactFlowProvider>
        <Flow layoutedNodes={layoutedNodes} layoutedEdges={layoutedEdges} />
      </ReactFlowProvider>
    </div>
  );
}
