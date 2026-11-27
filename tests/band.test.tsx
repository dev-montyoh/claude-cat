import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'progress-cat',
  component: 'AbovePrompt',
  requestId: 'band',
  props: { hasSurvey: false, isCollapsed: false, isWorking: false, maxRows: 20, bodyColumns: 100, scroll: { offset: 0, bodyRows: 20 }, view: {} },
} as const

test('기본(가로)에서는 입력창 위 띠에 고양이와 현재 세션이 나온다', async ($, on) => {
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('store.get', () => ({ value: undefined }))
  on('fs.read', () => ({ value: '{"version":"0.1.2"}' }))
  on('http.fetch', () => ({ value: { status: 200, ok: true, headers: {}, text: '{"version":"0.1.2"}' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /현재 세션/ }))?.text).toBe('현재 세션')
  await ui.unmount()
})

test('꺼 두면(/cat-mode 끄기) 띠를 그리지 않는다', async ($, on) => {
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('store.get', (_, e) => ({ value: e.key === 'layout' ? 'off' : undefined }))
  on('fs.read', () => ({ value: '{"version":"0.1.2"}' }))
  on('http.fetch', () => ({ value: { status: 200, ok: true, headers: {}, text: '{"version":"0.1.2"}' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  // 플러그인이 넘기면 엔진이 그리는 자리
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Text', text: /현재 세션/ })).toBeUndefined()
  await ui.unmount()
})

test('/cat 3 으로 저장해 두면 고양이 3마리를 그린다', async ($, on) => {
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('store.get', (_, e) => ({ value: e.key === 'catCount' ? 3 : undefined }))
  on('fs.read', () => ({ value: '{"version":"0.1.2"}' }))
  on('http.fetch', () => ({ value: { status: 200, ok: true, headers: {}, text: '{"version":"0.1.2"}' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect(await ui.find({ type: 'Raster', key: 'cat2' })).toBeDefined()
  expect(await ui.find({ type: 'Raster', key: 'cat3' })).toBeUndefined()
  await ui.unmount()
})

test('예전에 세로(pane)로 저장해 둔 사람도 입력창 위 띠로 보인다', async ($, on) => {
  on('command.register', (_, e) => ({ value: { command: e.name } }))
  on('store.get', (_, e) => ({ value: e.key === 'layout' ? 'pane' : undefined }))
  on('fs.read', () => ({ value: '{"version":"0.1.2"}' }))
  on('http.fetch', () => ({ value: { status: 200, ok: true, headers: {}, text: '{"version":"0.1.2"}' } }))
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'terminal', isInteractive: true })
  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /현재 세션/ }))?.text).toBe('현재 세션')
  await ui.unmount()
})
