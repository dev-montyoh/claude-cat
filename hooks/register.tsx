import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Agent, CatMode, Layout, Todo } from '../types'
import { HEIGHT, RUN, SIT, SLEEP, THEMES, WIDTH, Z_AT } from './cat'

const PANE = 'progress-cat'
/** 누가 만든 할 일 목록인지(메인은 'main', 하위 에이전트는 agentId) → 목록 */
const todos = atom({ plugin: 'progress-cat', key: 'todos' } as const, {}, { shape: 'todos-2' })
/** 현재(메인) 세션이 작업 중인지, 지금 뭘 하는지 */
const main = atom({ plugin: 'progress-cat', key: 'main' } as const, { isBusy: false, doing: '' }, { shape: 'main-1' })
const agents = atom({ plugin: 'progress-cat', key: 'agents' } as const, [], { shape: 'agents-1' })
const cat = atom({ plugin: 'progress-cat', key: 'cat' } as const, 'sleep', { shape: 'cat-2' })
/** GitHub에 올라온 더 새 버전. 없으면 '' */
const newer = atom({ plugin: 'progress-cat', key: 'newer' } as const, '', { shape: 'newer-1' })

/** 어디에 그릴지: 'pane' 오른쪽 패널(세로), 'band' 입력창 바로 위 띠(가로). $.store에도 남겨 다음 세션에 이어진다 */
const layout = atom({ plugin: 'progress-cat', key: 'layout' } as const, 'pane', { shape: 'layout-1' })
const LAYOUTS: Record<string, Layout> = { 세로: 'pane', 가로: 'band' }
/** 띠가 그려진 자리(blit할 때 씀). 띠가 아직 안 그려졌으면 '' */
let bandId = ''

const LATEST_URL = 'https://raw.githubusercontent.com/dev-montyoh/claude-cat/main/.claude-plugin/plugin.json'
const UPDATE_COMMAND = 'claude plugin marketplace update monty-mods && claude plugin update progress-cat@monty-mods'
/** "0.10.0"이 "0.9.1"보다 새것인지처럼, 점으로 나눈 숫자를 앞에서부터 비교한다 */
const isNewer = (remote: string, local: string): boolean => {
  const a = remote.split('.').map(Number)
  const b = local.split('.').map(Number)
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if ((a[i] ?? 0) !== (b[i] ?? 0)) return (a[i] ?? 0) > (b[i] ?? 0)
  }
  return false
}
/** 설치된 버전과 GitHub 버전을 비교해, 새 버전이 있으면 기억한다(패널 왼쪽 아래에 뜸). 네트워크가 안 되면 조용히 넘어간다 */
const checkUpdate = async ($: any) => {
  const local: string = JSON.parse(await $.fs.read(`${$.plugin.root}/.claude-plugin/plugin.json`)).version
  const res = await $.http.fetch(LATEST_URL)
  if (!res.ok) return
  const remote: string = JSON.parse(res.text).version
  await update($, newer, () => (isNewer(remote, local) ? remote : ''))
}

const DEFAULT = 0x01000000
const Z_COLOR = 0x8caae6

/** 도구 호출을 한 줄 설명으로 줄인다 */
const labelOf = (e: Record<string, unknown>): string => {
  const text = String(e.description ?? e.file_path ?? e.skill ?? e.pattern ?? e.url ?? '')
  return typeof e.file_path === 'string' ? text.split('/').pop() ?? text : text
}

