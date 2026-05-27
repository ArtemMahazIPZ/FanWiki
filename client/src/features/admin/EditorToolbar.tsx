import { Editor } from '@tiptap/react';
import { useRef, useState } from 'react';
import {
    Bold, Italic, Strikethrough,
    Heading1, Heading2, List, ListOrdered, Quote,
    Undo, Redo, Image as ImageIcon,
    Type, Maximize2,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Link2, Unlink
} from 'lucide-react';

import { cn } from '../../utils/cn';
import { api } from '../../api/axios';
import { ArticleLinkModal } from './ArticleLinkModal';
import { useTranslation } from 'react-i18next';

interface EditorToolbarProps {
    editor: Editor | null;
    /** Override the wrapper div's className. Defaults to the main sticky toolbar style. */
    className?: string;
}

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

export const EditorToolbar = ({ editor, className }: EditorToolbarProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const { t } = useTranslation();

    if (!editor) return null;

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await api.post('/Wiki/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            editor.chain().focus().setImage({ src: res.data.url }).run();
        } catch (error) {
            alert(t('editor.image_upload_error'));
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value) {
            editor.chain().focus().setFontSize(value).run();
        } else {
            editor.chain().focus().unsetFontSize().run();
        }
    };

    const setCaption = (caption: string) => {
        editor.chain().focus().updateAttributes('image', { caption }).run();
    };

    const applyWidth = (raw: string) => {
        const trimmed = raw.trim();
        if (!trimmed) return;
        // Accept plain numbers as px, pass through anything with a unit
        const value = /^\d+$/.test(trimmed) ? `${trimmed}px` : trimmed;
        editor.chain().focus().updateAttributes('image', { width: value }).run();
    };

    const handleArticleLink = (slug: string) => {
        const url = `/wiki/${slug}`;
        editor.chain().focus().setLink({ href: url }).run();
        setShowLinkModal(false);
    };

    return (
        <div className={className ?? "border-b border-slate-700 p-2 flex flex-wrap gap-1 bg-slate-900 sticky top-20 z-30 items-center shadow-[0_4px_12px_rgba(0,0,0,0.4)]"}>

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
            />

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo size={18} /></MenuButton>
            </div>

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strike"><Strikethrough size={18} /></MenuButton>
            </div>

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="H2"><Heading1 size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="H3"><Heading2 size={18} /></MenuButton>
            </div>

            <div className="flex items-center gap-2 border-r border-slate-700 pr-2 mr-2">
                <Type size={16} className="text-slate-500" />
                <input
                    type="number"
                    min="8"
                    max="72"
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-sm text-white focus:border-emerald-500 outline-none"
                    placeholder="16"
                    onChange={handleFontSizeChange}
                    defaultValue="16"
                    title={t('editor.font_size')}
                />
            </div>

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Left"><AlignLeft size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Right"><AlignRight size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().setTextAlign('justify').run()} isActive={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={18} /></MenuButton>
            </div>

            <div className="flex gap-1 border-r border-slate-700 pr-2 mr-2">
                <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullet List"><List size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={18} /></MenuButton>
                <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Quote"><Quote size={18} /></MenuButton>
            </div>

            <div className="flex gap-1 items-center">
                <MenuButton onClick={handleImageClick} isActive={editor.isActive('image')} title={t('editor.upload_image')}>
                    <ImageIcon size={18} />
                </MenuButton>

                {editor.isActive('image') && (
                    <div className="flex items-center bg-slate-800 rounded ml-2 p-1 animate-in fade-in zoom-in duration-200 border border-slate-700 gap-2">
                        {/* Width input */}
                        <Maximize2 size={14} className="text-slate-500 ml-1 flex-shrink-0" />
                        <input
                            key={editor.getAttributes('image').width}
                            type="text"
                            title={t('editor.image_width_px')}
                            placeholder={t('editor.image_width_px')}
                            className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:border-emerald-500 outline-none"
                            defaultValue={editor.getAttributes('image').width || '100%'}
                            onBlur={(e) => applyWidth(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyWidth((e.target as HTMLInputElement).value); } }}
                        />

                        <div className="w-px h-4 bg-slate-700 mx-1 flex-shrink-0" />

                        {/* Caption input */}
                        <input
                            key={`cap-${editor.getAttributes('image').caption}`}
                            type="text"
                            placeholder={t('editor.caption_placeholder')}
                            className="w-40 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-white focus:border-emerald-500 outline-none"
                            defaultValue={editor.getAttributes('image').caption || ''}
                            onBlur={(e) => setCaption(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setCaption((e.target as HTMLInputElement).value); } }}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-1 border-l border-slate-700 pl-2 ml-2">
                <MenuButton onClick={() => setShowLinkModal(true)} isActive={editor.isActive('link')} title="Link to Article">
                    <Link2 size={18} />
                </MenuButton>
                {editor.isActive('link') && (
                    <MenuButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
                        <Unlink size={18} />
                    </MenuButton>
                )}
            </div>

            {showLinkModal && (
                <ArticleLinkModal
                    onSelect={handleArticleLink}
                    onClose={() => setShowLinkModal(false)}
                />
            )}
        </div>
    );
};