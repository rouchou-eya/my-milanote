import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const API_URL = 'http://localhost:5000/items';

const CUTE_PRESETS = [
  { name: 'Pure White', bg: '#ffffff', border: '#e2e8f0' },
  { name: 'Blush Pink', bg: '#fff1f2', border: '#fecdd3' },
  { name: 'Warm Cream', bg: '#fefce8', border: '#fef08a' },
  { name: 'Soft Sage', bg: '#f0fdf4', border: '#bbf7d0' },
  { name: 'Sky Mist', bg: '#f0f9ff', border: '#bae6fd' },
  { name: 'Lavender', bg: '#faf5ff', border: '#e9d5ff' },
  { name: 'Peach Sunset', bg: 'linear-gradient(135deg, #fff1f2 0%, #fefce8 100%)', border: '#fecdd3' },
  { name: 'Cotton Candy', bg: 'linear-gradient(135deg, #fdf2f8 0%, #eff6ff 100%)', border: '#fbcfe8' },
  { name: 'Mint Dream', bg: 'linear-gradient(135deg, #f0fdf4 0%, #f0f9ff 100%)', border: '#bbf7d0' },
];

const BOARD_THEMES = [
  { name: 'Soft Blush', bg: '#fdf8fa', dots: '#f9a8d4' },
  { name: 'Warm Paper', bg: '#faf8f5', dots: '#d6d3d1' },
  { name: 'Mint Cloud', bg: '#f4fbf7', dots: '#86efac' },
  { name: 'Dreamy Lavender', bg: '#f8f5ff', dots: '#d8b4fe' },
  { name: 'Midnight Dark', bg: '#18181b', dots: '#3f3f46' },
];

const TEXT_COLORS = ['#1e293b', '#be185d', '#0369a1', '#15803d', '#7e22ce'];

const FONTS = [
  { label: 'Sans', value: 'system-ui, -apple-system, sans-serif' },
  { label: 'Serif', value: 'Georgia, serif' },
  { label: 'Mono', value: '"Courier New", monospace' },
];

function parseNoteData(rawContent) {
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed && typeof parsed === 'object' && 'text' in parsed) return parsed;
  } catch {
    // Compatibility for plain text notes
  }
  return {
    text: rawContent || '',
    customBg: '#ffffff',
    borderColor: '#e2e8f0',
    shape: 'rounded',
    isHeadline: false,
    fontIdx: 0,
    textColor: '#1e293b',
  };
}

