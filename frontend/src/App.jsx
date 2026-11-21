import { useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const API_URL = 'http://localhost:5000/items';


// Custom Milanote-style Note Card component
function NoteCard({ id, data }) {
  // Save text to SQLite the moment you click outside the note
  const handleBlur = (e) => {
    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: e.target.value }),
    });
  };

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
        onBlur={handleBlur}
        placeholder="Type a note..."
        style={{
          width: '100%',
          minHeight: '80px',
          border: 'none',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          background: 'transparent',
          color: '#1e293b',
        }}
      />
    </div>
  );
}

const nodeTypes = { noteCard: NoteCard };

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);

  // 1. Load all saved notes from SQLite when the page opens
  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((savedNodes) => setNodes(savedNodes));
  }, [setNodes]);

  // 2. Create a new note and save it immediately to SQLite
  const addNote = () => {
    const newId = String(Date.now());
    const x = Math.round(Math.random() * 300 + 150);
    const y = Math.round(Math.random() * 200 + 100);

    const newNode = {
      id: newId,
      type: 'noteCard',
      position: { x, y },
      data: { text: '' },
    };

    setNodes((nds) => [...nds, newNode]);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId, content: '', x, y }),
    });
  };

  // 3. Save the card's new (x, y) coordinates when you stop dragging it
  const onNodeDragStop = useCallback((event, node) => {
    fetch(`${API_URL}/${node.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      }),
    });
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: '#f8fafc' }}>
      {/* Milanote-style Left Sidebar */}
      <div style={{
        width: '72px',
        background: '#ffffff',
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
            color: '#1e293b',
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
          onNodeDragStop={onNodeDragStop}
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
