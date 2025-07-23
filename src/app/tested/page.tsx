"use client"
import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle } from "react-konva";

export default function Page() {
    const lapanganWidth = 400;
    const lapanganHeight = 250;

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerSize, setContainerSize] = useState({ width: 400, height: 250 });
    const [rotation, setRotation] = useState(false);
    const [circlePos, setCirclePos] = useState({ x: 150, y: 100 });

    // Update container size
    const updateSize = () => {
        if (!containerRef.current) return;
        setContainerSize({
            width: containerRef.current.offsetWidth,
            height: containerRef.current.offsetHeight,
        });
    };

    useEffect(() => {
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    // Hitung skala agar lapangan fit ke container
    const getLapanganProps = () => {
        let scale, offsetX, offsetY, width, height;
        if (!rotation) {
            scale = Math.min(containerSize.width / lapanganWidth, containerSize.height / lapanganHeight);
            width = lapanganWidth * scale;
            height = lapanganHeight * scale;
            offsetX = (containerSize.width - width) / 2;
            offsetY = (containerSize.height - height) / 2;
        } else {
            scale = Math.min(containerSize.width / lapanganHeight, containerSize.height / lapanganWidth);
            width = lapanganHeight * scale;
            height = lapanganWidth * scale;
            offsetX = (containerSize.width - width) / 2;
            offsetY = (containerSize.height - height) / 2;
        }
        return { scale, offsetX, offsetY, width, height };
    };

    const lapanganProps = getLapanganProps();

    // Transform posisi player ke canvas
    const getPlayerCanvasPos = () => {
        if (!rotation) {
            return {
                x: lapanganProps.offsetX + circlePos.x * lapanganProps.scale,
                y: lapanganProps.offsetY + circlePos.y * lapanganProps.scale,
            };
        } else {
            // Rotasi 90 derajat searah jarum jam di tengah lapangan
            return {
                x: lapanganProps.offsetX + (lapanganHeight - circlePos.y) * lapanganProps.scale,
                y: lapanganProps.offsetY + circlePos.x * lapanganProps.scale,
            };
        }
    };

    // Saat drag, konversi posisi mouse ke posisi asli di lapangan
    const handleDragMove = (e: any) => {
        const { x, y } = e.target.position();
        if (!rotation) {
            setCirclePos({
                x: (x - lapanganProps.offsetX) / lapanganProps.scale,
                y: (y - lapanganProps.offsetY) / lapanganProps.scale,
            });
        } else {
            setCirclePos({
                x: (y - lapanganProps.offsetY) / lapanganProps.scale,
                y: lapanganHeight - (x - lapanganProps.offsetX) / lapanganProps.scale,
            });
        }
    };

    const playerCanvasPos = getPlayerCanvasPos();

    return (
        <div>
            <div className="mb-20">
                <button
                    className="mb-2 px-4 py-2 bg-blue-500 text-white rounded cursor-pointer z-50"
                    onClick={() => setRotation(!rotation)}
                >
                    Rotate Lapangan
                </button>
                <h1>Rotation : {rotation ? "True" : "False"}</h1>
            </div>
            <div
                ref={containerRef}
                className="w-[30rem] h-80 bg-red-500 mx-20 flex items-center justify-center"
                style={{ position: "relative" }}
            >
                <Stage
                    width={containerSize.width}
                    height={containerSize.height}
                >
                    <Layer>
                        {/* Lapangan */}
                        <Rect
                            x={lapanganProps.offsetX}
                            y={lapanganProps.offsetY}
                            width={lapanganProps.width}
                            height={lapanganProps.height}
                            fill="#4caf50"
                            stroke="white"
                            strokeWidth={4}
                            cornerRadius={16}
                        />
                        {/* Player */}
                        <Circle
                            x={playerCanvasPos.x}
                            y={playerCanvasPos.y}
                            radius={25 * lapanganProps.scale}
                            fill="#2196f3"
                            draggable
                            onDragMove={handleDragMove}
                            stroke="white"
                            strokeWidth={3}
                        />
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}