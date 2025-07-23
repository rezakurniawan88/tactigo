import { useEffect, useRef, useState } from "react";
import { Text, Transformer } from "react-konva";
import { Html } from "react-konva-utils";

const EditableText = ({ text, isSelected, setSelectedShape, onChange, onSelect }) => {
    const textRef = useRef(null);
    const transformerRef = useRef(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    useEffect(() => {
        if (isSelected && transformerRef.current && textRef.current) {
            transformerRef.current.nodes([textRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleDblClick = () => {
        setIsEditing(true);
    };

    const handleTextChange = (e) => {
        const node = textRef.current;
        onChange(text.id, e.target.value, {
            x: node.x(),
            y: node.y(),
            width: node.width() * node.scaleX(),
            rotation: node.rotation()
        });
        setIsEditing(false);
    };

    const handleTextClick = (e) => {
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
                    onChange(text.id, text.text, {
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        rotation: node.rotation()
                    });
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