import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, List, ListOrdered, Quote,
    AlignLeft, AlignCenter, AlignRight, Undo, Redo, Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface EditorToolbarProps {
    editor: Editor | null;
}

const MenuButton = ({
                        isActive,
                        onClick,
                        children,
                        title
                    }: { isActive?: boolean, onClick: () => void, children: React.ReactNode, title: string }) => (
    <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClick}
        className={cn(
            "p-2 rounded hover:bg-slate-700 transition text-slate-400 flex items-center justify-center",
            isActive ? "bg-slate-700 text-emerald-400 shadow-inner" : "hover:text-slate-200"
        )}
        title={title}
    >
        {children}
    </button>
);

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Вставте URL картинки:');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border-b border-slate-700 p-2 flex flex-wrap gap-1 bg-slate-900 sticky top-0 z-10 items-center">
            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Жирний">
                    <Bold size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Курсив">
                    <Italic size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Підкреслений">
                    <UnderlineIcon size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Закреслений">
                    <Strikethrough size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="Заголовок H2">
                    <Heading1 size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="Заголовок H3">
                    <Heading2 size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Список">
                    <List size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Нумерація">
                    <ListOrdered size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Цитата">
                    <Quote size={18} />
                </MenuButton>
                <MenuButton onClick={addImage} isActive={editor.isActive('image')} title="Вставити фото">
                    <ImageIcon size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Ліворуч">
                    <AlignLeft size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="По центру">
                    <AlignCenter size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Праворуч">
                    <AlignRight size={18} />
                </MenuButton>
            </div>

            <div className="flex gap-1 ml-auto">
                <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Скасувати">
                    <Undo size={18} />
                </MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Повторити">
                    <Redo size={18} />
                </MenuButton>
            </div>
        </div>
    );
};