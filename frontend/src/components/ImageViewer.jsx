import React, { useState, useRef, useEffect } from 'react';
import { Box, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';

const ImageViewer = ({ imageUrl, title, children, onClose, isOpen = true }) => {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // Calcular los límites de arrastre basado en zoom
  const getClampedPosition = (x, y, currentZoom) => {
    if (!containerRef.current || !imageRef.current) return { x, y };

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // Tamaño de la imagen con zoom
    const baseWidth = containerWidth * 0.7;
    const baseHeight = containerHeight * 0.8;
    const scaledWidth = baseWidth * currentZoom;
    const scaledHeight = baseHeight * currentZoom;

    // Calcular máximos límites
    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    // Clampear posición
    const clampedX = Math.max(-maxX, Math.min(maxX, x));
    const clampedY = Math.max(-maxY, Math.min(maxY, y));

    return { x: clampedX, y: clampedY };
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const newZoom = Math.max(1, Math.min(10, zoom + (e.deltaY < 0 ? 0.2 : -0.2)));
    setZoom(newZoom);

    // Mantener posición dentro de límites con nuevo zoom
    const clamped = getClampedPosition(position.x, position.y, newZoom);
    setPosition(clamped);
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Solo clic izquierdo
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    const clamped = getClampedPosition(newX, newY, zoom);
    setPosition(clamped);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    const newZoom = Math.min(10, zoom + 0.2);
    setZoom(newZoom);
    const clamped = getClampedPosition(position.x, position.y, newZoom);
    setPosition(clamped);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(1, zoom - 0.2);
    setZoom(newZoom);
    const clamped = getClampedPosition(position.x, position.y, newZoom);
    setPosition(clamped);
  };

  return (
    <Box sx={{ cursor: 'pointer', display: 'inline-flex' }}>
      {children}

      <Modal
        open={isOpen}
        onClose={onClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'rgba(0, 0, 0, 0.9)',
          zIndex: 1300,
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            position: 'relative',
            width: '98vw',
            height: '98vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            userSelect: 'none',
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Imagen */}
          <img
            ref={imageRef}
            src={imageUrl}
            alt={title}
            style={{
              maxWidth: '70vw',
              maxHeight: '80vh',
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              cursor: isDragging ? 'grabbing' : zoom > 1 ? 'grab' : 'default',
              transition: isDragging ? 'none' : 'transform 0.05s ease-out',
              pointerEvents: 'none',
            }}
            draggable={false}
          />

          {/* Botón cerrar */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: '#ffffff',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.8)',
              },
            }}
            title="Cerrar"
          >
            <CloseIcon />
          </IconButton>

          {/* Controles de zoom */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 24,
              right: 24,
              display: 'flex',
              gap: 1,
              flexDirection: 'column',
            }}
          >
            <IconButton
              onClick={handleZoomIn}
              disabled={zoom >= 10}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                '&:disabled': { opacity: 0.5 },
              }}
              title="Zoom in"
            >
              <AddIcon />
            </IconButton>
            <Box
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {Math.round(zoom * 100)}%
            </Box>
            <IconButton
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.8)' },
                '&:disabled': { opacity: 0.5 },
              }}
              title="Zoom out"
            >
              <RemoveIcon />
            </IconButton>
          </Box>

          {/* Información de controles */}
          {zoom > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
              }}
            >
              🖱️ Arrastra para mover
            </Box>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default ImageViewer;
