import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

// Custom Milanote-style Note Card component
function NoteCard({ data }) {
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      padding: '12px',
      width: '220px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    }}>
      <textarea
        className="nodrag"
        defaultValue={data.text}
        placeholder="Type a note..."
        style={{
          width: '100%',
          minHeight: '80px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'sans-serif',
          fontSize: '14px',
        }}
      />
    </div>
  );
}

const nodeTypes = { noteCard: NoteCard };

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: '1',
      type: 'noteCard',
      position: { x: 250, y: 150 },
      data: { text: 'Welcome to your infinite board! Drag me or type here.' },
    },
  ]);

  const addNote = () => {
    const newNode = {
      id: String(Date.now()),
      type: 'noteCard',
      position: { x: Math.random() * 300 + 150, y: Math.random() * 200 + 100 },
      data: { text: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      {/* Milanote-style Left Sidebar */}
      <div style={{
        width: '72px',
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '20px',
        gap: '12px',
        zIndex: 10,
      }}>
        <button
          onClick={addNote}
          style={{
            padding: '10px 8px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          + Note
        </button>
      </div>

      {/* Infinite Dot-Grid Canvas */}
      <div style={{ flex: 1, height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          deleteKeyCode={null}
        >
          <Background variant="dots" gap={20} size={1} color="#cbd5e1" />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

