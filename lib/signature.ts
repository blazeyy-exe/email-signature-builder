export type TemplateId = 'classic' | 'profile' | 'minimal' | 'corporate' | 'creator' | 'founder' | 'consultant' | 'freelancer' | 'academic' | 'nonprofit' | 'sales' | 'compact'
export type SocialPlatform = 'LinkedIn' | 'GitHub' | 'Instagram' | 'Facebook' | 'X' | 'YouTube' | 'TikTok' | 'Threads' | 'Behance' | 'Dribbble' | 'Website'

export type SocialLink = { id: string; platform: SocialPlatform; url: string; enabled: boolean }
export type SignatureData = {
  name: string; displayName: string; title: string; organization: string; email: string; phone: string; website: string; location: string; tagline: string; photoUrl: string; photoAlt: string; logoUrl: string; logoAlt: string; socials: SocialLink[]
}
export type DesignSettings = { primary: string; secondary: string; accent: string; link: string; font: string; nameSize: number; density: 'comfortable' | 'compact'; divider: boolean; photoShape: 'circle' | 'square'; socialStyle: 'icons' | 'text' }

export const defaultData: SignatureData = { name: '', displayName: '', title: '', organization: '', email: '', phone: '', website: '', location: '', tagline: '', photoUrl: '', photoAlt: 'Profile photo', logoUrl: '', logoAlt: 'Company logo', socials: [
  { id: 'social-linkedin', platform: 'LinkedIn', url: '', enabled: true },
  { id: 'social-x', platform: 'X', url: '', enabled: true },
  { id: 'social-github', platform: 'GitHub', url: '', enabled: true },
] }
export const defaultDesign: DesignSettings = { primary: '#17212b', secondary: '#66727d', accent: '#c96f4b', link: '#3578a8', font: 'Arial, Helvetica, sans-serif', nameSize: 22, density: 'comfortable', divider: true, photoShape: 'circle', socialStyle: 'text' }

const esc = (value: string) => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const safeUrl = (value: string) => /^https:\/\//i.test(value) ? value : ''
const displayUrl = (value: string) => value.replace(/^https?:\/\//i, '').replace(/\/$/, '')
const clean = (value: string) => value.trim()

export function renderSignature(data: SignatureData, template: TemplateId, design: DesignSettings) {
  const name = clean(data.displayName || data.name) || 'Your Name'
  const contact = [data.email, data.phone, data.location].filter(Boolean)
  const socials = data.socials.filter(item => item.enabled && safeUrl(item.url))
  const image = data.photoUrl && safeUrl(data.photoUrl) ? `<img src="${esc(data.photoUrl)}" alt="${esc(data.photoAlt || 'Profile photo')}" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:${design.photoShape === 'circle' ? '50%' : '6px'};" />` : ''
  const socialHtml = socials.length ? `<div style="padding-top:8px;font-size:12px;line-height:18px;">${socials.map((item, index) => `<a href="${esc(safeUrl(item.url))}" style="color:${design.link};text-decoration:none;">${design.socialStyle === 'icons' ? esc(item.platform.slice(0, 1)) : esc(item.platform)}</a>${index < socials.length - 1 ? `<span style="color:${design.secondary};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>` : ''}`).join('')}</div>` : ''
  const details = contact.length ? `<div style="padding-top:8px;color:${design.secondary};font-size:13px;line-height:20px;">${contact.map(esc).join(' <span style="color:'+design.accent+';">&nbsp;·&nbsp;</span> ')}</div>` : ''
  const website = safeUrl(data.website) ? `<a href="${esc(safeUrl(data.website))}" style="color:${design.link};text-decoration:none;">${esc(displayUrl(data.website))}</a>` : ''
  const identity = `<div style="font-family:${design.font};"><div style="font-size:${design.nameSize}px;line-height:1.2;font-weight:700;color:${design.primary};">${esc(name)}</div>${data.title ? `<div style="padding-top:4px;font-size:14px;line-height:20px;color:${design.secondary};">${esc(data.title)}${data.organization ? ` <span style="color:${design.accent};">at</span> ${esc(data.organization)}` : ''}</div>` : ''}${data.tagline ? `<div style="padding-top:8px;font-size:13px;line-height:18px;color:${design.secondary};font-style:italic;">${esc(data.tagline)}</div>` : ''}${details}${website ? `<div style="padding-top:6px;font-size:13px;">${website}</div>` : ''}${socialHtml}</div>`
  const divider = design.divider ? `<td style="width:1px;background:${design.accent};font-size:0;line-height:0;">&nbsp;</td><td style="width:18px;">&nbsp;</td>` : ''
  if (template === 'profile' && image) return `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right:18px;vertical-align:top;">${image}</td><td style="vertical-align:top;">${identity}</td></tr></table>`
  if ((template === 'corporate' || template === 'founder') && data.logoUrl && safeUrl(data.logoUrl)) return `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:top;padding-right:18px;"><img src="${esc(data.logoUrl)}" alt="${esc(data.logoAlt || 'Company logo')}" width="88" style="display:block;max-width:88px;height:auto;" /></td>${divider}<td style="vertical-align:top;">${identity}</td></tr></table>`
  return `<table cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:top;">${identity}</td></tr></table>`
}

export function plainTextSignature(data: SignatureData) {
  const lines = [data.displayName || data.name, [data.title, data.organization].filter(Boolean).join(' · '), data.email, data.phone, data.website, ...data.socials.filter(s => s.enabled).map(s => `${s.platform}: ${s.url}`)].filter(Boolean)
  return lines.join('\n')
}
