declare module 'vue3-markdown' {
  import { DefineComponent } from 'vue'

  interface VueMarkdownProps {
    source?: string
    plugins?: any[]
    html?: boolean
    xhtmlOut?: boolean
    breaks?: boolean
    linkify?: boolean
    typographer?: boolean
    highlight?: (str: string, lang: string) => string
  }

  export const VMarkdownView: DefineComponent<VueMarkdownProps>
  export const VMarkdownEditor: DefineComponent<VueMarkdownProps>
}
