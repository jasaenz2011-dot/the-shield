import type { ComponentType } from 'react'
import type { ShieldDocument } from '../../types/shield'

// Every template is a plugin over the same template-agnostic content model
// (shield.artifacts). Layout hints private to a template live under
// shield.templateData[template.id] and survive template switches.

export interface TemplateProps {
  shield: ShieldDocument
  presentMode: boolean
  // Persist a patch of this template's private data blob.
  onDataChange: (data: unknown) => void
}

export interface ShieldTemplate {
  id: string
  name: string
  tagline: string
  // CSS background for the chooser card preview.
  previewCss: string
  icon: string
  Component: ComponentType<TemplateProps>
}
