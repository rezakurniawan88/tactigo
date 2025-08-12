"use client"

import React, { useEffect, useRef, useState, use, JSX } from "react";
import { Stage, Layer, Line, Circle, Text, Rect, Group, Arrow, Image, Arc } from "react-konva";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { formationPositions, dataFormations, defaultOpponents } from "@/utils/dataFormations";
import ColorPicker from "@/components/color-picker";
import EditableText from "@/components/editable-text";
import { LucideChevronsLeft, LucideChevronsRight, LucideEraser, LucideLoader2, LucideMinus, LucideMoveLeft, LucidePalette, LucidePencil, LucideRedo, LucideSave, LucideType, LucideUndo } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useFetchDataBoard } from "@/hooks/useFetchDataBoard";
import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { toast } from "sonner";
import Link from "next/link";
import ModalChangeTitle from "@/components/modal/modal-change-title";
import { useCanvasSize } from "@/hooks/useCanvasSize";
import { KonvaEventObject } from "konva/lib/Node";
import Konva from "konva";

type FormationType = keyof typeof dataFormations;
type OrientationType = "horizontal" | "vertical";

interface Player {
    id: number;
    x: number;
    y: number;
    color: string;
    number?: number;
    initialX: number;
    initialY: number;
}

interface TextElement {
    id: string;
    x: number;
    y: number;
    width: number;
    rotation: number;
    text: string;
    fontSize: number;
    isEditing: boolean;
    draggable: boolean;
}

interface TextPosition {
    x: number;
    y: number;
    width?: number;
    rotation?: number;
}

interface CanvasState {
    players: Player[];
    opponents: Player[];
    lines: Array<{ points: number[]; color: string; strokeWidth: number; drawingMode: string | null; }>;
    texts: TextElement[];
    ballPos: { x: number; y: number };
}

interface SavedChild {
    className: string;
    attrs?: {
        fill?: string;
        x?: number;
        y?: number;
        points?: number[];
        stroke?: string;
        strokeWidth?: number;
        id?: string;
        text?: string;
        fontSize?: number;
        width?: number;
        rotation?: number;
        offsetX?: number;
        offsetY?: number;
    };
    children?: SavedChild[];
}

interface SavedLayer {
    className: string;
    children?: SavedChild[];
}

interface BoardData {
    id: string;
    title: string;
    boardData?: {
        stageData: {
            children: Array<{
                className: string;
                children: Array<{
                    className: string;
                    attrs?: {
                        fill?: string;
                        x?: number;
                        y?: number;
                        points?: number[];
                        stroke?: string;
                        strokeWidth?: number;
                        id?: string;
                        text?: string;
                        fontSize?: number;
                        width?: number;
                        rotation?: number;
                        offsetX?: number;
                        offsetY?: number;
                        image?: HTMLImageElement;
                    };
                    children?: Array<{
                        className: string;
                        attrs?: {
                            fill?: string;
                            x?: number;
                            y?: number;
                            points?: number[];
                            stroke?: string;
                            strokeWidth?: number;
                            id?: string;
                            text?: string;
                            fontSize?: number;
                            width?: number;
                            rotation?: number;
                            offsetX?: number;
                            offsetY?: number;
                            image?: HTMLImageElement;
                        };
                    }>;
                }>;
            }>;
        };
        uiStates: {
            showGrid: boolean;
            showNumbers: boolean;
            showOpponents: boolean;
            showBall: boolean;
            selectedFormation: FormationType;
            orientation?: OrientationType;
        };
    };
}

interface KonvaPointerPosition {
    x: number;
    y: number;
}

interface KonvaStage extends Konva.Stage {
    getPointerPosition(): KonvaPointerPosition | null;
}

