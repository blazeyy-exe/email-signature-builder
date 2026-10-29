'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Check, ChevronDown, ChevronLeft, Copy, Download,
  Image as ImageIcon, LayoutTemplate, Link2, Palette, Plus, RotateCcw, ShieldCheck,
  Trash2, UserRound, X,
} from 'lucide-react'
import { Brand } from '@/components/landing'
import {
  defaultData, defaultDesign, plainTextSignature, renderSignature,
  type DesignSettings, type SignatureData, type SocialLink, type TemplateId,
} from '@/lib/signature'

type Section = 'details' | 'branding' | 'links' | 'design' | 'tools'

const templates: { id: TemplateId; name: string; description: string; accent: string }[] = [
  { id: 'classic', name: 'Classic', description: 'Clear hierarchy with compact contact details.', accent: '#c96f4b' },
  { id: 'profile', name: 'Profile', description: 'Put a face to your name with a photo-led layout.', accent: '#537c72' },
  { id: 'minimal', name: 'Minimal', description: 'Quiet typography for a confident first impression.', accent: '#6e6b63' },
  { id: 'corporate', name: 'Corporate', description: 'A composed layout for teams and organizations.', accent: '#3578a8' },
  { id: 'creator', name: 'Creator', description: 'Make your work and links easy to discover.', accent: '#9a5a88' },
  { id: 'founder', name: 'Founder', description: 'A focused identity for people building things.', accent: '#be8c34' },
  { id: 'consultant', name: 'Consultant', description: 'A clear, appointment-ready signature.', accent: '#4f756f' },
  { id: 'freelancer', name: 'Freelancer', description: 'Portfolio-first with services and contact.', accent: '#b76c52' },
  { id: 'academic', name: 'Academic', description: 'Credentials, department, and research links.', accent: '#6a628b' },
  { id: 'nonprofit', name: 'Nonprofit', description: 'Mission-led and organization-forward.', accent: '#6b8a5b' },
  { id: 'sales', name: 'Sales', description: 'Professional contact with a booking focus.', accent: '#3f7fa4' },
  { id: 'compact', name: 'Compact', description: 'Low-density for frequent conversations.', accent: '#7b7770' },
]

const sectionItems = [
  { id: 'details', label: 'Personal details', icon: UserRound },
  { id: 'branding', label: 'Photos & branding', icon: ImageIcon },
  { id: 'links', label: 'Social links', icon: Link2 },
  { id: 'design', label: 'Design', icon: Palette },
  { id: 'tools', label: 'Tools & export', icon: ShieldCheck },
] as const

const palettes = [
  ['#17212b', '#c96f4b', '#3578a8'],
  ['#1b3b36', '#d47e45', '#537c72'],
  ['#242326', '#9a5a88', '#5d5a78'],
]

const STORAGE_KEY = 'signature-studio-v1'
const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
const isHttps = (v: string) => /^https:\/\/\S+$/i.test(v)

function downloadFile(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = name
  a.click()
  URL.revokeObjectURL(url)
}

function getChecks(html: string) {
  return [
    { label: 'HTTPS links', ok: !html.includes('http://') },
    { label: 'Inline email-safe markup', ok: !html.includes('<style') && !html.includes('display:flex') },
    { label: 'Image alternative text', ok: !html.includes('<img') || html.includes('alt=') },
    { label: 'Signature length', ok: html.length < 12000 },
  ]
}

/* ---------- Form primitives ---------- */

function Field({ label, value, onChange, placeholder, type = 'text', error, hint }: {
  label: string; value: string; onChange: (v: string) => void
  placeholder?: string; type?: string; error?: string; hint?: string
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
      />
      {error ? <small className="field-hint error" role="alert">{error}</small> : hint ? <small className="field-hint">{hint}</small> : null}
    </label>
  )
}

function Toggle({ checked, onChange, label = 'Toggle visibility' }: {
  checked: boolean; onChange: (v: boolean) => void; label?: string
}) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label}
      onClick={() => onChange(!checked)} className={`toggle ${checked ? 'on' : ''}`}>
      <span />
    </button>
  )
}

