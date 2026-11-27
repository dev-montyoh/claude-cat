export type Todo = { content: string; activeForm?: string; status: 'pending' | 'in_progress' | 'completed' }
export type Agent = { id: string; label: string; isDone: boolean; doing?: string }
export type CatMode = 'run' | 'sit' | 'sleep'
export type Layout = 'pane' | 'band' | 'off'

declare module 'claude-code' {
  interface PluginState {
    'progress-cat': {
      todos: Shaped<Record<string, Todo[]>>
      main: Shaped<{ isBusy: boolean; doing: string }>
      agents: Shaped<Agent[]>
      cat: Shaped<CatMode>
      newer: Shaped<string>
      layout: Shaped<Layout>
    }
  }
}
