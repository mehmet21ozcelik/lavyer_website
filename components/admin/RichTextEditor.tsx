'use client';
import { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, List, ListOrdered, ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface RichTextEditorProps {
    content: string;
    onChange: (html: string) => void;
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const editor = useEditor({
        extensions: [StarterKit, Image.configure({ inline: true, allowBase64: true })],
        content,
        immediatelyRender: false,
        // Prosemirror handles its own styling, but we ensure it has height and padding
        editorProps: {
            attributes: {
                style: 'min-height: 300px; padding: 1rem; outline: none; font-size: 1rem; line-height: 1.6; color: var(--text-primary);',
                class: 'tiptap-editor-content',
            },
        },
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    if (!editor) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            toast.error('Lütfen sadece görsel (PNG, JPG, vb.) seçin.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Görsel boyutu 5MB\'ı geçemez.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                editor.chain().focus().setImage({ src: data.url }).run();
            } else {
                toast.error('Görsel yüklenemedi.');
            }
        } catch (err) {
            toast.error('Bağlantı hatası.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input
            }
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const ToolbarBtn = ({ action, isActive, children, disabled }: any) => (
        <button
            type="button"
            onClick={action}
            disabled={disabled}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                border: 'none',
                borderRadius: '4px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                backgroundColor: isActive ? 'var(--secondary-color)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-secondary)',
                transition: 'all 0.2s',
                opacity: disabled ? 0.5 : 1
            }}
            onMouseOver={(e) => {
                if (!isActive && !disabled) e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
            }}
            onMouseOut={(e) => {
                if (!isActive && !disabled) e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            {children}
        </button>
    );

    return (
        <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: 'white',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
            {/* Global style override for the editor specifically so images look ok */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .tiptap-editor-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 4px;
                    margin: 1rem 0;
                }
                .tiptap-editor-content p {
                    margin-bottom: 0.75rem;
                }
                .tiptap-editor-content ul {
                    list-style-type: disc;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .tiptap-editor-content ol {
                    list-style-type: decimal;
                    padding-left: 1.5rem;
                    margin-bottom: 1rem;
                }
                .tiptap-editor-content strong {
                    font-weight: 700;
                    color: var(--text-primary);
                }
            `}} />

            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '4px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid var(--border-color)',
                alignItems: 'center'
            }}>
                <ToolbarBtn action={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}>
                    <Bold size={18} />
                </ToolbarBtn>
                <ToolbarBtn action={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}>
                    <Italic size={18} />
                </ToolbarBtn>
                <ToolbarBtn action={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}>
                    <Strikethrough size={18} />
                </ToolbarBtn>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />
                <ToolbarBtn action={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}>
                    <List size={18} />
                </ToolbarBtn>
                <ToolbarBtn action={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}>
                    <ListOrdered size={18} />
                </ToolbarBtn>
                <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    style={{ display: 'none' }}
                />

                <ToolbarBtn action={triggerFileInput} isActive={false} disabled={isUploading}>
                    {isUploading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <ImageIcon size={18} />}
                </ToolbarBtn>
            </div>

            <div style={{
                flexGrow: 1,
                backgroundColor: 'white',
                cursor: 'text'
            }} onClick={() => editor.commands.focus()}>
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
