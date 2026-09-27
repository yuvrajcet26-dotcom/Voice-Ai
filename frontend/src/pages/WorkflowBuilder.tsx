import React, { useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Network, Play, Save, CheckCircle, RotateCcw, Plus,
  Sliders, MessageSquare, PhoneCall, Building, Users, Clock, PhoneForwarded
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '📞 START: Inbound Real Call Received' },
    position: { x: 250, y: 0 },
    style: { background: '#1e3a8a', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold' }
  },
  {
    id: '2',
    data: { label: '🎙️ Speech-To-Text & Language (Whisper Large-v3)' },
    position: { x: 220, y: 80 },
    style: { background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '12px', fontWeight: '600' }
  },
  {
    id: '3',
    data: { label: '🏫 School & Course Entity Extraction (STME / SOC / SPO)' },
    position: { x: 200, y: 160 },
    style: { background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '12px', fontWeight: '600' }
  },
  {
    id: '4',
    data: { label: '❓ Intent: Admission Inquiry or Counselor Requested?' },
    position: { x: 200, y: 240 },
    style: { background: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '12px', fontWeight: 'bold' }
  },
  {
    id: '5',
    data: { label: '📚 Knowledge Lookup: Verified SVKM Database Facts' },
    position: { x: 40, y: 340 },
    style: { background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px', fontWeight: '600' }
  },
  {
    id: '6',
    data: { label: '⏰ Check University Working Hours (Asia/Kolkata)' },
    position: { x: 380, y: 340 },
    style: { background: '#fef2f2', border: '1px solid #ef4444', borderRadius: '12px', fontWeight: '600' }
  },
  {
    id: '7',
    data: { label: '👥 Find School-Specific Counselor Pool (STME)' },
    position: { x: 480, y: 430 },
    style: { background: '#eff6ff', border: '1px solid #3b82f6', borderRadius: '12px', fontWeight: '600' }
  },
  {
    id: '8',
    data: { label: '🔔 Multi-Channel Notification (Dashboard, Email, SMS)' },
    position: { x: 480, y: 510 },
    style: { background: '#fdf4ff', border: '1px solid #d946ef', borderRadius: '12px', fontWeight: '600' }
  },
  {
    id: '9',
    data: { label: '🔒 Atomic First-Acceptance Lock (Tx Protected)' },
    position: { x: 480, y: 590 },
    style: { background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '12px', fontWeight: 'bold' }
  },
  {
    id: '10',
    data: { label: '📲 Live Call Transfer to Counselor Mobile' },
    position: { x: 480, y: 670 },
    style: { background: '#059669', color: '#fff', borderRadius: '12px', border: 'none', fontWeight: 'bold' }
  },
  {
    id: '11',
    data: { label: '📝 Schedule Priority Callback Request' },
    position: { x: 260, y: 430 },
    style: { background: '#faf5ff', border: '1px solid #a855f7', borderRadius: '12px', fontWeight: '600' }
  }
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', label: 'Knowledge FAQ', animated: true },
  { id: 'e4-6', source: '4', target: '6', label: 'Counselor Required', animated: true },
  { id: 'e6-7', source: '6', target: '7', label: 'Open (Working Hours)', animated: true },
  { id: 'e6-11', source: '6', target: '11', label: 'Closed / Holiday', animated: true },
  { id: 'e7-8', source: '7', target: '8', animated: true },
  { id: 'e8-9', source: '8', target: '9', animated: true },
  { id: 'e9-10', source: '9', target: '10', animated: true }
];

export const WorkflowBuilder: React.FC = () => {
  const { role } = useAuth();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.workflows.save({
        name: 'SVKM Standard Admission Voice Flow',
        description: 'Production multilingual admission routing graph',
        nodes_json: JSON.stringify(nodes),
        edges_json: JSON.stringify(edges),
        status: 'PUBLISHED'
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save workflow');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNode = (type: string, label: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      data: { label },
      position: { x: 250, y: nodes.length * 60 },
      style: { background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', fontWeight: '600' }
    };
    setNodes((nds) => nds.concat(newNode));
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Interactive Workflow Builder</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
              Active Production Flow v2.4
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Visual graph builder powered by React Flow. Modify dialogue branches, working hours checkpoints, and counselor routing rules.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" /> Published for Live Callers
            </span>
          )}

          {role === 'MAIN_ADMIN' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 active:scale-[0.98]"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Publishing...' : 'Save & Publish Workflow'}
            </button>
          )}
        </div>
      </div>

      {/* React Flow Canvas Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <Background color="#cbd5e1" gap={16} />
        </ReactFlow>

        {/* Floating Quick Node Add Palette */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur p-2 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-1 z-10 text-xs">
          <span className="text-[10px] font-bold text-slate-400 px-2 uppercase tracking-wider">+ Add Step:</span>
          <button
            type="button"
            onClick={() => handleAddNode('message', '💬 Announcement Message')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-medium"
          >
            Announcement
          </button>
          <button
            type="button"
            onClick={() => handleAddNode('hours', '⏰ Working Hours Gate')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-medium"
          >
            Working Hours
          </button>
          <button
            type="button"
            onClick={() => handleAddNode('counselor', '👥 Counselor Pool Filter')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 font-medium"
          >
            Counselor Pool
          </button>
        </div>
      </div>
    </div>
  );
};
