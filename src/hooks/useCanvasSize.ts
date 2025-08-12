import { useState, useLayoutEffect, useMemo, RefObject } from 'react';

interface CanvasSize {
  width: number;
  height: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

export function useCanvasSize(
  containerRef: RefObject<HTMLDivElement | null>,
  orientation: 'horizontal' | 'vertical'
): CanvasSize {
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const BASE_WIDTH = 900;
  const BASE_HEIGHT = 480;

  const canvasSize = useMemo(() => {
    if (containerSize.width === 0 || containerSize.height === 0) {
      return {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        scale: 1,
        containerWidth: 0,
        containerHeight: 0,
      };
    }

    let targetWidth: number;
    let targetHeight: number;
    let calculatedScale: number;

    if (orientation === 'horizontal') {
      targetWidth = BASE_WIDTH;
      targetHeight = BASE_HEIGHT;
      calculatedScale = 1;
      
    } else {
      targetWidth = BASE_HEIGHT;
      targetHeight = BASE_WIDTH;
      
      const padding = 40;
      const availableWidth = containerSize.width - padding;
      const availableHeight = containerSize.height - padding;
      
      const scaleX = availableWidth / targetWidth;
      const scaleY = availableHeight / targetHeight;
      calculatedScale = Math.min(scaleX, scaleY);
    }

    calculatedScale = Math.max(calculatedScale, 0.1);

    const finalWidth = orientation === 'horizontal' ? BASE_WIDTH : targetWidth * calculatedScale;
    const finalHeight = orientation === 'horizontal' ? BASE_HEIGHT : targetHeight * calculatedScale;

    return {
      width: finalWidth,
      height: finalHeight,
      scale: calculatedScale,
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
    };
  }, [orientation, containerSize.width, containerSize.height, BASE_WIDTH, BASE_HEIGHT]);

  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    function updateContainerSize() {
      if (!containerRef?.current) return;
      
      const rect = containerRef?.current.getBoundingClientRect();
      const newWidth = rect.width;
      const newHeight = rect.height;
      
      setContainerSize(prev => {
        if (prev.width === 0 || prev.height === 0) {
          return { width: newWidth, height: newHeight };
        }
        
        const widthChange = Math.abs(prev.width - newWidth);
        const heightChange = Math.abs(prev.height - newHeight);
        
        if (widthChange > 20 || heightChange > 20) {
          return { width: newWidth, height: newHeight };
        }
        
        return prev;
      });
    }
    updateContainerSize();

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateContainerSize, 100);
    };

    let observer: ResizeObserver | null = null;
    if (containerRef?.current) {
      observer = new ResizeObserver(debouncedUpdate);
      observer.observe(containerRef?.current);
    }

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [containerRef]);

  useLayoutEffect(() => {
    if (containerRef?.current) {
      const rect = containerRef?.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [orientation, containerRef]);

  return canvasSize;
}