function NoteCard({ id, data, selected }) {
  const [styleState, setStyleState] = useState(() => parseNoteData(data.rawContent));
  const textareaRef = useRef(null);

  const persist = (nextState, el = textareaRef.current) => {
    setStyleState(nextState);
    fetch(API_URL + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: JSON.stringify(nextState),
        width: el ? el.offsetWidth : data.width,
        height: el ? el.offsetHeight : data.height,
      }),
    });
  };

  const cardBg = styleState.customBg || '#ffffff';
  const cardBorder = styleState.borderColor || '#e2e8f0';

  const toolBtnStyle = {
    fontSize: '11px',
    fontWeight: '600',
    color: '#1e293b',
    padding: '3px 7px',
    borderRadius: '5px',
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    cursor: 'pointer',
  };

  return (
    <div style={{ position: 'relative' }}>
      {selected && (
        <div
          className="nodrag"
          style={{
            position: 'absolute',
            top: '-44px',
            left: '0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '5px 8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 50,
            whiteSpace: 'nowrap',
          }}
        >
          <button
            onClick={() => persist({ ...styleState, isHeadline: !styleState.isHeadline })}
            style={{
              ...toolBtnStyle,
              background: styleState.isHeadline ? '#fce7f3' : '#f8fafc',
            }}
            title="Toggle Headline"
          >
            H1
          </button>

          <button
            onClick={() => persist({ ...styleState, fontIdx: (styleState.fontIdx + 1) % FONTS.length })}
            style={toolBtnStyle}
            title="Switch Font"
          >
            {FONTS[styleState.fontIdx].label}
          </button>

          <button
            onClick={() =>
              persist({ ...styleState, shape: styleState.shape === 'rounded' ? 'square' : 'rounded' })
            }
            style={toolBtnStyle}
            title="Toggle Rounded vs Square"
          >
            {styleState.shape === 'rounded' ? '▢ Round' : '□ Square'}
          </button>

          <span style={{ color: '#cbd5e1' }}>|</span>

          {/* Cute solid + gradient card swatches */}
          {CUTE_PRESETS.map((c) => (
            <button
              key={c.name}
              onClick={() => persist({ ...styleState, customBg: c.bg, borderColor: c.border })}
              title={c.name}
              style={{
                width: '15px',
                height: '15px',
                borderRadius: '50%',
                background: c.bg,
                border: cardBg === c.bg ? '2px solid #475569' : '1px solid ' + c.border,
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}

          {/* Interactive RGB Color Wheel for Card Background */}
          <label
            title="Custom RGB Card Color"
            style={{
              width: '16px',
              height: '16px',
              borderRadius: '50%',
              background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              overflow: 'hidden',
              display: 'inline-block',
            }}
          >
            <input
              type="color"
              value={cardBg.startsWith('#') ? cardBg : '#ffffff'}
              onChange={(e) => persist({ ...styleState, customBg: e.target.value, borderColor: '#cbd5e1' })}
              style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
            />
          </label>

          <span style={{ color: '#cbd5e1' }}>|</span>

          {/* Text colors */}
          {TEXT_COLORS.map((tc) => (
            <button
              key={tc}
              onClick={() => persist({ ...styleState, textColor: tc })}
              title="Text Color"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: tc,
                border: styleState.textColor === tc ? '2px solid #94a3b8' : 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}

      <div
        style={{
          background: cardBg,
          border: '1.5px solid ' + (selected ? '#f472b6' : cardBorder),
          borderRadius: styleState.shape === 'rounded' ? '12px' : '0px',
          padding: '8px 12px 12px 12px',
          width: 'fit-content',
          boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
          transition: 'border-radius 0.15s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2px' }}>
          <button
            className="nodrag"
            onClick={() => data.onDelete(id)}
            title="Delete note"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              lineHeight: '1',
              padding: '0 2px',
            }}
          >
            ×
          </button>
        </div>

        <textarea
          ref={textareaRef}
          className="nodrag"
          defaultValue={styleState.text}
          onBlur={(e) => persist({ ...styleState, text: e.target.value }, e.target)}
          onMouseUp={(e) => persist({ ...styleState, text: e.target.value }, e.target)}
          placeholder={styleState.isHeadline ? 'Headline...' : 'Type a note...'}
          style={{
            display: 'block',
            width: (data.width || 200) + 'px',
            height: (data.height || 80) + 'px',
            minWidth: '140px',
            minHeight: '50px',
            border: 'none',
            outline: 'none',
            resize: 'both',
            fontFamily: FONTS[styleState.fontIdx].value,
            fontSize: styleState.isHeadline ? '20px' : '14px',
            fontWeight: styleState.isHeadline ? '700' : '400',
            color: styleState.textColor,
            background: 'transparent',
          }}
        />
      </div>
    </div>
  );
}

const nodeTypes = { noteCard: NoteCard };

function CanvasBoard() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [boardBg, setBoardBg] = useState('#fdf8fa');
  const [dotColor, setDotColor] = useState('#f9a8d4');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const { screenToFlowPosition, zoomTo } = useReactFlow();

  const deleteNote = useCallback((id) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    fetch(API_URL + '/' + id, { method: 'DELETE' });
  }, [setNodes]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((savedNodes) =>
        setNodes(
          savedNodes.map((n) => ({
            ...n,
            data: {
              rawContent: n.data.text,
              width: n.data.width,
              height: n.data.height,
              onDelete: deleteNote,
            },
          }))
        )
      );
  }, [setNodes, deleteNote]);

  const createNoteAt = (x, y) => {
    const newId = String(Date.now());
    const initialPayload = JSON.stringify({
      text: '',
      customBg: '#ffffff',
      borderColor: '#e2e8f0',
      shape: 'rounded',
      isHeadline: false,
      fontIdx: 0,
      textColor: '#1e293b',
    });

    const newNode = {
      id: newId,
      type: 'noteCard',
      position: { x, y },
      data: { rawContent: initialPayload, width: 200, height: 80, onDelete: deleteNote },
    };

    setNodes((nds) => [...nds, newNode]);

    fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: newId, content: initialPayload, x, y, width: 200, height: 80 }),
    });
  };

  const handleSidebarClick = () => {
    const pos = screenToFlowPosition({
      x: window.innerWidth / 2 - 100,
      y: window.innerHeight / 2 - 50,
    });
    createNoteAt(Math.round(pos.x), Math.round(pos.y));
  };

  const handleDropOnCanvas = (e) => {
    e.preventDefault();
    const itemType = e.dataTransfer.getData('application/reactflow');
    if (itemType === 'noteCard') {
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      createNoteAt(Math.round(pos.x), Math.round(pos.y));
    }
  };

  const onNodeDragStop = useCallback((event, node) => {
    fetch(API_URL + '/' + node.id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        x: Math.round(node.position.x),
        y: Math.round(node.position.y),
      }),
    });
  }, []);

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', background: boardBg }}>
      {/* Compact Left Sidebar: + quick add, draggable Note icon */}
      <div
        style={{
          width: '64px',
          background: '#ffffff',
          borderRight: '1px solid #fce7f3',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '20px',
          gap: '18px',
          zIndex: 10,
        }}
      >
        {/* + quick add */}
        <button
          onClick={handleSidebarClick}
          title="Add note"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            border: 'none',
            background: '#db2777',
            color: '#ffffff',
            fontSize: '22px',
            lineHeight: '1',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          +
        </button>

        {/* Note icon: only the icon is draggable */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            userSelect: 'none',
          }}
        >
          <div
            draggable
            onDragStart={(e) => e.dataTransfer.setData('application/reactflow', 'noteCard')}
            title="Drag onto board"
            style={{ cursor: 'grab', lineHeight: 0 }}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="#fff1f2" stroke="#db2777" strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="13" y2="17" />
            </svg>
          </div>
          <span style={{ fontSize: '11px', fontWeight: '600', color: '#475569' }}>Note</span>
        </div>
      </div>

      {/* Infinite Canvas */}
      <div
        style={{ flex: 1, height: '100%', position: 'relative' }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnCanvas}
      >
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          onMove={(_, viewport) => setZoomPercent(Math.round(viewport.zoom * 100))}
          nodesConnectable={false}
          nodeTypes={nodeTypes}
          deleteKeyCode={null}
          colorMode="light"
          style={{ background: boardBg }}
        >
          <Background variant="dots" gap={20} size={1.2} color={dotColor} />

          {/* Minimalist Vertical Controls + Board Color Button */}
          <Controls position="bottom-left" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              className="react-flow__controls-button"
              onClick={() => setShowBgPicker(!showBgPicker)}
              title="Board Background Color"
              style={{ fontSize: '13px' }}
            >
              🎨
            </button>
          </Controls>
        </ReactFlow>

        {/* Board Background Color Popover */}
        {showBgPicker && (
          <div
            style={{
              position: 'absolute',
              bottom: '18px',
              left: '58px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '8px 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              zIndex: 30,
            }}
          >
            {BOARD_THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => {
                  setBoardBg(t.bg);
                  setDotColor(t.dots);
                }}
                title={t.name}
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: t.bg,
                  border: boardBg === t.bg ? '2px solid #db2777' : '1px solid #cbd5e1',
                  cursor: 'pointer',
                  padding: 0,
                }}
              />
            ))}
            <label
              title="Custom Board RGB Color"
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <input
                type="color"
                value={boardBg}
                onChange={(e) => {
                  setBoardBg(e.target.value);
                  setDotColor('#cbd5e1');
                }}
                style={{ opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }}
              />
            </label>
          </div>
        )}

        {/* Bottom-Center Live Zoom Percentage Indicator */}
        <button
          onClick={() => zoomTo(1)}
          title="Click to reset zoom to 100%"
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #e2e8f0',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#475569',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
            zIndex: 20,
          }}
        >
          {zoomPercent}%
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasBoard />
    </ReactFlowProvider>
  );
}
