import type { Options } from 'rehype-autolink-headings'

export const autoLinkHeadingsOptions: Options = {
  behavior: 'append',
  properties: {
    className: ['anchor']
  },
  content: {
    type: 'text',
    value: '#'
  }
}
