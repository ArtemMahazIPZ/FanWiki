import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';

export const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                parseHTML: (element) => {
                    const figure = element.closest('figure');
                    if (figure) {
                        return element.getAttribute('width') || element.style.width || '100%';
                    }
                    return element.getAttribute('width') || element.style.width || '100%';
                },
            },
            caption: {
                default: '',
                parseHTML: (element) => {
                    const figure = element.closest('figure');
                    if (figure) {
                        const figcaption = figure.querySelector('figcaption');
                        return figcaption?.textContent || '';
                    }
                    return '';
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'figure',
                contentElement: 'img',
                getAttrs: (node) => {
                    const element = node as HTMLElement;
                    const img = element.querySelector('img');
                    if (!img) return false;
                    return {};
                },
            },
            {
                tag: 'img[src]',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const { caption, width, ...imgAttrs } = HTMLAttributes;
        const imgAttributes = mergeAttributes(imgAttrs, {
            width,
            style: `width: ${width}; height: auto; max-width: 100%; display: block; margin: 0 auto;`,
        });

        if (caption) {
            return [
                'figure',
                { style: `width: ${width}; max-width: 100%; margin: 1rem auto; text-align: center;` },
                ['img', imgAttributes],
                ['figcaption', { style: 'font-size: 0.85rem; color: #94a3b8; margin-top: 0.5rem; font-style: italic;' }, caption],
            ];
        }

        return ['img', mergeAttributes(imgAttrs, {
            width,
            style: `width: ${width}; height: auto; max-width: 100%; display: inline-block;`,
        })];
    },
});
