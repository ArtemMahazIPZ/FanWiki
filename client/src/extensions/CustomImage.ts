import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageResizeNodeView } from './ImageResizeNodeView';

export const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                parseHTML: (element) => {
                    const figure = element.closest('figure');
                    const img = figure ? (figure.querySelector('img') ?? element) : element;
                    return img.getAttribute('width') || img.style.width || '100%';
                },
                renderHTML: (attributes) => ({
                    width: attributes.width,
                }),
            },
            caption: {
                default: '',
                parseHTML: (element) => {
                    // Priority 1: figcaption sibling inside a figure
                    const figure = element.closest('figure');
                    if (figure) {
                        const text = figure.querySelector('figcaption')?.textContent;
                        if (text) return text;
                    }
                    // Priority 2: data-caption attribute on the img
                    return element.getAttribute('data-caption') || '';
                },
                // Store the caption as a data attribute so it is visible in HTMLAttributes
                // inside the node-level renderHTML below.
                renderHTML: (attributes) => {
                    if (!attributes.caption) return {};
                    return { 'data-caption': attributes.caption };
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
                getAttrs: (node) => {
                    const el = node as HTMLElement;
                    return el.querySelector('img') ? {} : false;
                },
                contentElement: 'img',
            },
            { tag: 'img[src]' },
        ];
    },

    renderHTML({ HTMLAttributes }): DOMOutputSpec {
        // 'data-caption' is provided by the caption attribute's renderHTML above.
        // We destructure it out so it does NOT end up on the <img> element itself.
        const { 'data-caption': caption, width, ...imgAttrs } = HTMLAttributes;

        const imgStyle = `width: ${width}; height: auto; max-width: 100%; display: block; margin: 0 auto;`;
        const imgAttrsWithStyle = mergeAttributes(imgAttrs, { width, style: imgStyle });

        if (caption) {
            return [
                'figure',
                { style: `width: ${width}; max-width: 100%; margin: 1rem auto; text-align: center;` },
                ['img', imgAttrsWithStyle],
                [
                    'figcaption',
                    { style: 'font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem; font-style: italic; text-align: center;' },
                    caption,
                ],
            ] as DOMOutputSpec;
        }

        return ['img', imgAttrsWithStyle] as DOMOutputSpec;
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageResizeNodeView);
    },
});