/* ---------- Editor sections ---------- */

type UpdateFn = (key: keyof SignatureData, value: string) => void

function Details({ data, update }: { data: SignatureData; update: UpdateFn }) {
  return (
    <div className="form-stack">
      <section className="form-card">
        <div className="card-kicker">IDENTITY</div>
        <div className="form-grid">
          <Field label="Full name" value={data.name} onChange={v => update('name', v)} placeholder="Alex Morgan" />
          <Field label="Display name" value={data.displayName} onChange={v => update('displayName', v)} placeholder="Defaults to full name" />
          <Field label="Professional title" value={data.title} onChange={v => update('title', v)} placeholder="Product designer" />
          <Field label="Organization" value={data.organization} onChange={v => update('organization', v)} placeholder="Northstar" />
        </div>
        <Field label="Short tagline" value={data.tagline} onChange={v => update('tagline', v)} placeholder="One line on what you do" />
      </section>
      <section className="form-card">
        <div className="card-kicker">CONTACT</div>
        <div className="form-grid">
          <Field label="Work email" type="email" value={data.email} onChange={v => update('email', v)} placeholder="alex@northstar.co"
            error={data.email && !isEmail(data.email) ? 'Enter a valid email address.' : undefined} />
          <Field label="Phone number" value={data.phone} onChange={v => update('phone', v)} placeholder="+1 312 847 1928" />
          <Field label="Website" value={data.website} onChange={v => update('website', v)} placeholder="https://northstar.co"
            error={data.website && !isHttps(data.website) ? 'Use a full https:// address.' : undefined} />
          <Field label="Location" value={data.location} onChange={v => update('location', v)} placeholder="Chicago, US" />
        </div>
      </section>
      <div className="tip"><ShieldCheck /><span>Your details stay in this browser. No account required.</span></div>
    </div>
  )
}

function Branding({ data, update }: { data: SignatureData; update: UpdateFn }) {
  return (
    <div className="form-stack">
      <section className="form-card">
        <div className="card-kicker">PROFILE PHOTO</div>
        <p className="helper">Use a public HTTPS image URL so it loads for the people you email.</p>
        <Field label="Photo URL" value={data.photoUrl} onChange={v => update('photoUrl', v)} placeholder="https://images.example.com/photo.jpg"
          error={data.photoUrl && !isHttps(data.photoUrl) ? 'Use a full https:// address.' : undefined} />
        <Field label="Alt text" value={data.photoAlt} onChange={v => update('photoAlt', v)} placeholder="Describe the photo" hint="Shown when images are blocked." />
        {data.photoUrl && isHttps(data.photoUrl) && <img className="asset-preview" src={data.photoUrl} alt={data.photoAlt || 'Preview of your profile photo'} />}
      </section>
      <section className="form-card">
        <div className="card-kicker">COMPANY LOGO <span className="optional">OPTIONAL</span></div>
        <p className="helper">Works best with the Corporate and Founder templates.</p>
        <Field label="Logo URL" value={data.logoUrl} onChange={v => update('logoUrl', v)} placeholder="https://northstar.co/logo.png"
          error={data.logoUrl && !isHttps(data.logoUrl) ? 'Use a full https:// address.' : undefined} />
        <Field label="Alt text" value={data.logoAlt} onChange={v => update('logoAlt', v)} placeholder="Northstar logo" />
      </section>
    </div>
  )
}

