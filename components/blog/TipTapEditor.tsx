'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

interface TipTapEditorProps {
  content?: string
  onChange: (html: string) => void
}

export default function TipTapEditor({ content = '', onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your post content...' }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[300px] p-4 focus:outline-none',
      },
    },
  })

  if (!editor) return null

  function Btn({
    onClick,
    active,
    children,
  }: {
    onClick: () => void
    active?: boolean
    children: React.ReactNode
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`px-2 py-1 rounded text-sm font-medium ${
          active ? 'bg-gray-200 text-gray-900' : 'text-gray-500 hover:bg-gray-100'
        }`}
      >
        {children}
      </button>
    )
  }

  const Sep = () => <div className="w-px h-4 bg-gray-300 mx-1 self-center" />

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <em>I</em>
        </Btn>
        <Sep />
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          H2
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
        >
          H3
        </Btn>
        <Sep />
        <Btn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          • List
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          1. List
        </Btn>
        <Btn
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
        >
          ❝
        </Btn>
        <Sep />
        <Btn
          onClick={() => {
            const url = window.prompt('URL:')
            if (url) editor.chain().focus().setLink({ href: url }).run()
          }}
          active={editor.isActive('link')}
        >
          Link
        </Btn>
        <Sep />
        <Btn onClick={() => editor.chain().focus().undo().run()}>↩</Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()}>↪</Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
