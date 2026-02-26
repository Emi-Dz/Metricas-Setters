import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'

// ─── SVG Icons ───────────────────────────────────────────────────────────────

function IcBold() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>
}
function IcItalic() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
}
function IcUnderline() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
}
function IcStrike() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><path d="M16 6C16 6 14.5 4 12 4c-2.5 0-4 1.5-4 3.5 0 2 1.5 2.5 4 3.5"/><path d="M8 18c0 0 1.5 2 4 2 2.5 0 4-1.5 4-3.5"/></svg>
}
function IcH1() {
  return <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12h8"/><path d="M4 4v16"/><path d="M12 4v16"/><path d="M17 10l3-2v8"/></svg>
}
function IcH2() {
  return <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12h8"/><path d="M4 4v16"/><path d="M12 4v16"/><path d="M21 18H17c0-2 2-3 3-5 .5-.8.3-2-1-2-1 0-1.5.8-1.5 1.5"/></svg>
}
function IcH3() {
  return <svg width="16" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 12h8"/><path d="M4 4v16"/><path d="M12 4v16"/><path d="M17.5 10.5c.5-.5 1.3-.5 1.8 0 .4.5.4 1.4-.1 1.9"/><path d="M17 18c.5.5 1.3.5 1.8 0 .5-.5.5-1.5 0-2l-2-2"/></svg>
}
function IcBulletList() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>
}
function IcOrderedList() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4" stroke="currentColor" strokeWidth="1.5"/><path d="M4 10h2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" stroke="currentColor" strokeWidth="1.5"/></svg>
}
function IcBlockquote() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
}
function IcCode() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function IcCodeBlock() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="18" rx="2"/><polyline points="8 9 4 12 8 15"/><polyline points="16 9 20 12 16 15"/><line x1="12" y1="7" x2="12" y2="17"/></svg>
}
function IcAlignLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="15" y1="12" x2="3" y2="12"/><line x1="17" y1="18" x2="3" y2="18"/></svg>
}
function IcAlignCenter() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="17" y1="12" x2="7" y2="12"/><line x1="19" y1="18" x2="5" y2="18"/></svg>
}
function IcAlignRight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="9" y2="12"/><line x1="21" y1="18" x2="7" y2="18"/></svg>
}
function IcHighlight() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 11-6 6v3h3l6-6"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/></svg>
}
function IcHr() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>
}
function IcClearFormat() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4 8 20"/><line x1="17" y1="11" x2="22" y2="16"/><line x1="22" y1="11" x2="17" y2="16"/></svg>
}

// ─── Toolbar Button ───────────────────────────────────────────────────────────

function ToolbarBtn({ title, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      className={`rich-editor__toolbar-btn${active ? ' rich-editor__toolbar-btn--active' : ''}`}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault() // prevent editor losing focus
        onClick()
      }}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="rich-editor__toolbar-sep" />
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Rich text editor powered by Tiptap.
 *
 * @param {string}   value        - HTML string (controlled value)
 * @param {Function} onChange     - Called with new HTML string on every change
 * @param {string}   placeholder  - Placeholder text when empty
 * @param {string}   editorKey    - Change this to remount/reset the editor (e.g. modal open key)
 */
export function RichTextEditor({ value, onChange, placeholder }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Escribí el contenido de la nota...',
      }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value on mount / when value changes and editor exists
  useEffect(() => {
    if (!editor) return
    // Only update if the content actually differs (avoids cursor jumps)
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', false)
    }
  }, [value]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!editor) return null

  const c = editor.chain().focus()

  return (
    <div className="rich-editor">
      {/* ── Toolbar ── */}
      <div className="rich-editor__toolbar" role="toolbar" aria-label="Opciones de formato">

        {/* Inline styles */}
        <ToolbarBtn title="Negrita (Ctrl+B)" active={editor.isActive('bold')} onClick={() => c.toggleBold().run()}>
          <IcBold />
        </ToolbarBtn>
        <ToolbarBtn title="Cursiva (Ctrl+I)" active={editor.isActive('italic')} onClick={() => c.toggleItalic().run()}>
          <IcItalic />
        </ToolbarBtn>
        <ToolbarBtn title="Subrayado (Ctrl+U)" active={editor.isActive('underline')} onClick={() => c.toggleUnderline().run()}>
          <IcUnderline />
        </ToolbarBtn>
        <ToolbarBtn title="Tachado" active={editor.isActive('strike')} onClick={() => c.toggleStrike().run()}>
          <IcStrike />
        </ToolbarBtn>

        <Sep />

        {/* Headings */}
        <ToolbarBtn title="Título 1" active={editor.isActive('heading', { level: 1 })} onClick={() => c.toggleHeading({ level: 1 }).run()}>
          <IcH1 />
        </ToolbarBtn>
        <ToolbarBtn title="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => c.toggleHeading({ level: 2 }).run()}>
          <IcH2 />
        </ToolbarBtn>
        <ToolbarBtn title="Título 3" active={editor.isActive('heading', { level: 3 })} onClick={() => c.toggleHeading({ level: 3 }).run()}>
          <IcH3 />
        </ToolbarBtn>

        <Sep />

        {/* Lists */}
        <ToolbarBtn title="Lista con viñetas" active={editor.isActive('bulletList')} onClick={() => c.toggleBulletList().run()}>
          <IcBulletList />
        </ToolbarBtn>
        <ToolbarBtn title="Lista numerada" active={editor.isActive('orderedList')} onClick={() => c.toggleOrderedList().run()}>
          <IcOrderedList />
        </ToolbarBtn>

        <Sep />

        {/* Blocks */}
        <ToolbarBtn title="Cita" active={editor.isActive('blockquote')} onClick={() => c.toggleBlockquote().run()}>
          <IcBlockquote />
        </ToolbarBtn>
        <ToolbarBtn title="Código en línea" active={editor.isActive('code')} onClick={() => c.toggleCode().run()}>
          <IcCode />
        </ToolbarBtn>
        <ToolbarBtn title="Bloque de código" active={editor.isActive('codeBlock')} onClick={() => c.toggleCodeBlock().run()}>
          <IcCodeBlock />
        </ToolbarBtn>

        <Sep />

        {/* Text alignment */}
        <ToolbarBtn title="Alinear izquierda" active={editor.isActive({ textAlign: 'left' })} onClick={() => c.setTextAlign('left').run()}>
          <IcAlignLeft />
        </ToolbarBtn>
        <ToolbarBtn title="Centrar" active={editor.isActive({ textAlign: 'center' })} onClick={() => c.setTextAlign('center').run()}>
          <IcAlignCenter />
        </ToolbarBtn>
        <ToolbarBtn title="Alinear derecha" active={editor.isActive({ textAlign: 'right' })} onClick={() => c.setTextAlign('right').run()}>
          <IcAlignRight />
        </ToolbarBtn>

        <Sep />

        {/* Highlight + HR */}
        <ToolbarBtn title="Resaltar" active={editor.isActive('highlight')} onClick={() => c.toggleHighlight().run()}>
          <IcHighlight />
        </ToolbarBtn>
        <ToolbarBtn title="Línea horizontal" active={false} onClick={() => c.setHorizontalRule().run()}>
          <IcHr />
        </ToolbarBtn>

        <Sep />

        {/* Clear formatting */}
        <ToolbarBtn title="Limpiar formato" active={false} onClick={() => c.clearNodes().unsetAllMarks().run()}>
          <IcClearFormat />
        </ToolbarBtn>

      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} className="rich-editor__content" />
    </div>
  )
}
