'use client'

import { ArrowRight, ChevronRight, Clipboard, Image as ImageIcon, LayoutTemplate, Palette, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function Brand({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick} className="brand">
      <span className="brand-mark"><span /></span>
      <span>signature<span className="brand-accent">studio</span></span>
    </button>
  )
}

export function Landing({ onStart }: { onStart: () => void }) {
  const router = useRouter()
  return (
    <div className="landing">
      <header className="landing-nav">
        <Brand onClick={() => router.push('/')} />
        <nav className="landing-links">
          <a href="#how">How it works</a>
          <a href="#why">Why Signature Studio</a>
        </nav>
        <button className="button dark compact" onClick={onStart}>
          Create signature <ArrowRight />
        </button>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="pill">
              <span /> Free to use · No account needed
            </div>
            <h1>A better email signature.<br /><span>It starts here.</span></h1>
            <p>
              Choose a design, add your details, and copy a signature that looks
              like you—ready to paste into Gmail, Outlook, or Apple Mail.
            </p>
            <button className="button dark hero-button" onClick={onStart}>
              Create your signature <ArrowRight />
            </button>
            <div className="hero-note">
              <ShieldCheck /> Your details stay private in your browser.
            </div>
          </div>
          <div className="hero-visual">
            <div className="mock-window">
              <div className="mock-bar">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
                <span className="mock-context">New message</span>
              </div>
              <div className="mock-body">
                <div className="mock-field">
                  <label>To</label>
                  <span className="mock-line w-90" />
                </div>
                <div className="mock-field">
                  <label>Subject</label>
                  <span className="mock-line w-70" />
                </div>
                <div className="mock-signature-block">
                  <div className="mock-signature">
                    <div className="mock-sig-avatar">
                      <ImageIcon className="mock-avatar-icon" />
                    </div>
                    <div className="mock-sig-text">
                      <b className="mock-sig-name">Alex Morgan</b>
                      <span className="mock-sig-role">Product Designer · Northstar</span>
                      <div className="mock-sig-contact">
                        <span>alex@northstar.co</span>
                        <span>·</span>
                        <span>+1 (555) 014-2280</span>
                        <span>·</span>
                        <span>Chicago, IL</span>
                      </div>
                      <div className="mock-sig-social">
                        <a href="#">linkedin.com/in/alexmorgan</a>
                        <span>·</span>
                        <a href="#">github.com/alexmorgan</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="how" id="how">
          <div>
            <span className="eyebrow">How it works</span>
            <h2>Three steps to a signature that works.</h2>
          </div>
          <div className="steps">
            <Step
              number="01"
              label="Choose a design"
              description="Start with a layout built for the way you work—from compact and classic to photo-led profiles."
              visual={
                <div className="step-visual-inner">
                  <LayoutTemplate className="step-icon" />
                  <span className="step-visual-label">12 templates</span>
                </div>
              }
            />
            <Step
              number="02"
              label="Add your details"
              description="Personalize your name, role, contact information, links, and photo."
              visual={
                <div className="step-visual-inner">
                  <Palette className="step-icon" />
                  <span className="step-visual-label">Your signature</span>
                </div>
              }
            />
            <Step
              number="03"
              label="Copy and use it"
              description="Copy the finished signature and paste it into your email client."
              visual={
                <div className="step-visual-inner">
                  <Clipboard className="step-icon" />
                  <span className="step-visual-label">Ready to paste</span>
                </div>
              }
            />
          </div>
        </section>


        <section className="landing-cta">
          <div className="cta-card">
            <h2>Ready to create yours?</h2>
            <button className="button dark hero-button" onClick={onStart}>
              Create your signature <ArrowRight />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

function Step({ number, label, description, visual }: { number: string; label: string; description: string; visual: React.ReactNode }) {
  return (
    <div className="step">
      <div className="step-number">{number}</div>
      <div className="step-visual">{visual}</div>
      <h3>{label}</h3>
      <p>{description}</p>
    </div>
  )
}
