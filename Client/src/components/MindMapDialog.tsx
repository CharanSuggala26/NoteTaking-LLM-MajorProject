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
    MarkerType,
} from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Loader2, Network, RefreshCw, ZoomIn } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const nodeWidth = 180;
const nodeHeight = 50;

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

        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

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
            const response = await axios.post('http://localhost:5000/api/notes/mindmap', {
                noteId,
                content
            });

            const rawData: MindMapNode[] = response.data;

            const initialNodes: Node[] = rawData.map(item => ({
                id: item.id,
                data: { label: item.label },
                position: { x: 0, y: 0 },
                type: item.parentId === null ? 'input' : 'default',
                style: {
                    background: item.parentId === null ? '#fff' : '#f8fafc',
                    color: item.parentId === null ? '#000' : '#334155',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    minWidth: '160px',
                    textAlign: 'center',
                    fontSize: item.parentId === null ? '16px' : '14px',
                    fontWeight: item.parentId === null ? '600' : '400',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
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
                    style: { stroke: '#cbd5e1', strokeWidth: 2 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#cbd5e1',
                    },
                }));

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

    useEffect(() => {
        if (isOpen && nodes.length === 0 && !isLoading) {
            generateAndLayout();
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className='rounded-full'>
                        <Network className="mr-2 h-4 w-4" /> Mind Map
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] flex flex-col bg-background/95 backdrop-blur-xl border-border/50 shadow-2xl p-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex flex-row items-center justify-between space-y-0">
                    <DialogTitle className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-md">
                            <Network className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                        </div>
                        AI Mind Map
                    </DialogTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={generateAndLayout} disabled={isLoading} className="h-8">
                            <RefreshCw className={`mr-2 h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            Regenerate
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 w-full h-full relative bg-slate-50 dark:bg-slate-950/50">
                    <AnimatePresence>
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-20 bg-background/60 backdrop-blur-sm"
                            >
                                <div className="relative">
                                    <div className="h-12 w-12 rounded-full border-4 border-muted"></div>
                                    <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                                </div>
                                <p className="text-sm font-medium text-muted-foreground animate-pulse">Structuring your thoughts...</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <ReactFlowProvider>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            fitView
                            className="bg-slate-50 dark:bg-slate-900"
                        >
                            <Background color="#94a3b8" gap={20} size={1} className="opacity-20" />
                            <Controls className="bg-white dark:bg-slate-800 border-border shadow-sm p-1 rounded-lg" />
                        </ReactFlow>
                    </ReactFlowProvider>
                </div>
            </DialogContent>
        </Dialog>
    );
}
