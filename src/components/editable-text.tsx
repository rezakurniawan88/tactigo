import { useEffect, useRef, useState } from "react";
import { Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";
import Konva from "konva";

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

interface EditableTextProps {
    text: TextElement;
    isSelected: boolean;
    setSelectedShape: React.Dispatch<React.SetStateAction<"text" | "line" | "arrow" | null>>;
    onChange: (id: string, newText: string, newPos?: TextPosition) => void;
    onSelect: React.Dispatch<React.SetStateAction<string | null>>;
}

const EditableText = ({ text, isSelected, setSelectedShape, onChange, onSelect }: EditableTextProps) => {
    const textRef = useRef<Konva.Text>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (isSelected && transformerRef.current && textRef.current) {
            transformerRef.current.nodes([textRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleDblClick = () => {
        setIsEditing(true);
    };

    const handleTextChange = (e: React.FocusEvent<HTMLInputElement> | React.KeyboardEvent<HTMLInputElement>) => {
        const node = textRef.current;
        if (node) {
            onChange(text.id, (e.target as HTMLInputElement).value, {
                x: node.x(),
                y: node.y(),
                width: node.width() * node.scaleX(),
                rotation: node.rotation()
            });
        }
        setIsEditing(false);
    };

    const handleTextClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        onSelect(text.id);
        setSelectedShape("text");
    };

    return (
        <>
            <Text
                ref={textRef}
                x={text.x}
                y={text.y}
                text={text.text}
                fontSize={text.fontSize}
                draggable={true}
                visible={!isEditing}
                onClick={handleTextClick}
                onDblClick={handleDblClick}
                onDragEnd={(e) => {
                    onChange(text.id, text.text, {
                        x: e.target.x(),
                        y: e.target.y()
                    });
                }}
                onTransform={() => {
                    const node = textRef.current;
                    if (node) {
                        onChange(text.id, text.text, {
                            x: node.x(),
                            y: node.y(),
                            width: node.width() * node.scaleX(),
                            rotation: node.rotation()
                        });
                    }
                }}
            />
            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    rotateEnabled={true}
                    enabledAnchors={['middle-left', 'middle-right']}
                    boundBoxFunc={(oldBox, newBox) => {
                        return {
                            ...newBox,
                            width: Math.max(30, newBox.width),
                        };
                    }}
                />
            )}
            {isEditing && (
                <Html>
                    <input
                        type="text"
                        defaultValue={text.text}
                        onBlur={handleTextChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleTextChange(e);
                            }
                        }}
                        autoFocus
                        style={{
                            position: 'absolute',
                            top: (text.y - 8) + 'px',
                            left: (text.x - 3) + 'px',
                            width: '200px',
                            fontSize: text.fontSize + 'px',
                            color: 'black',
                            border: 'none',
                            padding: '4px',
                            margin: '0px',
                            outline: 'none',
                        }}
                    />
                </Html>
            )}
        </>
    );
};

export default EditableText;