function Links({ data, setSocial, addSocial, removeSocial }: {
  data: SignatureData
  setSocial: (id: string, key: keyof SocialLink, value: string | boolean) => void
  addSocial: () => void
  removeSocial: (id: string) => void
}) {
  return (
    <div className="form-stack">
      <section className="form-card">
        <div className="card-kicker">PROFESSIONAL LINKS</div>
        <p className="helper">Only HTTPS links are included in your signature.</p>
        {data.socials.length === 0 && <p className="empty-inline">No links yet. Add one to show it in your signature.</p>}
        {data.socials.map(s => (
          <div className="social-row" key={s.id}>
            <Toggle checked={s.enabled} onChange={v => setSocial(s.id, 'enabled', v)} label={`Show ${s.platform} link`} />
            <select value={s.platform} onChange={e => setSocial(s.id, 'platform', e.target.value)} aria-label="Platform">
              <option>LinkedIn</option><option>GitHub</option><option>Instagram</option><option>X</option><option>Website</option>
            </select>
            <input value={s.url} onChange={e => setSocial(s.id, 'url', e.target.value)} placeholder="https://..."
              aria-label={`${s.platform} URL`} aria-invalid={s.url && !isHttps(s.url) ? true : undefined} />
            <button className="delete-button" onClick={() => removeSocial(s.id)} aria-label={`Remove ${s.platform} link`}><Trash2 /></button>
          </div>
        ))}
        <button className="add-link" onClick={addSocial}><Plus /> Add a link</button>
      </section>
      <div className="tip"><Link2 /><span>Text links are the most compatible across email clients.</span></div>
    </div>
  )
}

function Design({ design, update }: {
  design: DesignSettings
  update: (key: keyof DesignSettings, value: string | number | boolean) => void
}) {
  return (
    <div className="form-stack">
      <section className="form-card">
        <div className="card-kicker">COLOR PALETTE</div>
        <div className="palette-row">
          {palettes.map(p => {
            const active = p[0] === design.primary && p[1] === design.accent && p[2] === design.link
            return (
              <button key={p[0]} className={`palette ${active ? 'active' : ''}`} aria-pressed={active}
                aria-label={`Apply palette ${p.join(', ')}`}
                onClick={() => { update('primary', p[0]); update('accent', p[1]); update('link', p[2]) }}>
                {p.map(c => <span key={c} style={{ background: c }} />)}
              </button>
            )
          })}
        </div>
        <div className="color-grid">
          {(['primary', 'accent', 'link'] as const).map(key => (
            <label className="color-field" key={key}>
              <span>{key[0].toUpperCase() + key.slice(1)}</span>
              <input type="color" value={design[key]} onChange={e => update(key, e.target.value)} />
              <code className="color-hex">{design[key].toUpperCase()}</code>
            </label>
          ))}
        </div>
      </section>
      <section className="form-card">
        <div className="card-kicker">TYPE & SPACING</div>
        <label className="field">
          <span>Font family</span>
          <select value={design.font} onChange={e => update('font', e.target.value)}>
            <option>Arial, Helvetica, sans-serif</option>
            <option>Verdana, Geneva, sans-serif</option>
            <option>Georgia, serif</option>
            <option>Tahoma, sans-serif</option>
          </select>
        </label>
        <label className="range-field">
          <span>Name size <b>{design.nameSize}px</b></span>
          <input type="range" min="16" max="30" value={design.nameSize} onChange={e => update('nameSize', Number(e.target.value))} />
        </label>
        <div className="setting-row">
          <span>Show divider</span>
          <Toggle checked={design.divider} onChange={v => update('divider', v)} label="Show divider" />
        </div>
        <button className="reset-design" onClick={() => {
          update('primary', defaultDesign.primary); update('accent', defaultDesign.accent)
          update('link', defaultDesign.link); update('nameSize', defaultDesign.nameSize)
        }}>
          <RotateCcw /> Reset design defaults
        </button>
      </section>
    </div>
  )
}

