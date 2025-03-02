import { PDFViewer } from "@react-pdf/renderer";
import { useGesture } from "@use-gesture/react";
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";

const Canvas = ({ boardId, drawingMode }) => {
  const [elements, setElements] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  const [drawingPath, setDrawingPath] = useState([]);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const { user } = useContext(AuthContext);

  // Fetch elements on mount and when boardId changes
  useEffect(() => {
    const fetchElements = async () => {
      try {
        const res = await axios.get(`/api/v1/boards/${boardId}/elements`, {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setElements(res.data);
      } catch (err) {
        console.error("Error fetching elements:", err);
      }
    };
    fetchElements();
  }, [boardId, user?.token]);

  // Setup drawing canvas
  useEffect(() => {
    if (drawingMode) {
      const canvas = canvasRef.current;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ctx = canvas.getContext("2d");
      ctx.lineCap = "round";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 2;
      contextRef.current = ctx;
    }
  }, [drawingMode]);

  // Handle drawing
  const handleDrawing = (e) => {
    if (!drawingMode || !contextRef.current) return;

    const { offsetX, offsetY } = e.nativeEvent;

    if (e.type === "mousedown") {
      setDrawingPath([{ x: offsetX, y: offsetY }]);
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
    } else if (e.type === "mousemove" && drawingPath.length > 0) {
      setDrawingPath((prev) => [...prev, { x: offsetX, y: offsetY }]);
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    } else if (e.type === "mouseup") {
      // Save drawing as an element
      const newElement = {
        type: "drawing",
        path: drawingPath,
        position: { x: 0, y: 0 },
        size: {
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        },
        style: {
          color: contextRef.current.strokeStyle,
          width: contextRef.current.lineWidth,
        },
      };
      setElements((prev) => [...prev, newElement]);
      setDrawingPath([]);
    }
  };

  // Common element drag handler
  const handleElementDrag = (id, newPos) => {
    setElements(
      elements.map((el) => (el.id === id ? { ...el, position: newPos } : el))
    );
  };

  // Element selection handler
  const handleSelect = (id) => {
    if (!drawingMode) {
      setSelectedElement(id === selectedElement ? null : id);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main elements container */}
      <div className="relative w-full h-full">
        {elements.map((element) => (
          <CanvasElement
            key={element.id}
            element={element}
            isSelected={selectedElement === element.id}
            onSelect={handleSelect}
            onDrag={handleElementDrag}
          />
        ))}
      </div>

      {/* Drawing canvas overlay */}
      {drawingMode && (
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 z-50 touch-none"
          onMouseDown={handleDrawing}
          onMouseMove={handleDrawing}
          onMouseUp={handleDrawing}
        />
      )}
    </div>
  );
};

const CanvasElement = ({ element, isSelected, onSelect, onDrag }) => {
  const elementRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useGesture(
    {
      onDragStart: () => {
        if (element.type !== "drawing") {
          setIsDragging(true);
          onSelect(element.id);
        }
      },
      onDrag: ({ movement: [mx, my] }) => {
        if (isDragging && element.type !== "drawing") {
          const rect = elementRef.current.getBoundingClientRect();
          onDrag(element.id, {
            x: rect.x + mx,
            y: rect.y + my,
          });
        }
      },
      onDragEnd: () => setIsDragging(false),
    },
    { target: elementRef }
  );

  const renderElement = () => {
    switch (element.type) {
      case "text":
        return (
          <div
            className="p-2 cursor-move"
            style={{
              fontSize: element.style?.fontSize,
              color: element.style?.color,
            }}
          >
            {element.content}
          </div>
        );

      case "image":
        return (
          <img
            src={element.src}
            alt="Canvas image"
            className="max-w-full h-auto object-contain"
          />
        );

      case "pdf":
        return (
          <PDFViewer width={element.size.width} height={element.size.height}>
            <Document file={element.url} />
          </PDFViewer>
        );

      case "audio":
        return (
          <div className="bg-gray-100 p-2 rounded-lg">
            <audio controls src={element.url} />
          </div>
        );

      case "link":
        return (
          <a
            href={element.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {element.content || element.url}
          </a>
        );

      case "drawing":
        return (
          <svg className="absolute w-full h-full">
            <path
              d={element.path
                .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
                .join(" ")}
              stroke={element.style.color}
              strokeWidth={element.style.width}
              fill="none"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={elementRef}
      className={`absolute transition-transform ${
        isSelected ? "ring-2 ring-blue-500" : ""
      } ${element.type !== "drawing" ? "cursor-move" : ""}`}
      style={{
        transform: `translate(${element.position.x}px, ${element.position.y}px)`,
        width: element.size?.width,
        height: element.size?.height,
      }}
    >
      {renderElement()}
    </div>
  );
};

export default Canvas;
