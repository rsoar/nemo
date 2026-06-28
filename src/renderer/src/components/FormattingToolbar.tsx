import { useState } from 'react'
import type { ReactNode } from 'react'
import type { Editor } from '@tiptap/react'
import { Bold, Italic, List, Quote, Code2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

export default function FormattingToolbar({ editor }: { editor: Editor }): JSX.Element {
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')

  function applyLink(): void {
    const url = linkUrl.trim()
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
    } else {
      editor.chain().focus().unsetLink().run()
    }
    setLinkUrl('')
    setLinkOpen(false)
  }

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-panel-elev px-1.5 py-1.5 shadow-toolbar ring-1 ring-border">
      <Btn
        label="Título"
        active={editor.isActive('heading', { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span className="text-[11px] font-semibold">H</span>
      </Btn>
      <Btn label="Negrito" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold className="size-3.5" strokeWidth={2.4} />
      </Btn>
      <Btn label="Itálico" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic className="size-3.5" strokeWidth={2.2} />
      </Btn>

      <Divider />

      <Btn label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List className="size-3.5" />
      </Btn>
      <Btn label="Citação" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        <Quote className="size-3.5" />
      </Btn>
      <Btn label="Código" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code2 className="size-3.5" />
      </Btn>

      <Divider />

      <Btn label="Link" active={editor.isActive('link') || linkOpen} onClick={() => setLinkOpen((v) => !v)}>
        <LinkIcon className="size-3.5" />
      </Btn>
      <Btn label="Imagem (em breve)" disabled onClick={() => undefined}>
        <ImageIcon className="size-3.5" />
      </Btn>

      {linkOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            applyLink()
          }}
          className="ml-1 flex items-center"
        >
          <input
            autoFocus
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://…"
            className="w-32 rounded bg-input px-2 py-1 text-[11px] text-foreground ring-1 ring-border focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </form>
      )}
    </div>
  )
}

function Divider(): JSX.Element {
  return <div className="mx-1 h-4 w-px bg-border" />
}

function Btn({
  children,
  onClick,
  label,
  active,
  disabled
}: {
  children: ReactNode
  onClick: () => void
  label: string
  active?: boolean
  disabled?: boolean
}): JSX.Element {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={clsx(
        'flex size-7 items-center justify-center rounded transition-colors',
        disabled && 'cursor-not-allowed opacity-40',
        active
          ? 'bg-subtle text-foreground'
          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
      )}
    >
      {children}
    </button>
  )
}
