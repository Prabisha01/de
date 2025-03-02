import { useGesture } from "@use-gesture/react";
import React, { useCallback, useRef } from "react";

const CanvasElement = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onContentChange,
  drawingMode,
}) => {
  const elementRef = useRef(null);

  const bind = useGesture({
    onDrag: ({ movement: [dx, dy] }) => {
      if (!drawingMode && isSelected) {
        onUpdate({
          ...element,
          position: {
            x: element.position.x + dx,
            y: element.position.y + dy,
          },
        });
      }
    },
  });

  // Improved text editing
  const handleTextChange = useCallback(
    (e) => {
      const newContent = e.target.innerText;
      setContent(newContent);
      // Debounced update
      setTimeout(() => {
        onUpdate({ ...element, content: newContent });
      }, 1000);
    },
    [element, onUpdate]
  );

  // Handle dragging
  const handleDrag = useCallback(
    ({ movement: [dx, dy] }) => {
      const newPos = {
        x: element.position.x + dx,
        y: element.position.y + dy,
      };
      onUpdate({ ...element, position: newPos });
    },
    [element, onUpdate]
  );

  // Handle resizing
  const handleResize = useCallback(
    ({ movement: [dw, dh] }) => {
      const newSize = {
        width: element.size.width + dw,
        height: element.size.height + dh,
      };
      onUpdate({ ...element, size: newSize });
    },
    [element, onUpdate]
  );

  // Add gesture controls
  useGesture(
    {
      onDragStart: () => !drawingMode && onSelect(element._id),
      onDrag: handleDrag,
      onResize: handleResize,
    },
    { target: elementRef }
  );

  const renderContent = () => {
    switch (element.type) {
      case "text":
        return (
          <div
            className="w-full h-full p-2 outline-none"
            contentEditable={!drawingMode}
            onBlur={(e) => onContentChange(element._id, e.target.innerText)}
            suppressContentEditableWarning
          >
            {element.content}
          </div>
        );

      case "image":
        return (
          <img
            src={element.src}
            alt="Canvas content"
            className="w-full h-full object-contain"
          />
        );

      case "pdf":
        return (
          <div className="pdf-container">
            <Document file={element.url}>
              <Page pageNumber={1} width={element.size.width} />
            </Document>
          </div>
        );

      case "audio":
        return (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <audio controls src={element.url} />
          </div>
        );

      default:
        return null;
    }
  };

  const handleImageError = (e) => {
    console.error("Failed to load image:", element.src);
    e.target.style.display = "none";
  };

  return (
    <div
      {...bind()}
      ref={elementRef}
      className={`absolute ${isSelected ? "ring-2 ring-blue-500" : ""}`}
      style={{
        top: `${element.position.y}px`,
        left: `${element.position.x}px`,
        width: `${element.size.width}px`,
        height: `${element.size.height}px`,
      }}
    >
      {element.type === "text" && (
        <div
          className="w-full h-full p-2 outline-none bg-transparent"
          contentEditable={!drawingMode}
          onInput={handleTextChange}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {element.type === "image" && (
        <img
          src={element.src}
          alt="canvas-content"
          className="w-full h-full object-contain"
          onError={handleImageError}
        />
      )}

      {element.type === "pdf" && renderPDF()}

      {element.type === "audio" && (
        <audio controls src={element.url} className="w-full h-full" />
      )}
    </div>
  );
};

export default CanvasElement;
