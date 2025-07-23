import { useState, useLayoutEffect } from 'react';

interface CanvasSize {
  width: number;
  height: number;
  scale: number;
  containerWidth: number;
  containerHeight: number;
}

export function useCanvasSize(
  containerRef: React.RefObject<HTMLDivElement>,
  orientation: 'horizontal' | 'vertical'
): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({
    width: 900,
    height: 480,
    scale: 1,
    containerWidth: 900,
    containerHeight: 480,
  });

  useLayoutEffect(() => {
    function updateSize() {
      if (!containerRef.current) return;

      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const baseWidth = 900;
      const baseHeight = 480;

      const width = orientation === 'horizontal' ? baseWidth : baseHeight;
      const height = orientation === 'horizontal' ? baseHeight : baseWidth;

      const scale = Math.min(
        containerWidth / width,
        containerHeight / height
      );

      setSize({
        width,
        height,
        scale,
        containerWidth,
        containerHeight,
      });
    }

    updateSize();

    let observer: ResizeObserver | null = null;
    if (containerRef.current) {
      observer = new ResizeObserver(updateSize);
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      if (observer && containerRef.current) observer.disconnect();
    };
  }, [containerRef, orientation]);

  return size;
}