'use client';
import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, List, ListOrdered, ImageIcon } from 'lucide-react';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit, Image],
        content,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] bg-white p-4 border rounded-md',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    // Update editor content if parent state changes (e.g. after fetch in Edit mode)
    // Only update if current editor content is different to avoid cursor reset loops
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    const ToolbarBtn = ({ action, isActive, children }: any) => (
        <button
            type="button"
            onClick={action}
            className={`p-2 rounded hover:bg-gray-100 ${isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-600'}`}
        >
            {children}
        </button>
    );

    const addImage = () => {
        const url = window.prompt('URL');
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
    };

    return (
        <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col" style={{ borderColor: 'var(--border-color)' }}>
            {/* Toolbar */}
            <div className="flex flex-wrap gap-1 p-2 bg-gray-50 border-b border-gray-300 items-center" style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid var(--border-color)' }}>
                <ToolbarBtn action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                    <Bold size={18} />
                </ToolbarBtn>
                <ToolbarBtn action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                    <Italic size={18} />
                </ToolbarBtn>
                <ToolbarBtn action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                    <Strikethrough size={18} />
                </ToolbarBtn>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <ToolbarBtn action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <List size={18} />
                </ToolbarBtn>
                <ToolbarBtn action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <ListOrdered size={18} />
                </ToolbarBtn>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <ToolbarBtn action={addImage} isActive={false}>
                    <ImageIcon size={18} />
                </ToolbarBtn>
            </div>

            {/* Editor Content */}
            <div style={{ padding: '0.5rem', flexGrow: 1, backgroundColor: 'white' }}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