function Tools({ data, html }: { data: SignatureData; html: string }) {
  const checks = getChecks(html)
  const vcard = [
    'BEGIN:VCARD', 'VERSION:3.0',
    data.name && `FN:${data.name}`,
    data.organization && `ORG:${data.organization}`,
    data.title && `TITLE:${data.title}`,
    data.email && `EMAIL;TYPE=WORK:${data.email}`,
    data.phone && `TEL;TYPE=WORK:${data.phone}`,
    data.website && `URL:${data.website}`,
    data.location && `ADR;TYPE=WORK:;;${data.location}`,
    'END:VCARD',
  ].filter(Boolean).join('\r\n')

  return (
    <div className="form-stack">
      <section className="form-card">
        <div className="card-kicker">COMPATIBILITY LAB</div>
        <p className="helper">Static checks inspect the generated HTML. They don’t replace testing in a real inbox.</p>
        <div className="check-list">
          {checks.map(check => (
            <div className="check-row" key={check.label}>
              <span className={`check-dot ${check.ok ? 'pass' : 'warn'}`}>{check.ok ? <Check /> : '!'}</span>
              <span>{check.label}</span>
              <strong className={check.ok ? 'pass' : 'warn'}>{check.ok ? 'Passed' : 'Needs attention'}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="form-card">
        <div className="card-kicker">CONTACT SHARING</div>
        <p className="helper">Export only what you’ve entered, as a vCard or a backup of this signature.</p>
        <div className="tool-actions">
          <button className="button outline compact" onClick={() => downloadFile('contact.vcf', vcard, 'text/vcard')}><Download /> vCard</button>
          <button className="button outline compact" onClick={() => downloadFile('signature-profile.json', JSON.stringify({ version: 1, data }, null, 2), 'application/json')}><Download /> Backup profile</button>
        </div>
      </section>
      <section className="form-card">
        <div className="card-kicker">INSTALLING IT</div>
        <p className="helper">Copy the signature, then paste it into your client. Clipboard access can’t install it for you.</p>
        <div className="install-grid">
          <div><strong>Gmail</strong><p>Settings → See all settings → General → Signature → paste.</p></div>
          <div><strong>Outlook web</strong><p>Settings → Mail → Compose and reply → paste and save.</p></div>
          <div><strong>Apple Mail</strong><p>Mail → Settings → Signatures → create one and paste.</p></div>
        </div>
      </section>
    </div>
  )
}

/* ---------- Template picker (thumbnails render the user's real signature) ---------- */

function TemplatePicker({ current, data, design, onSelect, onClose }: {
  current: TemplateId; data: SignatureData; design: DesignSettings
  onSelect: (id: TemplateId) => void; onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const filtered = templates.filter(t => `${t.name} ${t.description}`.toLowerCase().includes(query.toLowerCase()))
  const previews = useMemo(
    () => Object.fromEntries(templates.map(t => [t.id, renderSignature(data, t.id, design)])) as Record<TemplateId, string>,
    [data, design],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="template-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="template-panel" role="dialog" aria-modal="true" aria-labelledby="template-title">
        <div className="template-panel-head">
          <div>
            <span className="eyebrow">TEMPLATE LIBRARY</span>
            <h2 id="template-title">Choose a starting point</h2>
            <p className="helper">Previews use your details. Switching never loses them.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X /></button>
        </div>
        <label className="template-search">
          <span className="sr-only">Search templates</span>
          <input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by style or use case" />
        </label>
        <div className="template-grid">
          {filtered.map(t => (
            <button key={t.id} className={`template-card ${current === t.id ? 'selected' : ''}`}
              onClick={() => onSelect(t.id)} aria-pressed={current === t.id}>
              <div className="template-thumb" aria-hidden="true">
                <div className="thumb-scale" dangerouslySetInnerHTML={{ __html: previews[t.id] }} />
              </div>
              <div className="template-card-copy">
                <div><strong>{t.name}</strong><p>{t.description}</p></div>
                {current === t.id ? <span className="selected-check"><Check /></span> : <ArrowRight />}
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && <div className="empty-template">No templates match that search.</div>}
      </div>
    </div>
  )
}

/* ---------- App ---------- */

export default function SignatureStudio() {
  const router = useRouter()
  const [data, setData] = useState<SignatureData>(defaultData)
  const [design, setDesign] = useState<DesignSettings>(defaultDesign)
  const [template, setTemplate] = useState<TemplateId>('profile')
  const [section, setSection] = useState<Section>('details')
  const [showTemplates, setShowTemplates] = useState(false)

  const [copied, setCopied] = useState('')
  const [saved, setSaved] = useState(false)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setData({ ...defaultData, ...parsed.data })
        setDesign({ ...defaultDesign, ...parsed.design })
        setTemplate(parsed.template || 'profile')
      } catch { /* ignore corrupted storage */ }
    }
    setHydrated(true)
  }, [])

  // Only persist after hydration, otherwise defaults overwrite the saved draft on first paint.
  useEffect(() => {
    if (!hydrated) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data, design, template }))
    setSaved(true)
    const timer = setTimeout(() => setSaved(false), 1600)
    return () => clearTimeout(timer)
  }, [data, design, template, hydrated])

  const html = useMemo(() => renderSignature(data, template, design), [data, template, design])
  const checks = useMemo(() => getChecks(html), [html])
  const checksPassed = checks.filter(c => c.ok).length
  const sizeKb = (html.length / 1024).toFixed(1)
  const currentTemplate = templates.find(t => t.id === template)
  const stepIndex = sectionItems.findIndex(i => i.id === section)
  const totalSteps = sectionItems.length

  // Completeness drives the sidebar card and the "next step" hint
  const checklist = [
    { done: !!data.name, hint: 'add your full name' },
    { done: !!data.title, hint: 'add your title' },
    { done: !!data.organization, hint: 'add your organization' },
    { done: !!data.email, hint: 'add a work email' },
    { done: !!data.phone, hint: 'add a phone number' },
    { done: !!data.website, hint: 'add your website' },
    { done: !!data.photoUrl, hint: 'add a profile photo' },
    { done: data.socials.some(s => s.enabled && s.url), hint: 'add a social link' },
  ]
  const strength = Math.round((checklist.filter(c => c.done).length / checklist.length) * 100)
  const nextHint = checklist.find(c => !c.done)?.hint

  const navMeta: Record<Section, string> = {
    details: `${[data.name, data.title, data.organization, data.email, data.phone, data.website].filter(Boolean).length}/6`,
    branding: `${[data.photoUrl, data.logoUrl].filter(Boolean).length}/2`,
    links: `${data.socials.filter(s => s.enabled && s.url).length}`,
    design: '',
    tools: `${checksPassed}/${checks.length}`,
  }

  const update: UpdateFn = (key, value) => setData(c => ({ ...c, [key]: value }))
  const updateDesign = (key: keyof DesignSettings, value: string | number | boolean) =>
    setDesign(c => ({ ...c, [key]: value } as DesignSettings))
  const addSocial = () =>
    setData(c => ({ ...c, socials: [...c.socials, { id: crypto.randomUUID(), platform: 'LinkedIn', url: '', enabled: true }] }))
  const removeSocial = (id: string) => setData(c => ({ ...c, socials: c.socials.filter(s => s.id !== id) }))
  const setSocial = (id: string, key: keyof SocialLink, value: string | boolean) =>
    setData(c => ({ ...c, socials: c.socials.map(s => (s.id === id ? { ...s, [key]: value } : s)) }))

  const copy = async (kind: 'rich' | 'html' | 'text') => {
    try {
      if (kind === 'rich' && navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([plainTextSignature(data)], { type: 'text/plain' }),
        })])
      } else {
        await navigator.clipboard.writeText(kind === 'html' ? html : plainTextSignature(data))
      }
      setCopied(kind)
    } catch {
      setCopied('failed')
    }
    setTimeout(() => setCopied(''), 2200)
  }

  const reset = () => {
    if (!confirm('Clear your saved signature and start over?')) return
    setData(defaultData); setDesign(defaultDesign); setTemplate('profile')
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <Brand onClick={() => router.push('/')} />
        <div className="topbar-center">
          <span className="eyebrow">TEMPLATE</span>
          <button className="template-pill" aria-haspopup="dialog" aria-expanded={showTemplates} onClick={() => setShowTemplates(true)}>
            <i style={{ background: currentTemplate?.accent }} />
            {currentTemplate?.name}
            <ChevronDown />
          </button>
        </div>
        <div className="top-actions">
          <span className="save-state" role="status"><i className={`live-dot ${saved ? 'on' : ''}`} />{saved ? 'Saved locally' : 'Private draft'}</span>
          <button className="icon-button" onClick={reset} aria-label="Reset signature" title="Start over"><RotateCcw /></button>
          <button className="button primary compact" onClick={() => copy('rich')}>
            {copied === 'rich' ? <Check /> : <Copy />} {copied === 'rich' ? 'Copied' : 'Copy signature'}
          </button>
        </div>
      </header>

      {showTemplates && (
        <TemplatePicker current={template} data={data} design={design}
          onSelect={id => { setTemplate(id); setShowTemplates(false) }} onClose={() => setShowTemplates(false)} />
      )}

      <main className="builder-layout">
        <aside className="sidebar">
          <div className="strength">
            <div className="strength-head"><span className="eyebrow">COMPLETENESS</span><b>{strength}%</b></div>
            <div className="strength-bar"><i style={{ width: `${strength}%` }} /></div>
            <p aria-live="polite">{nextHint ? `Next: ${nextHint}.` : 'Everything is filled in. Copy it when you’re ready.'}</p>
          </div>
          <nav aria-label="Editor sections">
            {sectionItems.map(item => {
              const Icon = item.icon
              const active = section === item.id
              return (
                <button key={item.id} className={`nav-item ${active ? 'active' : ''}`}
                  aria-current={active ? 'step' : undefined} onClick={() => setSection(item.id)}>
                  <Icon /><span>{item.label}</span>
                  {navMeta[item.id] && <em className="nav-meta">{navMeta[item.id]}</em>}
                </button>
              )
            })}
          </nav>
          <div className="sidebar-bottom">
            <button className="button outline compact block" onClick={() => setShowTemplates(true)}>
              <LayoutTemplate /> Browse templates <span className="count">{templates.length}</span>
            </button>
          </div>
        </aside>

        <section className="editor">
          <div className="editor-header">
            <div>
              <span className="eyebrow">STEP 0{stepIndex + 1}</span>
              <h2>{sectionItems[stepIndex].label}</h2>
            </div>
            <span className="progress">{stepIndex + 1}<span> / {totalSteps}</span></span>
          </div>
          <div className="progress-bar" role="progressbar" aria-valuemin={1} aria-valuemax={totalSteps} aria-valuenow={stepIndex + 1}>
            <i style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
          </div>

          <div key={section} className="stage">
            {section === 'details' && <Details data={data} update={update} />}
            {section === 'branding' && <Branding data={data} update={update} />}
            {section === 'links' && <Links data={data} setSocial={setSocial} addSocial={addSocial} removeSocial={removeSocial} />}
            {section === 'design' && <Design design={design} update={updateDesign} />}
            {section === 'tools' && <Tools data={data} html={html} />}
          </div>

          <div className="editor-footer">
            <button className="text-action" disabled={stepIndex === 0} onClick={() => setSection(sectionItems[stepIndex - 1].id)}><ChevronLeft /> Back</button>
            {stepIndex < totalSteps - 1
              ? <button className="button dark compact" onClick={() => setSection(sectionItems[stepIndex + 1].id)}>Continue <ArrowRight /></button>
              : <button className="button primary compact" onClick={() => copy('rich')}><Copy /> Copy signature</button>}
          </div>
        </section>

        <section className="preview-area">
          <div className="preview-toolbar">
            <div><span className="eyebrow">LIVE PREVIEW</span><p>How it will look when it lands in an inbox.</p></div>
          </div>          <div className="email-window">
            <div className="email-toolbar">
              <span className="email-dot red" /><span className="email-dot yellow" /><span className="email-dot green" />
              <span className="email-context">New message</span>
              {!data.name && <span className="sample-badge">Sample · add your name to personalise</span>}
            </div>
            <div className="email-lines"><span>To</span><i /><span>Subject</span><i /></div>
            <div className="email-body" aria-hidden="true"><i className="w-90" /><i className="w-70" /><i className="w-45" /></div>
            <div className={`signature-canvas ${!data.name ? 'is-sample' : ''}`} dangerouslySetInnerHTML={{ __html: html }} />
          </div>

          {copied && (
            <div className={`toast ${copied === 'failed' ? 'error' : ''}`} role="status">
              {copied === 'failed' ? 'Copy failed.' : 'Copied to clipboard'}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}