/** 픽셀 그림을 반 블록(▀) 칸으로 바꾼다. 한 칸에 위·아래 두 픽셀. zz는 잠잘 때 띄울 z 개수 */
const cellsOf = (PALETTE: Record<string, number>, sprite: string[], zz = 0): string => {
  const words = new Uint32Array(WIDTH * (HEIGHT / 2) * 3)
  for (let row = 0; row < HEIGHT / 2; row++) {
    for (let col = 0; col < WIDTH; col++) {
      const top = PALETTE[sprite[row * 2]?.[col] ?? '.']
      const bottom = PALETTE[sprite[row * 2 + 1]?.[col] ?? '.']
      const at = (row * WIDTH + col) * 3
      if (top !== undefined) words.set([0x2580, top, bottom ?? DEFAULT], at)
      else if (bottom !== undefined) words.set([0x2584, bottom, DEFAULT], at)
      else words.set([0x20, DEFAULT, DEFAULT], at)
    }
  }
  for (let i = 0; i < zz; i++) {
    const at = ((Z_AT.row - 1 - i) * WIDTH + Z_AT.column + 2 + i * 2) * 3
    if (at >= 0) words.set([i === 1 ? 0x5a : 0x7a, Z_COLOR, DEFAULT], at)
  }
  // 런타임에는 있지만 TS lib에 아직 없는 Uint8Array.toBase64
  return (new Uint8Array(words.buffer) as unknown as { toBase64: () => string }).toBase64()
}
type CatCells = { run: string[]; sit: string[]; sleep: string[] }
/** 색 이름 → 그 색으로 칠한 프레임들(달리기·앉기·자기) */
const CELLS: Record<string, CatCells> = Object.fromEntries(
  Object.entries(THEMES).map(([name, palette]) => [name, {
    run: RUN.map(sprite => cellsOf(palette, sprite)),
    sit: SIT.map(sprite => cellsOf(palette, sprite)),
    // 숨 쉬는 그림을 돌리면서 z를 0~3개 띄운다
    sleep: [0, 1, 2, 3].map(zz => cellsOf(palette, SLEEP[zz % SLEEP.length] ?? [], zz)),
  }]),
)
const COLORS = Object.keys(THEMES)
const DEFAULT_COLOR = '회색'
/** 저장된 고양이 색. 모르는 값이면 기본 색 */
const colorOf = (value: unknown): string => (typeof value === 'string' && value in CELLS ? value : DEFAULT_COLOR)
let color = DEFAULT_COLOR

let mainBusy = false
let sitSince = 0
/** 쉬기 시작하고 이만큼 지나면 잠든다 */
const SLEEP_AFTER_MS = 10 * 60 * 1000

/** 메인 턴이나 하위 에이전트가 하나라도 돌고 있으면 달리고, 아니면 앉았다가 10분 뒤 잔다 */
const settle = async ($: any) => {
  const list = await read($, agents)
  const isBusy = mainBusy || list.some(agent => !agent.isDone)
  const mode = await read($, cat)
  if (isBusy && mode !== 'run') await update($, cat, (): CatMode => 'run')
  // ponytail: 앉기는 임시로 뺌(그림 영역 높이를 줄이려고). 되살리려면 'sleep'을 'sit'으로, cat_sprites.py 높이 계산에 SIT 다시 넣기
  if (!isBusy && mode !== 'sleep') {
    sitSince = Date.now()
    await update($, cat, (): CatMode => 'sleep')
  }
  if (!isBusy && mode === 'sit' && Date.now() - sitSince > SLEEP_AFTER_MS) await update($, cat, (): CatMode => 'sleep')
}

/** 에이전트 하나의 상태를 바꾼다. 목록에 없으면 더한다 */
const markAgent = async ($: any, id: string, isDone: boolean, label?: string) => {
  await update($, agents, list => {
    const known = list.some(agent => agent.id === id)
    const next = known
      ? list.map(agent => (agent.id === id ? { ...agent, isDone, label: label ?? agent.label } : agent))
      : [...list, { id, label: label ?? id.slice(0, 8), isDone }]
    return next.slice(-10)
  })
  await settle($)
}

