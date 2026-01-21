import { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    ConnectionLineType,
    Position,
    ReactFlowProvider,
    type Edge,
    type Node,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Network } from 'lucide-react';
import axios from 'axios';

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));

    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);

        // adjust to center
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We differ slightly to ensure exact position
        return {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        };
    });

    return { nodes: layoutedNodes, edges };
};

interface MindMapNode {
    id: string;
    label: string;
    parentId: string | null;
}

interface MindMapDialogProps {
    noteId?: string;
    content?: string;
    trigger?: React.ReactNode;
}

export function MindMapDialog({ noteId, content, trigger }: MindMapDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const generateAndLayout = async () => {
        setIsLoading(true);
        try {
            // 1. Fetch raw structure
            const response = await axios.post('http://localhost:5000/api/notes/mindmap', {
                noteId,
                content
            });

            const rawData: MindMapNode[] = response.data;

            // 2. Transform to React Flow
            const initialNodes: Node[] = rawData.map(item => ({
                id: item.id,
                data: { label: item.label },
                position: { x: 0, y: 0 }, // Laid out later
                type: item.parentId === null ? 'input' : 'default', // Root is input
                style: {
                    background: '#fff',
                    border: '1px solid #777',
                    borderRadius: '8px',
                    padding: '10px',
                    minWidth: '150px',
                    textAlign: 'center'
                }
            }));

            const initialEdges: Edge[] = rawData
                .filter(item => item.parentId !== null)
                .map(item => ({
                    id: `e${item.parentId}-${item.id}`,
                    source: item.parentId!,
                    target: item.id,
                    type: ConnectionLineType.SmoothStep,
                    animated: true,
                    style: { stroke: '#888' }
                }));

            // 3. Apply Dagre Layout
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                initialNodes,
                initialEdges
            );

            setNodes(layoutedNodes);
            setEdges(layoutedEdges);

        } catch (error) {
            console.error("Failed to generate mind map", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-generate on open if empty
    useEffect(() => {
        if (isOpen && nodes.length === 0 && !isLoading) {
            generateAndLayout();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Network className="mr-2 h-4 w-4" /> Mind Map
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Mind Map View</DialogTitle>
                </DialogHeader>

                <div className="flex-1 w-full h-full bg-slate-50 relative border rounded-md">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 bg-white/50">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Generating Mind Map with AI...</p>
                        </div>
                    ) : (
                        <ReactFlowProvider>
                            <ReactFlow
                                nodes={nodes}
                                edges={edges}
                                onNodesChange={onNodesChange}
                                onEdgesChange={onEdgesChange}
                                fitView
                            >
                                <Background />
                                <Controls />
                            </ReactFlow>
                        </ReactFlowProvider>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <Button variant="secondary" onClick={generateAndLayout} disabled={isLoading}>
                        Regenerate
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