export default function BoardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: dataBoard, isLoading: fetchDataBoardIsLoading, refetch: refetchDataBoard } = useFetchDataBoard(id) as {
        data: BoardData | undefined;
        isLoading: boolean;
        refetch: () => void;
    };;
    const stageRef = useRef<Konva.Stage>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [opponents, setOpponents] = useState<Player[]>([]);
    const [showOpponents, setShowOpponents] = useState<boolean>(false);
    const [selectedFormation, setSelectedFormation] = useState<FormationType>("4-3-3");
    const [isCustomFormation, setIsCustomFormation] = useState<boolean>(false);
    const [showBall, setShowBall] = useState<boolean>(false);
    const [showGrid, setShowGrid] = useState<boolean>(false);
    const [showNumbers, setShowNumbers] = useState<boolean>(false);
    const [drawingMode, setDrawingMode] = useState<'arrow' | 'line' | 'draw' | 'text' | 'eraser' | null>(null);
    const [ballPos, setBallPos] = useState({ x: 450, y: 240 });
    const [ballImage, setBallImage] = useState<HTMLImageElement | null>(null);
    const [cursor, setCursor] = useState<string>('default');
    const [lines, setLines] = useState<Array<{ points: number[]; color: string; strokeWidth: number; drawingMode: string | null; }>>([]);
    const isDrawing = useRef<boolean>(false);
    const [brushSize, setBrushSize] = useState<number>(2);
    const [texts, setTexts] = useState<TextElement[]>([]);
    const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [selectedColor, setSelectedColor] = useState<string>("black");
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedShape, setSelectedShape] = useState<'arrow' | 'line' | 'text' | null>(null);
    const [history, setHistory] = useState<CanvasState[]>([]);
    const [currentStateIndex, setCurrentStateIndex] = useState<number>(-1);
    const [orientation, setOrientation] = useState<OrientationType>("horizontal");
    const { width, height, scale } = useCanvasSize(containerRef, orientation);
    const [sidePanelCollapsed, setSidePanelCollapsed] = useState<boolean>(false);
    const [dragOffset, setDragOffset] = useState<{ [key: string]: { x: number, y: number } }>({});

    useEffect(() => {
        const img = new window.Image();
        img.src = '/football-ball.png';
        img.onload = () => setBallImage(img);
    }, []);

    useEffect(() => {
        const loadSavedFormation = () => {
            try {
                if (dataBoard?.boardData) {
                    const { stageData, uiStates } = dataBoard?.boardData;

                    if (stageData?.children && Array.isArray(stageData.children)) {
                        const layers = stageData.children || [];
                        const gridLayer = layers[1]?.children || [];
                        const playerLayer = uiStates.showGrid ? layers[3]?.children || [] : layers[2]?.children || [];
                        const drawingLayer = uiStates.showGrid ? layers[4]?.children || [] : layers[3]?.children || [];
                        const textLayer = layers[layers.length - 1]?.children || [];
                        const ballLayer = stageData?.children?.find(
                            (layer: SavedLayer) => layer.className === "Layer" &&
                                layer.children?.some((child: SavedChild) => child.className === "Image")
                        );

                        if (uiStates) {
                            setShowGrid(uiStates.showGrid);
                            setShowNumbers(uiStates.showNumbers);
                            setShowOpponents(uiStates.showOpponents);
                            setShowBall(uiStates.showBall);
                            setIsCustomFormation(uiStates?.selectedFormation === "custom");
                            setSelectedFormation(uiStates?.selectedFormation);
                            setOrientation(uiStates?.orientation || 'horizontal');
                        }

                        const orientationFromData = uiStates?.orientation || 'horizontal';

                        const toHorizontal = (x: number, y: number) => ({
                            x: y,
                            y: height - x
                        });

                        const loadedPlayers = playerLayer
                            ?.filter((group: SavedChild) =>
                                group.className === "Group" &&
                                group.children?.[0]?.attrs?.fill === "#2196F3"
                            )
                            ?.map((group: SavedChild, index: number) => {
                                let x = group.attrs?.x || 0;
                                let y = group.attrs?.y || 0;
                                if (orientationFromData === "vertical") {
                                    const pos = toHorizontal(x, y);
                                    x = pos.x;
                                    y = pos.y;
                                }
                                return {
                                    id: index,
                                    x,
                                    y,
                                    color: "#2196F3",
                                    number: index + 1,
                                    initialX: x,
                                    initialY: y
                                };
                            }) || [];

                        const loadedOpponents = playerLayer
                            .filter((group: SavedChild) =>
                                group.className === "Group" &&
                                group.children?.[0]?.attrs?.fill === "#F44336"
                            )
                            .map((group: SavedChild, index: number) => {
                                let x = group.attrs?.x || 0;
                                let y = group.attrs?.y || 0;
                                if (orientationFromData === "vertical") {
                                    const pos = toHorizontal(x, y);
                                    x = pos.x;
                                    y = pos.y;
                                }
                                return {
                                    id: index,
                                    x,
                                    y,
                                    color: "#F44336",
                                    number: index + 1,
                                    initialX: x,
                                    initialY: y
                                };
                            });

                        const hasGrid = gridLayer.some((item: SavedChild) =>
                            item.className === "Line" &&
                            item.attrs?.stroke === "rgba(255, 255, 255, 0.3)");

                        const loadedLines = drawingLayer
                            .filter((line: SavedChild) =>
                                line.className === "Line" ||
                                line.className === "Arrow"
                            )
                            .map((line: SavedChild) => {
                                let points = line.attrs?.points || [];

                                if (orientationFromData === "vertical") {
                                    points = rotateLinePoints(points, width, height);
                                }
                                return {
                                    points,
                                    color: line.attrs?.stroke || "black",
                                    strokeWidth: line.attrs?.strokeWidth || 2,
                                    drawingMode: line.className.toLowerCase()
                                }
                            });

                        const loadedTexts = textLayer
                            .filter((text: SavedChild) => text.className === "Text")
                            .map((text: SavedChild) => {
                                let x = text.attrs?.x || 0;
                                let y = text.attrs?.y || 0;

                                if (orientationFromData === "vertical") {
                                    const pos = rotateTextCoordinates(x, y, width, height);
                                    x = pos.x;
                                    y = pos.y;
                                }
                                return {
                                    id: text.attrs?.id || Date.now().toString(),
                                    x,
                                    y,
                                    text: text.attrs?.text || "",
                                    fontSize: text.attrs?.fontSize || 14,
                                    width: text.attrs?.width || 200,
                                    rotation: text.attrs?.rotation || 0,
                                    isEditing: false,
                                    draggable: true
                                }
                            });

                        const ballData = ballLayer?.children?.find(
                            (child: SavedChild) => child.className === "Image"
                        );

                        if (ballData?.attrs && typeof ballData.attrs.x === 'number' && typeof ballData.attrs.y === 'number') {
                            setBallPos({
                                x: ballData?.attrs?.x + (ballData.attrs.offsetX || 0),
                                y: ballData?.attrs?.y + (ballData.attrs.offsetY || 0)
                            });
                        }

                        if (loadedPlayers.length > 0) {
                            setLines(loadedLines);
                            setTexts(loadedTexts);
                            setPlayers(loadedPlayers);
                            setOpponents(loadedOpponents);
                            setShowGrid(hasGrid);

                            setShowNumbers(playerLayer.some((group: SavedChild) =>
                                group.children?.some((child: SavedChild) => child.className === "Text")
                            ));
                            setShowBall(playerLayer.some((group: SavedChild) =>
                                group.className === "Image"
                            ));
                            return true;
                        } else {
                            setOpponents([]);
                        }
                    }
                }
                loadDefaultFormation();
                return false;
            } catch (error) {
                console.error('Error loading formation:', error);
                loadDefaultFormation();
                return false;
            }
        };

        loadSavedFormation();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataBoard]);

    const loadDefaultFormation = () => {
        if (selectedFormation === "custom") return;
        const formation = formationPositions[selectedFormation as keyof typeof formationPositions];
        if (!formation) return;
        const initialPlayers = formation.map((pos: { left: number, top: number }, i: number) => {
            const { x, y } = rotateCoordinates(pos.left, pos.top);
            return {
                id: i,
                x: x,
                y: y,
                color: "#2196F3",
                number: i + 1,
                initialX: x,
                initialY: y
            }
        });
        setPlayers(initialPlayers);
        setOpponents([]);
        setLines([]);
        setTexts([]);
        setShowOpponents(false);
        setShowNumbers(false);
        setBallPos({ x: 450, y: 240 });
    };

    useEffect(() => {
        if (selectedFormation === null || selectedFormation === "custom") return;

        const formation = formationPositions[selectedFormation] || [];
        if (!formation) return;

        const initialPlayers = formation.map((pos, i) => {
            return {
                id: i,
                x: pos.left,
                y: pos.top,
                color: "#2196F3",
                number: i + 1,
                initialX: pos.left,
                initialY: pos.top
            };
        });
        setPlayers(initialPlayers);

    }, [selectedFormation, orientation]);

    useEffect(() => {
        if (showOpponents && opponents.length === 0) {
            setOpponents(defaultOpponents.map(o => ({ ...o })));
        }
        if (!showOpponents) {
            setOpponents([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showOpponents, orientation]);

    useEffect(() => {
        if (opponents && opponents.length > 0) {
            setOpponents(opponents.map(o => ({ ...o })));
        } else {
            setOpponents(defaultOpponents.map(o => ({ ...o })));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orientation]);

    const rotateCoordinates = (x: number, y: number) => {
        if (orientation === "vertical") {
            const horizontalWidth = 900;
            const horizontalHeight = 480;

            return {
                x: (y / horizontalHeight) * width,
                y: ((horizontalWidth - x) / horizontalWidth) * height
            };
        }
        return { x, y };
    };

    const rotateTextCoordinates = (x: number, y: number, width: number, height: number) => {
        if (orientation === "vertical") {
            return {
                x: (y / 480) * width,
                y: ((900 - x) / 900) * height
            };
        }
        return { x, y };
    };

    const rotateLinePoints = (points: number[], width: number, height: number) => {
        if (orientation === "vertical") {
            const rotatedPoints = [];
            for (let i = 0; i < points.length; i += 2) {
                const x = points[i];
                const y = points[i + 1];
                const rotatedX = (y / 480) * width;
                const rotatedY = ((900 - x) / 900) * height;
                rotatedPoints.push(rotatedX, rotatedY);
            }
            return rotatedPoints;
        }
        return points;
    };

    const convertDragCoordinates = (x: number, y: number) => {
        if (orientation === "vertical") {
            return {
                x: ((height - y) / height) * 900,
                y: (x / width) * 480
            };
        }
        return { x, y };
    };

    const handleDragPlayer = (e: KonvaEventObject<DragEvent>, id: number) => {
        let x = e.target.x();
        let y = e.target.y();

        if (orientation === "vertical") {
            const logicalX = ((height - y) / height) * 900;
            const logicalY = (x / width) * 480;
            x = logicalX;
            y = logicalY;
        }

        const newPlayers = players.map(player =>
            player.id === id
                ? { ...player, x, y }
                : player
        );

        setPlayers(newPlayers);
        const formationData = formationPositions[selectedFormation as keyof typeof formationPositions];
        const hasCustomPositions =
            selectedFormation !== "custom" &&
            formationData &&
            newPlayers.some((player, index) => {
                const originalPos = formationData[index];
                if (!originalPos) return false;
                return Math.abs(player.x - originalPos.left) > 5 ||
                    Math.abs(player.y - originalPos.top) > 5;
            });

        if (hasCustomPositions && !isCustomFormation) {
            setIsCustomFormation(true);
            setSelectedFormation("custom");
        }

        saveToHistory({
            players: newPlayers,
            opponents,
            lines,
            texts,
            ballPos
        });
    };

    const handleDragOpponent = (e: KonvaEventObject<DragEvent>, id: number) => {
        let x = e.target.x();
        let y = e.target.y();

        if (orientation === "vertical") {
            const logicalX = ((height - y) / height) * 900;
            const logicalY = (x / width) * 480;
            x = logicalX;
            y = logicalY;
        }

        const newOpponents = opponents.map(opponent =>
            opponent.id === id ? {
                ...opponent,
                x,
                y
            } : opponent
        );

        setOpponents(newOpponents);
    };

    const handleResetPositions = () => {
        const resetPlayers = players.map(player => ({
            ...player,
            x: player.initialX,
            y: player.initialY
        }));
        setPlayers(resetPlayers);
    };

    const renderField = () => {
        const fieldScale = scale;
        const center = { x: 450, y: 240 };
        const penaltySpotLeft = { x: 90, y: 235 };
        const penaltySpotRight = { x: 800, y: 235 };
        const cornerArcs = [
            { x: -8 + 10, y: -10 + 10 },
            { x: -8 + 12, y: 465 + 12 },
            { x: 888 + 10, y: -10 + 10 },
            { x: 888 + 12, y: 465 + 12 },
        ];

        const renderElement = (element: JSX.Element, x: number, y: number, rotation = 0) => {
            const pos = rotateCoordinates(x, y);
            const isArc = element.type === Arc;

            let finalRotation = rotation;
            if (orientation === 'vertical' && isArc) {
                finalRotation += 90;
            }

            return React.cloneElement(element, {
                ...element.props,
                x: pos.x,
                y: pos.y,
                rotation: finalRotation
            });
        };

        return (
            <>
                {/* Garis tengah */}
                {orientation === 'horizontal' ? (
                    <Line points={[width / 2, 0, width / 2, height]} stroke="white" strokeWidth={2 * fieldScale} />
                ) : (
                    <Line points={[0, height / 2, width, height / 2]} stroke="white" strokeWidth={2 * fieldScale} />
                )}

                {/* Lingkaran tengah */}
                {renderElement(
                    <Circle radius={80 * fieldScale} stroke="white" strokeWidth={2 * fieldScale} />,
                    center.x,
                    center.y
                )}

                {/* Titik tengah */}
                {renderElement(
                    <Circle radius={5 * fieldScale} stroke="white" strokeWidth={2 * fieldScale} fill="white" />,
                    center.x,
                    center.y
                )}

                {/* Kotak penalti besar */}
                {orientation === 'horizontal' ? (
                    <>
                        <Rect x={0} y={height * 0.25} width={width * 0.133} height={height * 0.5} stroke="white" strokeWidth={2 * fieldScale} />
                        <Rect x={width * 0.867} y={height * 0.25} width={width * 0.133} height={height * 0.5} stroke="white" strokeWidth={2 * fieldScale} />
                    </>
                ) : (
                    <>
                        <Rect x={width * 0.25} y={0} width={width * 0.5} height={height * 0.133} stroke="white" strokeWidth={2 * fieldScale} />
                        <Rect x={width * 0.25} y={height * 0.867} width={width * 0.5} height={height * 0.133} stroke="white" strokeWidth={2 * fieldScale} />
                    </>
                )}

                {/* Kotak gawang (goal area) */}
                {orientation === 'horizontal' ? (
                    <>
                        <Rect x={0} y={height * 0.375} width={width * 0.056} height={height * 0.25} stroke="white" strokeWidth={2 * fieldScale} />
                        <Rect x={width * 0.944} y={height * 0.375} width={width * 0.056} height={height * 0.25} stroke="white" strokeWidth={2 * fieldScale} />
                    </>
                ) : (
                    <>
                        <Rect x={width * 0.375} y={0} width={width * 0.25} height={height * 0.056} stroke="white" strokeWidth={2 * fieldScale} />
                        <Rect x={width * 0.375} y={height * 0.944} width={width * 0.25} height={height * 0.056} stroke="white" strokeWidth={2 * fieldScale} />
                    </>
                )}

                {/* Titik penalti */}
                {renderElement(
                    <Circle radius={3 * fieldScale} stroke="white" fill="white" />,
                    penaltySpotLeft.x,
                    penaltySpotLeft.y
                )}
                {renderElement(
                    <Circle radius={3 * fieldScale} stroke="white" fill="white" />,
                    penaltySpotRight.x,
                    penaltySpotRight.y
                )}

                {/* Busur penalti */}
                {orientation === 'horizontal' ? (
                    <>
                        <Arc
                            x={width * 0.133}
                            y={height / 2}
                            innerRadius={0}
                            outerRadius={50 * fieldScale}
                            angle={180}
                            rotation={-90}
                            stroke="white"
                            strokeWidth={2 * fieldScale}
                        />
                        <Arc
                            x={width * 0.867}
                            y={height / 2}
                            innerRadius={0}
                            outerRadius={50 * fieldScale}
                            angle={180}
                            rotation={90}
                            stroke="white"
                            strokeWidth={2 * fieldScale}
                        />
                    </>
                ) : (
                    <>
                        <Arc
                            x={width / 2}
                            y={height * 0.133}
                            innerRadius={0}
                            outerRadius={50 * fieldScale}
                            angle={180}
                            rotation={0}
                            stroke="white"
                            strokeWidth={2 * fieldScale}
                        />
                        <Arc
                            x={width / 2}
                            y={height * 0.867}
                            innerRadius={0}
                            outerRadius={50 * fieldScale}
                            angle={180}
                            rotation={180}
                            stroke="white"
                            strokeWidth={2 * fieldScale}
                        />
                    </>
                )}

                {/* Busur sudut */}
                {cornerArcs.map((pos, i) =>
                    renderElement(
                        <Circle key={i} radius={10 * fieldScale} stroke="white" strokeWidth={2 * fieldScale} />,
                        pos.x,
                        pos.y
                    )
                )}
            </>
        );
    };

    const handleArrowMode = () => {
        setDrawingMode(prev => prev === 'arrow' ? null : 'arrow')
    }

    const handleLineMode = () => {
        setDrawingMode(prev => prev === 'line' ? null : 'line')
    }

    const handleDrawMode = () => {
        setDrawingMode(prev => prev === 'draw' ? null : 'draw');
    };

    const handleEraserMode = () => {
        setDrawingMode(prev => prev === 'eraser' ? null : 'eraser');
    };

    const handleTextMode = () => {
        setDrawingMode((prev) => (prev === "text" ? null : "text"));
        setIsEditing(false);
        setSelectedTextId(null);
    };

    const handleDrawMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (drawingMode === null) return;
        isDrawing.current = true;
        const stage = e.target?.getStage() as KonvaStage | null;
        const pos = stage?.getPointerPosition();
        if (pos) {
            let x = pos.x;
            let y = pos.y;

            if (orientation === "vertical") {
                const logicalX = ((height - y) / height) * 900;
                const logicalY = (x / width) * 480;
                x = logicalX;
                y = logicalY;
            }

            setLines([...lines, {
                drawingMode,
                points: [x, y],
                color: selectedColor,
                strokeWidth: brushSize
            }]);
        }
    };

    const handleDrawMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        if (!isDrawing.current) return;

        const stage = e.target?.getStage() as KonvaStage | null;
        const point = stage?.getPointerPosition();
        if (!point) return;
        let x = point.x;
        let y = point.y;

        if (orientation === "vertical") {
            const logicalX = ((height - y) / height) * 900;
            const logicalY = (x / width) * 480;
            x = logicalX;
            y = logicalY;
        }
        const lastLine = lines[lines.length - 1];

        if (['arrow', 'line'].includes(lastLine.drawingMode!)) {
            lastLine.points = [
                lastLine.points[0],
                lastLine.points[1],
                x,
                y
            ];
        } else {
            lastLine.points = lastLine.points.concat([x, y]);
        }
        setLines([...lines.slice(0, -1), lastLine]);
    };

    const handleDrawMouseUp = () => {
        if (isDrawing.current) {
            isDrawing.current = false;
            saveToHistory({
                players,
                opponents,
                lines,
                texts,
                ballPos
            });
        }
    };

    const handleCanvasClick = (e: KonvaEventObject<Event>) => {
        if (drawingMode !== 'text' || isEditing) return;

        if (e.target.getType() === 'Text') {
            const clickedText = texts.find((t) => t.id === e.target.id());
            if (clickedText) {
                setSelectedTextId(clickedText.id);
                setIsEditing(true);
                return;
            }
        }

        const stage = e.target.getStage() as KonvaStage | null;
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;
        let x = pos.x;
        let y = pos.y;
        if (orientation === "vertical") {
            const logicalX = ((height - y) / height) * 900;
            const logicalY = (x / width) * 480;
            x = logicalX;
            y = logicalY;
        }
        const newText: TextElement = {
            id: Date.now().toString(),
            x: x,
            y: y,
            text: 'Click to edit',
            fontSize: 14,
            width: 200,
            rotation: 0,
            isEditing: true,
            draggable: true
        };
        setTexts([...texts, newText]);
        setSelectedTextId(newText.id);
        setDrawingMode(null);
    };

    const clearDrawings = () => {
        setLines([]);
    };

    const saveToHistory = (newState: CanvasState) => {
        const newHistory = history.slice(0, currentStateIndex + 1);
        newHistory.push({
            players: [...newState.players],
            opponents: [...newState.opponents],
            lines: [...newState.lines],
            texts: [...newState.texts],
            ballPos: { ...newState.ballPos }
        });
        setHistory(newHistory);
        setCurrentStateIndex(newHistory.length - 1);
    };

    const handleUndo = () => {
        if (currentStateIndex > 0) {
            const prevState = history[currentStateIndex - 1];
            setPlayers([...prevState.players]);
            setOpponents([...prevState.opponents]);
            setLines([...prevState.lines]);
            setTexts([...prevState.texts]);
            setBallPos({ ...prevState.ballPos });
            setCurrentStateIndex(currentStateIndex - 1);
        }
    };

    const handleRedo = () => {
        if (currentStateIndex < history.length - 1) {
            const nextState = history[currentStateIndex + 1];
            setPlayers([...nextState.players]);
            setOpponents([...nextState.opponents]);
            setLines([...nextState.lines]);
            setTexts([...nextState.texts]);
            setBallPos({ ...nextState.ballPos });
            setCurrentStateIndex(currentStateIndex + 1);
        }
    };

    const handleClearAll = () => {
        if (!stageRef) return;

        handleResetPositions();
        setShowBall(false);
        setShowOpponents(false);
        setShowGrid(false);
        setShowNumbers(false);
        clearDrawings();
        setTexts([]);
        setSelectedColor("black")
    }

    const handleExportImage = () => {
        const uri = stageRef?.current?.toDataURL();
        if (!uri) return;
        const link = document.createElement('a');
        link.download = 'result-formation.png';
        link.href = uri;
        link.click();
    };

    const { mutate: handleSaveFormation, isPending: saveFormationIsLoading } = useMutation({
        mutationKey: ['save-formation'],
        mutationFn: async () => {
            if (!stageRef.current) return;
            const stageData = stageRef?.current?.toObject();
            const boardDataWithStates = {
                stageData,
                uiStates: {
                    showGrid,
                    showNumbers,
                    showOpponents,
                    showBall,
                    selectedFormation
                }
            };

            const response = await axiosInstance.patch(`/board/${id}`, {
                boardData: boardDataWithStates
            });

            return response?.data?.message;
        },
        onSuccess: (message) => {
            toast(message);
        },
        onError: (error) => {
            toast("Error saving formation");
            console.log("Saving Error", error);
        }
    })

    useEffect(() => {
        saveToHistory({
            players,
            opponents,
            lines: [],
            texts: [],
            ballPos: { x: 450, y: 240 }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Delete') {
                if (selectedShape === 'text' && selectedTextId) {
                    setTexts(prev => prev.filter(t => t.id !== selectedTextId));
                    setSelectedTextId(null);
                } else if ((selectedShape === 'arrow' || selectedShape === 'line') && selectedId !== null) {
                    setLines(prev => prev.filter((_, i) => String(i) !== selectedId));
                    setSelectedId(null);
                }
                setSelectedShape(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, selectedShape, selectedTextId]);

    const handleOrientationChange = (val: string) => {
        if (val === "horizontal" || val === "vertical") {
            setOrientation(val);
        }
    };

    const handleFormationChange = (val: string) => {
        if (val in dataFormations) {
            setSelectedFormation(val as FormationType);
        }
    };

    const handleSaveClick = () => {
        handleSaveFormation();
    };

    if (fetchDataBoardIsLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <LucideLoader2 className="animate-spin text-gray-500 w-10 h-10" />
            </div>
        )
    }

    const containerStyles = {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative' as const,
        transformOrigin: 'center center',
        willChange: 'transform',
        contain: 'layout style paint' as const,
    };

    const stageContainerStyles = {
        position: 'relative' as const,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transformOrigin: 'center center',
        minWidth: 0,
        minHeight: 0,
    };

    return (
        <main className="flex h-screen bg-gray-50 overflow-hidden">
            <div className={`relative bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300 z-50 ${sidePanelCollapsed ? "w-0 p-0 overflow-hidden" : "w-80 p-6"}`}>
                {!sidePanelCollapsed && (
                    <div className="p-4">
                        <Link href="/">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">TactiGo Board</h2>
                        </Link>

                        <Button onClick={() => setSidePanelCollapsed(!sidePanelCollapsed)} variant="secondary" className="absolute top-17 -right-5 text-gray-900 bg-white border border-gray-200 rounded-r-lg shadow p-2 hover:bg-gray-100 transition-all"><LucideChevronsLeft /></Button>

                        <div className="space-y-4">
                            <h1 className="font-bold">Board Settings</h1>
                            <div className="space-y-4">
                                <Select value={orientation} onValueChange={handleOrientationChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Orientation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectItem value="horizontal">Horizontal</SelectItem>
                                            <SelectItem value="vertical">Vertical</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                                <div className="space-y-2">
                                    <h1 className="text-sm text-gray-800 font-semibold">Formations</h1>
                                    <Select value={selectedFormation} onValueChange={handleFormationChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Formation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                {Object.entries(dataFormations).map(([key, value]) => (
                                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-3">
                                    <h1 className="text-sm text-gray-800 font-semibold">Team Settings</h1>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Ball</span>
                                        <Switch checked={showBall} onCheckedChange={setShowBall} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Opponents</span>
                                        <Switch checked={showOpponents} onCheckedChange={setShowOpponents} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Numbers</span>
                                        <Switch checked={showNumbers} onCheckedChange={setShowNumbers} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Show Grid</span>
                                        <Switch checked={showGrid} onCheckedChange={setShowGrid} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {!sidePanelCollapsed && (
                    <div className="mt-auto p-6 border-t border-gray-200 space-y-3">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full cursor-pointer">Clear All</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Are you sure you want to clear all?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action will reset all players, remove arrow, lines, texts, draw and the ball from the board. This cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleClearAll} className="bg-red-500 hover:bg-red-600">Clear</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button className="w-full cursor-pointer bg-blue-500 hover:bg-blue-600">
                                    Export to Image
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Export to Image
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        You will export the current board view as an image. Make sure the board looks the way you want it. Do you want to continue?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleExportImage} className="bg-blue-500 hover:bg-blue-600">Export</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>

            {sidePanelCollapsed && (
                <Button
                    className="absolute left-0 top-17 z-20 text-gray-900 bg-white border border-gray-200 rounded-r-lg shadow p-2 hover:bg-gray-100 transition-all"
                    onClick={() => setSidePanelCollapsed(false)}
                >
                    <LucideChevronsRight />
                </Button>
            )}

            {/* Main Canvas Area */}
            <div className="flex-1 h-full flex flex-col">
                <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-white">
                    <div className="flex items-center gap-2">
                        <h1 className="font-semibold text-lg">{dataBoard?.title || "Tactic Tittle"}</h1>
                        <ModalChangeTitle refetch={refetchDataBoard} tacticId={dataBoard?.id} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button variant="outline" onClick={handleResetPositions}>
                            Reset Positions
                        </Button>
                        <Button onClick={handleSaveClick} disabled={saveFormationIsLoading} className="bg-slate-800 hover:bg-slate-700 cursor-pointer">
                            {saveFormationIsLoading ? (
                                <>
                                    <LucideLoader2 className="animate-spin" />
                                    <h1>Saving</h1>
                                </>
                            ) : (
                                <>
                                    <LucideSave />
                                    <h1>Save</h1>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Canvas Container */}
                <div className="flex flex-col sm:flex-row gap-2 h-full p-6 bg-green-400/70">
                    <div ref={containerRef} className="w-full h-full flex-1 flex items-center justify-center overflow-hidden" style={containerStyles}>
                        <div style={stageContainerStyles}>
                            <Stage
                                id="container"
                                width={width}
                                height={height}
                                ref={stageRef}
                                scaleX={1}
                                scaleY={1}
                                onClick={(e) => {
                                    if (e.target === e.target.getStage()) {
                                        setSelectedId(null);
                                        setSelectedShape(null);
                                        setSelectedTextId(null);
                                    }
                                    handleCanvasClick(e);
                                }}
                                onTap={(e) => {
                                    if (e.target === e.target.getStage()) {
                                        setSelectedTextId(null);
                                    }
                                    handleCanvasClick(e);
                                }}
                                onMouseDown={handleDrawMouseDown}
                                onMouseMove={handleDrawMouseMove}
                                onMouseUp={handleDrawMouseUp}
                                onTouchStart={handleDrawMouseDown}
                                onTouchMove={handleDrawMouseMove}
                                onTouchEnd={handleDrawMouseUp}
                                className="border-4 border-gray-100"
                                style={{
                                    cursor,
                                    maxWidth: '100%',
                                    maxHeight: '100%',
                                    transformOrigin: 'center center',
                                    objectFit: 'contain',
                                    flexShrink: 0,
                                }}
                            >
                                <Layer>
                                    <Rect
                                        x={0}
                                        y={0}
                                        width={width}
                                        height={height}
                                        fill="#388e3c"
                                        listening={false}
                                    />
                                </Layer>

                                {showGrid && (
                                    <Layer>
                                        {/* Grid lines berdasarkan orientasi */}
                                        {orientation === 'horizontal' ? (
                                            <>
                                                {/* Vertical lines */}
                                                {Array.from({ length: Math.floor(width / 50) + 1 }, (_, i) => (
                                                    <Line
                                                        key={`vertical-${i}`}
                                                        points={[i * 50, 0, i * 50, height]}
                                                        stroke="rgba(255, 255, 255, 0.3)"
                                                        strokeWidth={1}
                                                    />
                                                ))}
                                                {/* Horizontal lines */}
                                                {Array.from({ length: Math.floor(height / 50) + 1 }, (_, i) => (
                                                    <Line
                                                        key={`horizontal-${i}`}
                                                        points={[0, i * 50, width, i * 50]}
                                                        stroke="rgba(255, 255, 255, 0.3)"
                                                        strokeWidth={1}
                                                    />
                                                ))}
                                            </>
                                        ) : (
                                            <>
                                                {/* Vertical lines untuk vertical orientation */}
                                                {Array.from({ length: Math.floor(width / 50) + 1 }, (_, i) => (
                                                    <Line
                                                        key={`vertical-${i}`}
                                                        points={[i * 50, 0, i * 50, height]}
                                                        stroke="rgba(255, 255, 255, 0.3)"
                                                        strokeWidth={1}
                                                    />
                                                ))}
                                                {/* Horizontal lines untuk vertical orientation */}
                                                {Array.from({ length: Math.floor(height / 50) + 1 }, (_, i) => (
                                                    <Line
                                                        key={`horizontal-${i}`}
                                                        points={[0, i * 50, width, i * 50]}
                                                        stroke="rgba(255, 255, 255, 0.3)"
                                                        strokeWidth={1}
                                                    />
                                                ))}
                                            </>
                                        )}
                                    </Layer>
                                )}

                                <Layer>
                                    {renderField()}
                                </Layer>

                                <Layer>
                                    {/* Our Players */}
                                    {players.map(player => {
                                        const pos = rotateCoordinates(player.x, player.y);
                                        return (
                                            <Group
                                                key={player.id}
                                                x={pos.x}
                                                y={pos.y}
                                                draggable
                                                onDragMove={(e) => handleDragPlayer(e, player.id)}
                                                onMouseOver={() => setCursor("pointer")}
                                                onMouseOut={() => setCursor("default")}
                                            >
                                                <Circle radius={15 * scale} fill={player.color} stroke="white" strokeWidth={2 * scale} />
                                                {showNumbers && (
                                                    <Text
                                                        text={String(player.number)}
                                                        fontSize={16 * scale}
                                                        fill="white"
                                                        x={-4 * scale}
                                                        y={-8 * scale}
                                                        offsetX={(player?.number || 0) >= 10 ? 4 * scale : 0}
                                                        offsetY={0}
                                                        align="center"
                                                        verticalAlign="middle"
                                                    />
                                                )}
                                            </Group>
                                        )
                                    })}

                                    {/* Opponents */}
                                    {opponents.map(opponent => {
                                        const pos = rotateCoordinates(opponent.x, opponent.y);
                                        return (
                                            <Group
                                                key={opponent.id}
                                                x={pos.x}
                                                y={pos.y}
                                                draggable
                                                onDragMove={(e) => handleDragOpponent(e, opponent.id)}
                                                onMouseOver={() => setCursor("pointer")}
                                                onMouseOut={() => setCursor("default")}
                                                visible={showOpponents}
                                            >
                                                <Circle
                                                    radius={15 * scale}
                                                    fill={opponent.color}
                                                    stroke="white"
                                                    strokeWidth={2 * scale}
                                                />
                                                {showNumbers && (
                                                    <Text
                                                        text={String(opponent.number)}
                                                        fontSize={16 * scale}
                                                        fill="white"
                                                        x={-4 * scale}
                                                        y={-8 * scale}
                                                        offsetX={(opponent?.number || 0) >= 10 ? 4 * scale : 0}
                                                        offsetY={0}
                                                        align="center"
                                                        verticalAlign="middle"
                                                    />
                                                )}
                                            </Group>
                                        )
                                    })}

                                    {/* Ball */}
                                    {showBall && ballImage && (
                                        // eslint-disable-next-line jsx-a11y/alt-text
                                        <Image
                                            image={ballImage}
                                            {...rotateCoordinates(ballPos.x, ballPos.y)}
                                            width={20 * scale}
                                            height={20 * scale}
                                            offsetX={15 * scale}
                                            offsetY={15 * scale}
                                            draggable
                                            onMouseOver={() => setCursor("grabbing")}
                                            onMouseOut={() => setCursor("default")}
                                            onDragMove={(e) => {
                                                const pos = e.target.position();
                                                setBallPos({
                                                    x: pos.x || 450,
                                                    y: pos.y || 240
                                                });
                                            }}
                                        />
                                    )}
                                </Layer>

                                <Layer>

                                    {lines.map((line, i) => {
                                        const displayPoints = rotateLinePoints(line.points, width, height);
                                        if (line.drawingMode === 'arrow') {
                                            return (
                                                <Arrow
                                                    key={i}
                                                    points={displayPoints}
                                                    stroke={line.color}
                                                    strokeWidth={line.strokeWidth}
                                                    pointerLength={10}
                                                    pointerWidth={10}
                                                    draggable={true}
                                                    onClick={(e) => {
                                                        e.cancelBubble = true;
                                                        setSelectedId(String(i));
                                                        setSelectedShape('arrow');
                                                    }}
                                                    onMouseOver={() => setCursor("grabbing")}
                                                    onMouseOut={() => setCursor("default")}
                                                    shadowColor={selectedId === String(i) ? 'black' : undefined}
                                                    onDragStart={(e) => {
                                                        const startPos = e.target.position();
                                                        setDragOffset(prev => ({
                                                            ...prev,
                                                            [`arrow-${i}`]: { x: startPos.x, y: startPos.y }
                                                        }));
                                                    }}
                                                    onDragMove={(e) => {
                                                        const currentPos = e.target.position();
                                                        const offset = dragOffset[`arrow-${i}`] || { x: 0, y: 0 };

                                                        const deltaX = currentPos.x - offset.x;
                                                        const deltaY = currentPos.y - offset.y;

                                                        const logicalDelta = convertDragCoordinates(deltaX, deltaY);
                                                        const originalLogicalDelta = convertDragCoordinates(0, 0);

                                                        const finalDeltaX = logicalDelta.x - originalLogicalDelta.x;
                                                        const finalDeltaY = logicalDelta.y - originalLogicalDelta.y;

                                                        const newPoints = [];
                                                        for (let j = 0; j < line.points.length; j += 2) {
                                                            newPoints.push(line.points[j] + finalDeltaX);
                                                            newPoints.push(line.points[j + 1] + finalDeltaY);
                                                        }

                                                        const updatedLines = [...lines];
                                                        updatedLines[i] = { ...updatedLines[i], points: newPoints };
                                                        setLines(updatedLines);

                                                        setDragOffset(prev => ({
                                                            ...prev,
                                                            [`arrow-${i}`]: { x: currentPos.x, y: currentPos.y }
                                                        }));
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.target.position({ x: 0, y: 0 });
                                                        setDragOffset(prev => {
                                                            const newOffset = { ...prev };
                                                            delete newOffset[`arrow-${i}`];
                                                            return newOffset;
                                                        });

                                                        saveToHistory({
                                                            players,
                                                            opponents,
                                                            lines,
                                                            texts,
                                                            ballPos
                                                        });
                                                    }}
                                                />
                                            );
                                        }

                                        if (line.drawingMode === 'line') {
                                            return (
                                                <Line
                                                    key={i}
                                                    points={displayPoints}
                                                    stroke={line.color}
                                                    strokeWidth={line.strokeWidth}
                                                    lineCap="round"
                                                    lineJoin="round"
                                                    draggable={true}
                                                    onClick={(e) => {
                                                        e.cancelBubble = true;
                                                        setSelectedId(String(i));
                                                        setSelectedShape('line');
                                                    }}
                                                    onMouseOver={() => setCursor("grabbing")}
                                                    onMouseOut={() => setCursor("default")}
                                                    onDragStart={(e) => {
                                                        const startPos = e.target.position();
                                                        setDragOffset(prev => ({
                                                            ...prev,
                                                            [`line-${i}`]: { x: startPos.x, y: startPos.y }
                                                        }));
                                                    }}
                                                    onDragMove={(e) => {
                                                        const currentPos = e.target.position();
                                                        const offset = dragOffset[`line-${i}`] || { x: 0, y: 0 };

                                                        const deltaX = currentPos.x - offset.x;
                                                        const deltaY = currentPos.y - offset.y;

                                                        // Untuk orientasi horizontal, delta tidak perlu dikonversi
                                                        let finalDeltaX = deltaX;
                                                        let finalDeltaY = deltaY;

                                                        // Untuk orientasi vertical, konversi delta
                                                        if (orientation === "vertical") {
                                                            finalDeltaX = -deltaY * (900 / height);
                                                            finalDeltaY = deltaX * (480 / width);
                                                        }

                                                        const newPoints = [];
                                                        for (let j = 0; j < line.points.length; j += 2) {
                                                            newPoints.push(line.points[j] + finalDeltaX);
                                                            newPoints.push(line.points[j + 1] + finalDeltaY);
                                                        }

                                                        const updatedLines = [...lines];
                                                        updatedLines[i] = { ...updatedLines[i], points: newPoints };
                                                        setLines(updatedLines);

                                                        setDragOffset(prev => ({
                                                            ...prev,
                                                            [`line-${i}`]: { x: currentPos.x, y: currentPos.y }
                                                        }));
                                                    }}
                                                    onDragEnd={(e) => {
                                                        e.target.position({ x: 0, y: 0 });
                                                        setDragOffset(prev => {
                                                            const newOffset = { ...prev };
                                                            delete newOffset[`line-${i}`];
                                                            return newOffset;
                                                        });

                                                        saveToHistory({
                                                            players,
                                                            opponents,
                                                            lines,
                                                            texts,
                                                            ballPos
                                                        });
                                                    }}
                                                />
                                            );
                                        }
                                        return (
                                            <Line
                                                key={i}
                                                points={displayPoints}
                                                stroke={line.color}
                                                strokeWidth={line.strokeWidth}
                                                tension={0.5}
                                                lineCap="round"
                                                lineJoin="round"
                                                globalCompositeOperation={
                                                    line.drawingMode === "eraser" ? 'destination-out' : 'source-over'
                                                }
                                            />
                                        )
                                    })}
                                </Layer>

                                <Layer>
                                    {texts.map((text) => {
                                        const displayPos = rotateTextCoordinates(text.x, text.y, width, height);

                                        return (
                                            <EditableText
                                                key={text.id}
                                                text={{
                                                    ...text,
                                                    x: displayPos.x,
                                                    y: displayPos.y
                                                }}
                                                isSelected={selectedTextId === text.id}
                                                onSelect={setSelectedTextId}
                                                setSelectedShape={setSelectedShape}
                                                onChange={(id: string, newText: string, newPos: TextPosition | undefined) => {
                                                    setTexts(texts.map(t => {
                                                        if (t.id === id) {
                                                            let updatedText = { ...t, text: newText };

                                                            if (newPos) {
                                                                let logicalX = newPos.x;
                                                                let logicalY = newPos.y;

                                                                if (orientation === "vertical") {
                                                                    logicalX = ((height - newPos.y) / height) * 900;
                                                                    logicalY = (newPos.x / width) * 480;
                                                                }

                                                                updatedText = {
                                                                    ...updatedText,
                                                                    x: logicalX,
                                                                    y: logicalY
                                                                };
                                                            }

                                                            return updatedText;
                                                        }
                                                        return t;
                                                    }));
                                                }}
                                            />
                                        )
                                    })}
                                </Layer>
                            </Stage>
                        </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2
  fixed md:relative bottom-5 left-0 right-0 mx-10 z-20 bg-white/70 border-t border-gray-200 p-2 rounded-xl
  md:bg-transparent md:border-none md:mx-0 md:mt-5 md:p-0 justify-center">
                        <Button
                            onClick={handleArrowMode}
                            className={`flex-1 ${drawingMode === "arrow" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} p-2 transition-all cursor-pointer`}
                        >
                            <LucideMoveLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleLineMode}
                            className={`flex-1 ${drawingMode === "line" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} p-2 transition-all cursor-pointer`}
                        >
                            <LucideMinus className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleDrawMode}
                            className={`flex-1 ${drawingMode === "draw" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} p-2 transition-all cursor-pointer`}
                        >
                            <LucidePencil className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleTextMode}
                            className={`flex-1 ${drawingMode === "text" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} p-2 transition-all cursor-pointer`}
                        >
                            <LucideType className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleEraserMode}
                            className={`flex-1 ${drawingMode === "eraser" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"} p-2 transition-all cursor-pointer`}
                        >
                            <LucideEraser className="w-4 h-4" />
                        </Button>

                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    className={`flex-1 bg-gray-100 text-gray-700 p-2 hover:bg-gray-200 transition-all cursor-pointer`}
                                >
                                    <div className="flex items-center gap-2">
                                        <LucidePalette className="w-4 h-4" />
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: selectedColor }}
                                        />
                                    </div>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-4 mt-1 mr-28">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Color
                                        </label>
                                        <ColorPicker
                                            selectedColor={selectedColor}
                                            setSelectedColor={setSelectedColor}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Size: {brushSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={brushSize}
                                            onChange={(e) => setBrushSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>

                        <Button
                            onClick={handleUndo}
                            disabled={currentStateIndex <= 0}
                            className="flex-1 bg-gray-600 text-white p-2 transition-all cursor-pointer hover:bg-gray-500"
                        >
                            <LucideUndo className="w-4 h-4" />
                        </Button>
                        <Button
                            onClick={handleRedo}
                            disabled={currentStateIndex >= history.length - 1}
                            className="flex-1 bg-gray-600 text-white p-2 transition-all cursor-pointer hover:bg-gray-500"
                        >
                            <LucideRedo className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </main>
    );
}