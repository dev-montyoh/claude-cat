import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Agent, CatMode, Layout, Todo } from '../types'
import { HEIGHT, RUN, SIT, SLEEP, THEMES, WIDTH, Z_AT } from './cat'

type CatCells = { run: string[]; sit: string[]; sleep: string[] }

const PANE = 'progress-cat'
/** 누가 만든 할 일 목록인지(메인은 'main', 하위 에이전트는 agentId) → 목록 */
const todos = atom({ plugin: 'progress-cat', key: 'todos' } as const, {}, { shape: 'todos-2' })
/** 현재(메인) 세션이 작업 중인지, 지금 뭘 하는지 */
const main = atom({ plugin: 'progress-cat', key: 'main' } as const, { isBusy: false, doing: '' }, { shape: 'main-1' })
const agents = atom({ plugin: 'progress-cat', key: 'agents' } as const, [], { shape: 'agents-1' })
const cat = atom({ plugin: 'progress-cat', key: 'cat' } as const, 'sleep', { shape: 'cat-2' })
/** 고양이 몇 마리를 띄울지(1~MAX_CATS). $.store에도 남겨 다음 세션에 이어진다 */
const count = atom({ plugin: 'progress-cat', key: 'count' } as const, 1, { shape: 'count-1' })
const MAX_CATS = 5
/** 저장된 마릿수. 모르는 값이면 1 */
const countOf = (value: unknown): number => (typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= MAX_CATS ? value : 1)
/**
 * i번째 고양이가 tick일 때 보여줄 그림. 고양이마다 시작 시점과 주기를 달리해서 같은 동작을 같은 박자로 하지 않는다.
 * 달리기는 다리 동작을 어긋나게, 앉기는 귀 쫑긋하는 주기(12·17·22…칸)를 다르게, 자기는 숨 쉬는 박자를 엇갈리게
 */
const frameOf = (look: CatCells | undefined, mode: CatMode, tick: number, i: number): string | undefined => {
  if (!look) return undefined
  if (mode === 'run') return look.run[(tick + i * 3) % look.run.length]
  if (mode === 'sit') return look.sit[(Math.floor(tick / 4) + i * 7) % (12 + i * 5)] ?? look.sit[0]
  return look.sleep[(Math.floor(tick / 7) + i * 2) % look.sleep.length]
}
/** GitHub에 올라온 더 새 버전. 없으면 '' */
const newer = atom({ plugin: 'progress-cat', key: 'newer' } as const, '', { shape: 'newer-1' })

