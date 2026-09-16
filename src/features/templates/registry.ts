import type { ShieldTemplate } from './types'
import { MansionTemplate } from './mansion/MansionTemplate'
import { ScrollTemplate } from './scroll-cinematic/ScrollTemplate'
import { TimelineTemplate } from './timeline/TimelineTemplate'
import { WorldTemplate } from './world-3d/WorldTemplate'
import { StoryTemplate } from './story-2d/StoryTemplate'
import { BlankTemplate } from './blank/BlankTemplate'

export const TEMPLATES: ShieldTemplate[] = [
  {
    id: 'mansion',
    name: 'The Mansion',
    tagline: 'A themed room for every subject. Walk your parents through it.',
    previewCss: 'linear-gradient(160deg, #1c2a44 0%, #101a2b 55%, #0a1120 56%, #05080f 100%)',
    icon: '⌂',
    Component: MansionTemplate
  },
  {
    id: 'scroll',
    name: 'Cinematic Scroll',
    tagline: 'One epic page. Your year unfolds as they scroll.',
    previewCss:
      'linear-gradient(180deg, #0b0f1a 0%, #123a52 30%, #14402a 60%, #471f38 90%)',
    icon: '↓',
    Component: ScrollTemplate
  },
  {
    id: 'timeline',
    name: 'Timeline',
    tagline: 'Your year, moment by moment. Press play.',
    previewCss:
      'linear-gradient(90deg, #0b0f1a 0%, #0e7490 35%, #0b0f1a 70%), linear-gradient(180deg, #0b0f1a, #05080f)',
    icon: '→',
    Component: TimelineTemplate
  },
  {
    id: 'world',
    name: '3D World',
    tagline: 'Floating islands you can fly around. One per subject.',
    previewCss: 'radial-gradient(420px 220px at 50% 70%, #123a52, #070b14)',
    icon: '◉',
    Component: WorldTemplate
  },
  {
    id: 'story',
    name: 'Storybook',
    tagline: 'Your year as chapters. Turn the pages.',
    previewCss: 'linear-gradient(120deg, #332052 0%, #1d1230 50%, #140b22 100%)',
    icon: '¶',
    Component: StoryTemplate
  },
  {
    id: 'blank',
    name: 'Blank Canvas',
    tagline: 'No structure. You invent it.',
    previewCss: 'linear-gradient(135deg, #101623 0%, #0b0f1a 100%)',
    icon: '□',
    Component: BlankTemplate
  }
]

export const templateById = (id: string | null): ShieldTemplate | null =>
  TEMPLATES.find((t) => t.id === id) ?? null
