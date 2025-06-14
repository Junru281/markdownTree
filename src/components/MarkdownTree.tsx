"use client";

import { parseMarkdownToTree } from "../lib/markdownParser";
import RichMarkdownNode from '../components/RichMarkdownNode'

import React, { useCallback, useEffect, useState, type ChangeEventHandler, useRef } from "react";
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
  Controls,
  useReactFlow,
  type ColorMode
} from "@xyflow/react";
import dagre from "@dagrejs/dagre";

import "@xyflow/react/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 200;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    const textLength = node.data.label?.length || 10;
    const estimatedHeight = Math.min(200, 36 + Math.ceil(textLength / 30) * 48);
    const estimatedWidth = isHorizontal ? nodeWidth + Math.min(250, textLength * 8) : nodeWidth;
    dagreGraph.setNode(node.id, { width: estimatedWidth, height: estimatedHeight });
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
      data: {
        ...node.data,
        direction, 
      },
    };

    return newNode;
  });

  return { layoutedNodes: newNodes, layoutedEdges:edges };
};

function convertTreeToReactFlow(tree: any) {
  const nodes: any[] = [];
  const edges: any[] = [];
  const queue: any[] = [];
  // 为了删除一开始的dummy root
  for (let i = 0; i< tree.children.length; i++) {
    const newNode = {
      node: tree.children[i],
      depth: 0,
      parentId: null,
      path: `${i}`
    };
    queue.push(newNode);
  }

  while (queue.length > 0) {
    const size = queue.length;
    for (let i = 0; i < size; i++) {
      const { node, depth, parentId, path } = queue.shift();

      nodes.push({
        id: path,
        type: "markdownNode", 
        data: { label: node.raw || node.value || "Undefined" },
      });

      if (parentId) {
        edges.push({
          id: `e${parentId}-${path}`,
          source: parentId,
          target: path,
          type: "smoothstep",  // To ZSW：我发现为什么smoothStep不生效了
        });
      }

      // 将子节点加入队列，假设子节点存储在 node.children 数组中
      if (node.children && node.children.length > 0) {
        // 可以为每个子节点增加额外信息，例如当前节点的 id 作为 parentId，以及子节点的索引用于计算 y 坐标
        node.children.forEach((childNode, index) => {
          queue.push({
            node: childNode,
            depth: depth + 1,
            parentId: path,
            path: `${path}-${index}`,
          });
        });
      }
    }
  }

  return { flowNodes: nodes, flowEdges: edges };
}

const Flow = ({ layoutedNodes, layoutedEdges, colorMode, setColorMode }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);
  const { fitView } = useReactFlow();
  const prevNodeIds = useRef<string[]>([]);
  const buttonClass = (colorMode: ColorMode) =>
    `border rounded-2xl  p-2 ${colorMode === 'light' ? 'text-black bg-white border-gray' : 'text-white bg-black border-gray-200'}`;
  

  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    // 只在节点结构变化时 fitView
    const currentNodeIds = layoutedNodes.map((n => n.id)).sort()
    const prevIds = prevNodeIds.current
    // 这里不单纯只用length 比较的原因是: 如果结构，顺序变化，其实也应该冲洗fitview
    const isStructureChanged = currentNodeIds.length != prevIds.length || currentNodeIds.some((id, i) => id != prevIds[i])
    if (isStructureChanged){
      setTimeout(() => {
        fitView({
          includeHiddenNodes: false,
          padding: 0.3,
          duration: 500,
          minZoom: 0.5,
        });
      }, 100);
      prevNodeIds.current = currentNodeIds
    }
    
  }, [layoutedNodes, layoutedEdges]);
  
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
      const { layoutedNodes, layoutedEdges } =
        getLayoutedElements(nodes, edges, direction);

      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);

      setTimeout(() => {
        fitView({
          includeHiddenNodes: false,
          padding: 0.3,
          duration: 500,
          minZoom: 0.8,
        });
      }, 100);
    },
    [nodes, edges]
  );

  const onChange: ChangeEventHandler<HTMLSelectElement> = (evt) => {
    setColorMode(evt.target.value as ColorMode);
  };
 
//   useEffect(() => {
//     setNodes((prev) => 
//         prev.map((node) => {
//             const updated = layoutedNodes.find((n) => n.id === node.id);
//             if (!updated || updated.data.label === node.data.label) return node;

//             return {
//                 ...node,
//                 data: {
//                   ...node.data,
//                   label: updated.data.label,
//                 },
//             };
//         })
//     )
//   }, [layoutedNodes])

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={{ markdownNode: (nodeProps) => <RichMarkdownNode {...nodeProps} colorMode={colorMode} />}}
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
      colorMode={colorMode}
      style={{ backgroundColor: "#F7F9FB" }}
    >

      <Panel position="top-right">
        <button onClick={() => onLayout("TB")} className={`${buttonClass(colorMode)} mr-2`}>Vertical Layout</button>
        <button onClick={() => onLayout("LR")} className={`${buttonClass(colorMode)} ml-2 mr-2 `}>Horizontal Layout</button>

        <select onChange={onChange} data-testid="colormode-select"className={`${buttonClass(colorMode)} ml-2 `}>
          <option value="dark">dark</option>
          <option value="light">light</option>
          <option value="system">system</option>
        </select>
      </Panel>
      
      <MiniMap
        className="minimap dark:bg-dt-surface-a10 rounded-2xl border border-gray-200 dark:border-dt-surface-a30"
        nodeColor="#A5A6F6"
        maskColor="rgba(0, 0, 0, 0.1)"
      />
      <Controls />
      <Background />
    </ReactFlow>
  );
};

// 假设 MarkdownTree 接受 markdown 字符串作为 prop
export default function MarkdownTree({ markdown }: { markdown: string }) {
  
  const tree = parseMarkdownToTree(markdown);

  const { flowNodes, flowEdges } = convertTreeToReactFlow(tree);
  const { layoutedNodes, layoutedEdges } = getLayoutedElements(flowNodes,flowEdges);
  const [colorMode, setColorMode] = useState<ColorMode>('dark');

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* <ReactFlow nodes={nodes} edges={edges} /> */}
      <ReactFlowProvider>
        <Flow layoutedNodes={layoutedNodes} layoutedEdges={layoutedEdges} colorMode={colorMode} // 传进去
          setColorMode={setColorMode} />
      </ReactFlowProvider>
    </div>
  );
}
