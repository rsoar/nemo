import { useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from 'tiptap-markdown'
import type { JSONContent } from '@tiptap/react'
import FormattingToolbar from './FormattingToolbar'

export interface BodyValue {
  json: string
  md: string
}

interface Props {
  initialJson?: string | null
  initialMarkdown?: string | null
  onChange: (value: BodyValue) => void
}

/** Resolves the one-time initial content: prefer the TipTap JSON doc, fall back
 *  to markdown (parsed by tiptap-markdown), else an empty document. */
function resolveInitialContent(
  json?: string | null,
  md?: string | null
): JSONContent | string {
  if (json) {
    try {
      return JSON.parse(json) as JSONContent
    } catch {
      /* corrupt JSON — fall back to markdown/empty */
    }
  }
  return md ?? ''
}

export default function RichEditor({
  initialJson,
  initialMarkdown,
  onChange
}: Props): JSX.Element {
  // Keep the latest onChange without re-creating the editor.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: 'Escreva sua anotação…' }),
      Markdown
    ],
    content: resolveInitialContent(initialJson, initialMarkdown),
    editorProps: {
      attributes: { class: 'prose-memo focus:outline-none' }
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current({
        json: JSON.stringify(editor.getJSON()),
        md: editor.storage.markdown.getMarkdown()
      })
    }
  })

  return (
    <div className="relative flex-1 overflow-y-auto">
      <EditorContent editor={editor} className="px-6 pb-28 pt-5" />
      {editor && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2">
          <div className="pointer-events-auto">
            <FormattingToolbar editor={editor} />
          </div>
        </div>
      )}
    </div>
  )
}
