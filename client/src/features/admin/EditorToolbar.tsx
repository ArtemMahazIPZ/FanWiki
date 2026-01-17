import { Editor } from '@tiptap/react';
import { useRef } from 'react'; // Додали useRef
import {
    Bold, Italic, Underline as UnderlineIcon, Strikethrough,
    Heading1, Heading2, List, ListOrdered, Quote,
    AlignLeft, AlignCenter, AlignRight, Undo, Redo, Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { api } from '../../api/axios'; // Для запиту на сервер

interface EditorToolbarProps {
    editor: Editor | null;
}

// MenuButton залишається без змін...
const MenuButton = ({ isActive, onClick, children, title }: any) => (
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
    const fileInputRef = useRef<HTMLInputElement>(null); // Реф для інпута

    if (!editor) return null;

    // 1. Клік на кнопку імітує клік на інпут
    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    // 2. Коли файл обрано - вантажимо на сервер
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/Wiki/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 3. Вставляємо картинку в редактор по URL, який вернув сервер
            const fullUrl = `http://localhost:5122${res.data.url}`;
            editor.chain().focus().setImage({ src: fullUrl }).run();
        } catch (error) {
            alert('Не вдалося завантажити зображення');
        } finally {
            // Скидаємо інпут, щоб можна було вибрати той самий файл знову
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    return (
        <div className="border-b border-slate-700 p-2 flex flex-wrap gap-1 bg-slate-900 sticky top-0 z-10 items-center">

            {/* Прихований інпут для файлів */}
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            {/* ... Твої кнопки форматування ... */}
            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Жирний">
                    <Bold size={18} />
                </MenuButton>
                {/* ... інші ... */}
            </div>

            {/* ... Групи ... */}

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                {/* ... */}
                <MenuButton onClick={handleImageClick} isActive={editor.isActive('image')} title="Завантажити фото">
                    <ImageIcon size={18} />
                </MenuButton>
            </div>

            {/* ... Undo/Redo ... */}
        </div>
    );
};