/** 어디에 그릴지: 'band' 입력창 바로 위 띠(가로, 기본), 'pane' 오른쪽 패널(세로), 'off' 숨김. $.store에도 남겨 다음 세션에 이어진다 */
const layout = atom({ plugin: 'progress-cat', key: 'layout' } as const, 'band', { shape: 'layout-1' })
const LAYOUTS: Record<string, Layout> = { 세로: 'pane', 가로: 'band', 끄기: 'off' }
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
  if (!isBusy && mode === 'run') {
    sitSince = Date.now()
    await update($, cat, (): CatMode => 'sit')
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
  const cats = await read($, count)
  const cols = Math.max(16, isBand ? Math.floor((body - cats * (WIDTH + 1) - 8) / 2) : body - 2)
  const cut = (s: string) => (s.length > cols ? s.slice(0, cols - 1) + '…' : s)
  const look = CELLS[colorOf(await $.store.get('catColor'))]
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
      {Raster ? (
        <Box flexDirection="row" flexWrap="wrap" gap={1}>
          {Array.from({ length: cats }, (_, i) => <Raster key={`cat${i}`} columns={WIDTH} rows={HEIGHT / 2} cells={frameOf(look, mode, 0, i) ?? ''} />)}
        </Box>
      ) : null}
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
  // 끝난 에이전트는 숨긴다
  const live = agentList.filter(agent => !agent.isDone)
  const agentView = live.length > 0 && (
    <Box flexDirection="column">
      <Text bold>에이전트</Text>
      {live.slice(-5).map(agent => (
        <Box flexDirection="column">
          <Text>{cut(`▶ ${agent.label}`)}</Text>
          {agent.doing && <Text color="cyan">{cut(`  └ ${agent.doing}`)}</Text>}
          {todoView(agent.id)}
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
          <Box marginLeft={2}>{catView}</Box>
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
    color = colorOf(await $.store.get('catColor'))
    const savedCount = await $.store.get('catCount')
    await $.command.register({ name: 'cat', description: `고양이 색 바꾸기(${COLORS.join('·')}) · 숫자를 주면 마릿수(1~${MAX_CATS})` })
    await update($, count, () => countOf(savedCount))
    let tick = 0
    $.clock.every(120, async () => {
      tick++
      const mode = await read($, cat)
      const where = await read($, layout)
      const requestId = where === 'band' ? bandId : where === 'pane' ? PANE : ''
      // 달리기는 매번, 앉기는 4번에 한 번, 자기는 7번에 한 번 그림을 바꾼다
      if (requestId && (mode === 'run' || (mode === 'sit' && tick % 4 === 0) || (mode === 'sleep' && tick % 7 === 0))) {
        const cats = await read($, count)
        for (let i = 0; i < cats; i++) {
          void $.ui.blit({ requestId, key: `cat${i}`, cells: frameOf(CELLS[color], mode, tick, i) ?? '' }).catch(() => {})
        }
      }
      if (tick % 25 === 0) await settle($)
    })
    await $.command.register({ name: 'cat-mode', description: '고양이 켜고 끄기·자리 바꾸기 (그냥 입력하면 켜기/끄기 · 가로: 입력창 위 · 세로: 오른쪽 패널 · 끄기)' })
    const saved = await $.store.get('layout')
    const where: Layout = saved === 'pane' || saved === 'off' ? saved : 'band'  // 기본은 가로
    await update($, layout, () => where)
    if (where === 'pane') void $.ui.open({ id: PANE, title: '작업 진행', backgroundColor: 'transparent' })
    void checkUpdate($).catch(() => {})
    return next(e)
  })

  on('command.run', { command: 'cat-mode' }, async ($, e) => {
    const arg = e.args.trim()
    const now = await read($, layout)
    // 아무것도 안 주면 켜기/끄기: 켜져 있으면 끄고, 꺼져 있으면 마지막으로 쓰던 자리로 켠다
    const last = await $.store.get('lastLayout')
    const where: Layout | undefined = arg === '' ? (now === 'off' ? (last === 'pane' ? 'pane' : 'band') : 'off') : LAYOUTS[arg]
    if (!where) return { text: '/cat-mode (켜기/끄기) · /cat-mode 가로 (입력창 위) · /cat-mode 세로 (오른쪽 패널) · /cat-mode 끄기' }
    await update($, layout, () => where)
    await $.store.set('layout', where)
    if (where !== 'off') await $.store.set('lastLayout', where)
    if (where === 'pane') await $.ui.open({ id: PANE, title: '작업 진행', backgroundColor: 'transparent' })
    else await $.ui.close({ id: PANE }).catch(() => {})
    return { text: where === 'off' ? '고양이를 숨겼어요. /cat-mode 로 다시 켜요.' : where === 'band' ? '고양이를 입력창 위에 띄웠어요.' : '고양이를 오른쪽 패널에 띄웠어요.' }
  })

  on('command.run', { command: 'cat' }, async ($, e) => {
    const wanted = e.args.trim()
    if (!wanted) return { text: `지금 색: ${color}, ${await read($, count)}마리. 색은 /cat ${COLORS.join(' | ')}, 마릿수는 /cat 1~${MAX_CATS}` }
    if (/^\d+$/.test(wanted)) {
      const n = Number(wanted)
      if (n < 1 || n > MAX_CATS) return { text: `마릿수는 1~${MAX_CATS}마리까지 돼요.` }
      await update($, count, () => n)
      await $.store.set('catCount', n)
      return { text: `고양이를 ${n}마리로 바꿨어요.` }
    }
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