/** 패널(세로)과 띠(가로)가 같이 쓰는 그림. 띠에서는 고양이 | 현재 세션 | 에이전트 순으로 가로로 늘어선다 */
async function draw($: any, e: any, isBand: boolean) {
  const elements = $.ui.resolve(e)
  const { Box, Text } = elements
  const Raster = 'Raster' in elements ? elements.Raster : undefined
  const todoMap = await read($, todos)
  const me = await read($, main)
  const latest = await read($, newer)
  const agentList = await read($, agents)
  const mode = await read($, cat)
  const body: number = e.props?.bodyColumns ?? e.viewport?.columns ?? 40
  // 띠에서는 고양이 옆 두 칸(현재 세션, 에이전트)이 너비를 나눠 쓴다
  const cols = Math.max(16, isBand ? Math.floor((body - WIDTH - 6) / 2) : body - 2)
  const cut = (s: string) => (s.length > cols ? s.slice(0, cols - 1) + '…' : s)
  const look = CELLS[colorOf(await $.store.get('catColor'))]
  const cells = mode === 'run' ? look?.run[0] : mode === 'sit' ? look?.sit[0] : look?.sleep[3]
  const running = agentList.filter(agent => !agent.isDone).length
  /** 그 세션·에이전트가 만든 할 일 목록(없으면 아무것도 안 그림) */
  const todoView = (id: string) => {
    const list = todoMap[id] ?? []
    if (list.length === 0) return null
    return (
      <Box flexDirection="column">
        <Text dimColor>{`  할 일 ${list.filter(t => t.status === 'completed').length}/${list.length}`}</Text>
        {list.map(t => (
          <Text dimColor={t.status === 'completed'} bold={t.status === 'in_progress'}>
            {cut(`  ${t.status === 'completed' ? '✔' : t.status === 'in_progress' ? '▶' : '○'} ${t.status === 'in_progress' ? t.activeForm ?? t.content : t.content}`)}
          </Text>
        ))}
      </Box>
    )
  }
  const caption =
    mode === 'run' ? (running > 0 ? `달리는 중… (에이전트 ${running}개 작업 중)` : '달리는 중…') :
    mode === 'sit' ? '잠깐 쉬는 중' : '쿨쿨 자는 중'
  const catView = (
    <Box flexDirection="column" alignItems="center">
      {Raster ? <Raster key="cat" columns={WIDTH} rows={HEIGHT / 2} cells={cells ?? ''} /> : null}
      {!isBand && <Text dimColor>{`[Claude Cat: ${caption}]`}</Text>}
    </Box>
  )
  const sessionView = (
    <Box flexDirection="column">
      <Text bold>현재 세션</Text>
      <Text dimColor={!me.isBusy}>{me.isBusy ? '▶ 작업 중' : '✔ 쉬는 중'}</Text>
      {me.isBusy && me.doing && <Text color="cyan">{cut(`  └ ${me.doing}`)}</Text>}
      {todoView('main')}
    </Box>
  )
  const agentView = agentList.length > 0 && (
    <Box flexDirection="column">
      <Text bold>에이전트</Text>
      {agentList.slice(-5).map(agent => (
        <Box flexDirection="column">
          <Text dimColor={agent.isDone}>{cut(`${agent.isDone ? '✔' : '▶'} ${agent.label}`)}</Text>
          {!agent.isDone && agent.doing && <Text color="cyan">{cut(`  └ ${agent.doing}`)}</Text>}
          {!agent.isDone && todoView(agent.id)}
        </Box>
      ))}
    </Box>
  )
  const notice = latest !== '' && (
    <Box flexDirection="column">
      <Text color="yellow">{cut(`새 버전 ${latest}이 나왔어요`)}</Text>
      <Text dimColor wrap="wrap">{UPDATE_COMMAND}</Text>
    </Box>
  )
  if (isBand) {
    // 배경색을 따로 칠하지 않아 터미널 배경이 그대로 보인다
    return (
      <Box flexDirection="column">
        <Box flexDirection="row">
          {catView}
          <Box flexDirection="column" marginLeft={2} width={cols}>{sessionView}</Box>
          {agentView && <Box flexDirection="column" marginLeft={2} width={cols}>{agentView}</Box>}
        </Box>
        {notice}
      </Box>
    )
  }
  return (
    // 패널 높이(bodyRows)만큼 늘려서 새 버전 알림이 패널 왼쪽 맨 아래에 붙게 한다
    <Box flexDirection="column" minHeight={e.props?.scroll?.bodyRows}>
      <Box flexDirection="column" flexGrow={1}>
        {catView}
        <Text> </Text>
        {sessionView}
        {agentView && <Text> </Text>}
        {agentView}
      </Box>
      {notice}
    </Box>
  )
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'progress', description: '작업 진행 패널을 연다' })
    color = colorOf(await $.store.get('catColor'))
    await $.command.register({ name: 'cat', description: `고양이 색을 바꾼다 (${COLORS.join('·')})` })
    let tick = 0
    $.clock.every(120, async () => {
      tick++
      const mode = await read($, cat)
      const requestId = (await read($, layout)) === 'band' ? bandId : PANE
      const blit = (cells: string | undefined) => { if (requestId) void $.ui.blit({ requestId, key: 'cat', cells: cells ?? '' }).catch(() => {}) }
      if (mode === 'run') blit(CELLS[color]?.run[tick % RUN.length])
      // 앉아 있을 땐 가끔 귀를 쫑긋한다(4장 재생 후 첫 장으로 쉼)
      if (mode === 'sit' && tick % 4 === 0) blit(CELLS[color]?.sit[(tick / 4) % 12] ?? CELLS[color]?.sit[0])
      if (mode === 'sleep' && tick % 7 === 0) blit(CELLS[color]?.sleep[(tick / 7) % 4])
      if (tick % 25 === 0) await settle($)
    })
    await $.command.register({ name: 'cat-mode', description: '고양이 자리를 바꾼다 (세로: 오른쪽 패널 · 가로: 입력창 위)' })
    const saved = await $.store.get('layout')
    const where: Layout = saved === 'band' ? 'band' : 'pane'
    await update($, layout, () => where)
    if (where === 'pane') void $.ui.open({ id: PANE, title: '작업 진행' })
    void checkUpdate($).catch(() => {})
    return next(e)
  })

  on('command.run', { command: 'progress' }, async $ => {
    await $.ui.open({ id: PANE, title: '작업 진행' })
    return { text: '작업 진행 패널을 열었어요.' }
  })

  on('command.run', { command: 'cat-mode' }, async ($, e) => {
    const where = LAYOUTS[e.args.trim()]
    if (!where) return { text: `/cat-mode 세로 (오른쪽 패널) 또는 /cat-mode 가로 (입력창 위)` }
    await update($, layout, () => where)
    await $.store.set('layout', where)
    if (where === 'band') await $.ui.close({ id: PANE }).catch(() => {})
    else await $.ui.open({ id: PANE, title: '작업 진행' })
    return { text: where === 'band' ? '고양이를 입력창 위로 옮겼어요.' : '고양이를 오른쪽 패널로 옮겼어요.' }
  })

  on('command.run', { command: 'cat' }, async ($, e) => {
    const wanted = e.args.trim()
    if (!wanted) return { text: `지금 색: ${color}. 바꾸려면 /cat ${COLORS.join(' | ')}` }
    if (!(wanted in CELLS)) return { text: `없는 색이에요. 고를 수 있는 색: ${COLORS.join(', ')}` }
    color = wanted
    await $.store.set('catColor', wanted)
    return { text: `고양이 색을 바꿨어요: ${wanted}` }
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined) { mainBusy = true; await update($, main, () => ({ isBusy: true, doing: '' })); await settle($) }
    else await markAgent($, e.agentId, false)
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) { mainBusy = false; await update($, main, now => ({ ...now, isBusy: false })); await settle($) }
    else await markAgent($, e.agentId, true)
    return next(e)
  })

  on('agent.spawn', async ($, e, next) => {
    const spawned = await next(e)
    if (spawned.agentId) await markAgent($, spawned.agentId, false, `${e.description} (${e.subagentType})`)
    return spawned
  })

  on('tool.call', async ($, e, next) => {
    // 할 일 목록(todos 배열을 넘기는 도구, 보통 TodoWrite)을 쓴 쪽별로 그대로 보여준다
    const list = (e as { todos?: unknown }).todos
    if (Array.isArray(list)) await update($, todos, map => ({ ...map, [e.agentId ?? 'main']: list as Todo[] }))
    // 지금 뭘 하는지(터미널 아래 에이전트 줄과 같은 내용)
    const doing = labelOf(e as Record<string, unknown>) || e.tool
    if (e.agentId) await update($, agents, list => list.map(agent => (agent.id === e.agentId ? { ...agent, doing } : agent)))
    else await update($, main, now => ({ ...now, doing }))
    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, ($, e) => draw($, e, false))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, layout)) !== 'band') return next(e)
    bandId = e.requestId
    return draw($, e, true)
  })
}
