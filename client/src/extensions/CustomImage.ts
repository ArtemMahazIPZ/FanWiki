import Image from '@tiptap/extension-image';

export const CustomImage = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                renderHTML: (attributes) => {
                    return {
                        width: attributes.width,
                        style: `width: ${attributes.width}; height: auto; max-width: 100%; display: inline-block;`,
                    };
                },
            },
        };
    },
});