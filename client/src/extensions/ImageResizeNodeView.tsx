import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useRef, useState, useCallback } from 'react';

export const ImageResizeNodeView = ({ node, updateAttributes, selected }: NodeViewProps) => {
    const { src, alt, width, caption } = node.attrs;

    // Local width state used only during an active drag for live preview
    const [dragWidth, setDragWidth] = useState<number | null>(null);
    const [isResizing, setIsResizing] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef(0);
    const startWRef = useRef(0);

    // Resolve current width in pixels for the container element
    const resolveDisplayWidth = (): string => {
        if (dragWidth !== null) return `${dragWidth}px`;
        return typeof width === 'string' ? width : '100%';
    };

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const container = containerRef.current;
        if (!container) return;

        startXRef.current = e.clientX;
        startWRef.current = container.offsetWidth;
        setIsResizing(true);

        const onMove = (ev: MouseEvent) => {
            const delta = ev.clientX - startXRef.current;
            const next = Math.max(60, startWRef.current + delta);
            setDragWidth(next);
        };

        const onUp = (ev: MouseEvent) => {
            const delta = ev.clientX - startXRef.current;
            const final = Math.max(60, startWRef.current + delta);
            updateAttributes({ width: `${final}px` });
            setDragWidth(null);
            setIsResizing(false);
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }, [updateAttributes]);

    // Current rendered pixel width for the badge
    const badgeWidth = dragWidth ?? containerRef.current?.offsetWidth ?? null;

    return (
        <NodeViewWrapper
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                margin: '1rem auto',
                width: resolveDisplayWidth(),
                maxWidth: '100%',
            }}
            data-drag-handle
        >
            <div
                ref={containerRef}
                style={{
                    position: 'relative',
                    width: '100%',
                    cursor: isResizing ? 'nwse-resize' : 'default',
                    userSelect: 'none',
                }}
            >
                <img
                    src={src}
                    alt={alt || ''}
                    draggable={false}
                    style={{
                        display: 'block',
                        width: '100%',
                        height: 'auto',
                        borderRadius: '0.75rem',
                        border: selected ? '2px solid #10b981' : '2px solid transparent',
                        transition: isResizing ? 'none' : 'border-color 0.15s',
                        pointerEvents: 'none',
                    }}
                />

                {/* Pixel dimension badge — top-left, visible while selected */}
                {selected && badgeWidth !== null && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            background: 'rgba(0,0,0,0.6)',
                            color: '#e2e8f0',
                            fontSize: 11,
                            lineHeight: 1,
                            padding: '3px 7px',
                            borderRadius: 4,
                            pointerEvents: 'none',
                            userSelect: 'none',
                            fontFamily: 'monospace',
                        }}
                    >
                        {badgeWidth}px
                    </div>
                )}

                {/* Drag handle — bottom-right corner */}
                {selected && (
                    <div
                        onMouseDown={handleMouseDown}
                        title="Drag to resize"
                        style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            width: 14,
                            height: 14,
                            background: '#10b981',
                            border: '2px solid #fff',
                            borderRadius: 3,
                            cursor: 'nwse-resize',
                            zIndex: 20,
                            boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                        }}
                    />
                )}
            </div>

            {caption && (
                <figcaption
                    style={{
                        fontSize: '0.85rem',
                        color: '#94a3b8',
                        marginTop: '0.5rem',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        width: '100%',
                    }}
                >
                    {caption}
                </figcaption>
            )}
        </NodeViewWrapper>
    );
};
