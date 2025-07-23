"use client"

import { Circle, Group, Layer, Line, Rect, Stage } from "react-konva";

interface PreviewBoardProps {
    boardData: any;
    width?: number;
    height?: number;
}

export default function PreviewBoard({ boardData, width = 200, height = 120 }: PreviewBoardProps) {
    const scale = width / 900;

    try {
        const { stageData, uiStates } = boardData || {};
        const { showOpponents = false, showGrid = false } = uiStates || {};

        const playerLayer = showGrid ? stageData?.children?.[3]?.children || [] : stageData?.children?.[2]?.children || [];
        const players = playerLayer.filter((group: any) =>
            group?.className === "Group" &&
            (group?.children?.[0]?.attrs?.fill === "#2196F3" ||
                (showOpponents && group?.children?.[0]?.attrs?.fill === "#F44336"))
        );

        return (
            <Stage width={width} height={height} scale={{ x: scale, y: scale }}>
                {/* Background */}
                <Layer>
                    <Rect
                        x={0}
                        y={0}
                        width={900}
                        height={480}
                        fill="#388e3c"
                    />
                </Layer>

                {/* Field Lines */}
                <Layer>
                    <Line points={[450, 0, 450, 480]} stroke="white" strokeWidth={2} />
                    <Circle x={450} y={240} radius={80} stroke="white" strokeWidth={2} />
                    <Rect x={0} y={120} width={120} height={240} stroke="white" strokeWidth={2} />
                    <Rect x={780} y={120} width={120} height={240} stroke="white" strokeWidth={2} />
                </Layer>

                {/* Grid */}
                {showGrid && (
                    <Layer>
                        {Array.from({ length: 18 }, (_, i) => (
                            <Line
                                key={`vertical-${i}`}
                                points={[i * 50, 0, i * 50, 480]}
                                stroke="rgba(229, 231, 235, 0.3)"
                                strokeWidth={1}
                            />
                        ))}
                        {Array.from({ length: 10 }, (_, i) => (
                            <Line
                                key={`horizontal-${i}`}
                                points={[0, i * 50, 900, i * 50]}
                                stroke="rgba(229, 231, 235, 0.3)"
                                strokeWidth={1}
                            />
                        ))}
                    </Layer>
                )}

                {/* Players */}
                <Layer>
                    {players.map((group: any, i: number) => (
                        <Group
                            key={i}
                            x={group.attrs?.x}
                            y={group.attrs?.y}
                        >
                            <Circle
                                radius={15}
                                fill={group.children[0].attrs.fill}
                                stroke="white"
                                strokeWidth={2}
                            />
                        </Group>
                    ))}
                </Layer>
            </Stage>
        );
    } catch (error) {
        console.error('Error rendering preview:', error);
        return (
            <div
                className="bg-emerald-600 w-full h-full rounded-t-lg"
                style={{ width, height }}
            />
        );
    }
}