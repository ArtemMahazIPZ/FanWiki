import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
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
                    const img = figure ? figure.querySelector('img') ?? element : element;
                    return img.getAttribute('width') || img.style.width || '100%';
                },
                renderHTML: (attributes) => ({
                    width: attributes.width,
                }),
            },
            caption: {
                default: '',
                parseHTML: (element) => {
                    const figure = element.closest('figure');
                    return figure?.querySelector('figcaption')?.textContent || '';
                },
                renderHTML: () => ({}), // handled manually in renderHTML below
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
                // Tiptap will recurse into children; our parseHTML on attrs covers the img
                contentElement: 'img',
            },
            { tag: 'img[src]' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { caption, width, ...imgAttrs } = HTMLAttributes;

        const imgStyle = `width: ${width}; height: auto; max-width: 100%; display: block; margin: 0 auto;`;
        const imgNode = ['img', mergeAttributes(imgAttrs, { width, style: imgStyle })];

        if (caption) {
            return [
                'figure',
                { style: `width: ${width}; max-width: 100%; margin: 1rem auto; text-align: center;` },
                imgNode,
                ['figcaption', { style: 'font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem; font-style: italic;' }, caption],
            ];
        }

        return imgNode;
    },

    addNodeView() {
        return ReactNodeViewRenderer(ImageResizeNodeView);
    },
});
