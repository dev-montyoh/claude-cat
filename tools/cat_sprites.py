"""Claude Cat 도트 그림을 만들어 hooks/cat.ts로 내보낸다.

  python3 tools/cat_sprites.py            # hooks/cat.ts 다시 쓰기
  python3 tools/cat_sprites.py preview    # 색별 시안 PNG(tools/preview.png)만 만들기
  python3 tools/cat_sprites.py gif        # README 움짤(docs/run·idle·sleep.gif) 다시 만들기. Pillow 필요

글자 하나가 한 픽셀: K 테두리·감은 눈, O 등 털, W 얼굴·배·발, P 귀 안·코, . 투명.
고양이는 왼쪽을 본다. 색을 더하려면 아래 THEMES에 한 줄 더하고 다시 실행한다.
"""
import os, sys, json, math, subprocess
from collections import Counter

# 레퍼런스(귀여운 픽셀 고양이 스프라이트 시트.png)에서 칸마다 색을 뽑아 옮긴 그림
SIT = [
 [
  "....KKK...KKK.................",
  "....KOK...KOKK................",
  "....KOOK.KOPOKK...............",
  "...KOOOKKKOPOOKK..............",
  "...KOKKKKOPPPOOKK.............",
  "...KKOOOOOPPPOOOK.............",
  "..KKOOOOOOOPPOOOOK............",
  "..KOOOOOOOOOOOOOOKK...........",
  ".KKWOOOOOOOOOOOOOOK...........",
  ".KWWWOOOOOOOOOOOOOK...........",
  ".KWWWWOOOOOOOOOOOOKK..........",
  ".KWWWKKKOOOOOOOOOOOK..........",
  "KKWWWWWWOOKKKOOOOOOK..........",
  "KWWWWWWWWOOOOOOOOOOK..........",
  "KWWWWWWWWWWKKWWWWWK...........",
  "KKWWWWWWWWWWWWWWWKK...........",
  "..KKKWWWWWWWWWWOOOOKK.........",
  "....KKWWWWWWWWOOOOOOKK........",
  ".....KWWWWWWWOOOOOOOOK........",
  "....KWWWWWWWWWOOOOOOOOK.......",
  "....KWWWWWWWWWWOOOOOOOK.......",
  "...KWWWWWWWWWWWWOOOOOOOK......",
  "...KWWWWKWWWWWKWWOOOOOOK......",
  "....KWWWKWWWWKWWWOOOOOOK......",
  "....KKWWKWWWKWWWWWOOOOOK.KKKKK",
  "...KKWWKKWWWKWWWWWWOOOOKKKOOOK",
  "...KWWWKWWWWKWWWWWWOOOKKOOOOKK",
  "...KWWKKWWWKWWWWWWWWOKKOOOOKK.",
  "...KKKKKKKKKKKKKKKKKKKKKKKKK..",
 ],
 [
  ".....KKK..KKK.................",
  "....KKOKK.KOOK................",
  "....KOOOKKKOOOK...............",
  "....KOOKKKOPPOOK..............",
  "....KKKOOKOPPPOOK.............",
  "...KKOOOOOOOPPOOOK............",
  "..KOOOOOOOOOOOOOOOK...........",
  ".KKWWOOOOOOOOOOOOOKK..........",
  ".KOWWOOOOOOOOOOOOOOK..........",
  ".KWWWWOOOOOOOOOOOOOKK.........",
  ".KWWWWWOOOOOOOOOOOOOK.........",
  ".KWWWKKKKOOOOOOOOOOOK.........",
  "KKKWWWWWWWOKKOOOOOOOK.........",
  "KWWWWWWWWWOKOOOOOOOK..........",
  ".KWWWWWWWWWWKWWWWWWK..........",
  ".KKWWKWWWWWWWWWWWOKKKK........",
  "..KKKWWWWWWWWWWWOOOOOKK.......",
  "....KOWWWWWWWWWOOOOOOOK.......",
  "....KWWWWWWWWWOOOOOOOOKK......",
  "....KWWWWWWWWWOOOOOOOOOK......",
  "...KWWWWWWWWWWWOOOOOOOOKK.....",
  "...KKWWWWWWWWWWWWWWOOOOOK.....",
  "....KKWWKWWWWKKWWWOOOOOOK.KKK.",
  ".....KWWKWWWWKWWWWWWOOOOKKKOOK",
  "....KKWWKWWWKWWWWWWWOOOKKKOOOK",
  "....KWWKKWWWKWWWWWWWOOOKOOOOOK",
  "....KWWKWWWKWWWWWWWWWOKKOOOKK.",
  "....KKKKKKKKKKKKKKKKKKKKKKKK..",
 ],
 [
  ".......KKKK.................",
  ".......KOOOK................",
  "......KKOPOKK...............",
  "......KOOPPOKK..............",
  ".....KKOOPPPOKK.............",
  "....KKOOOPPPOOKK............",
  "...KOOOOOOOOOOOOK...........",
  "..KOOOOOOOOOOOOOKK..........",
  "..KOOOOOOOOOOOOOOK..........",
  ".KKWOOOOOOOOOOOOOKK.........",
  ".KWWWOOOOOOOOOOOOOK.........",
  ".KWWKKKKOOOOOOOOOOK.........",
  "KKWWWWWWOKKKOOOOOOK.........",
  "KWWWWWWWWOOOWOOOOKK.........",
  "KWWWWWWWWKKWWWWWWK..........",
  "KKWWWWWWWWWWWWWOKKKK........",
  ".KKWWWWWWWWWWWOOOOOKK.......",
  "..KKWWWWWWWWWOOOOOOOK.......",
  "...KWWWWWWWWWOOOOOOOOK......",
  "...KWWWWWWWWWWOOOOOOOK......",
  "..KWWWWWWWWWWWWOOOOOOOK.....",
  "..KWWWWWWWWWWWWOOOOOOOK.....",
  "...KWWWKWWWWKOWOOOOOOOK..KK.",
  "...KKWWKWWWWKWWWWWOOOOKKKOKK",
  "...KWWWKWWWKWWWWWWOOOOKKOOOK",
  "..KKWWKKWWOKWWWWWWOOOKKOOOOK",
  "..KWWWKWWWKWWWWWWWOOKKOOOOK.",
  "..KKKKKKKKKKKKKKKKKKKKKKKK..",
 ],
 [
  ".....KKKK.....................",
  ".....KOOKK..KKK...............",
  "....KKOOOK.KKOKK..............",
  "....KOOOOKKKOPOK..............",
  "....KOKKKKKOOPPOK.............",
  "...KKOOOOOOOOPPOOK............",
  "..KKOOOOOOOOOPPOOKK...........",
  "..KOOOOOOOOOOOOOOOKK..........",
  ".KKWOOOOOOOOOOOOOOOK..........",
  ".KOWOOOOOOOOOOOOOOOKK.........",
  ".KWWWOOOOOOOOOOOOOOOK.........",
  ".KWWKKKKOOOOOOOOOOOOK.........",
  "KKWWWWWWWOKKKOOOOOOOK.........",
  "KWWWWWWWWOOOOOOOOOOKK.........",
  "KWWWWWWWWWKKOWWWWWOK..........",
  ".KKWWWWWWWWWWWWWWOKKKK........",
  "..KKWWWWWWWWWWWWOOOOOKK.......",
  "...KKKWWWWWWWWWOOOOOOOKK......",
  ".....KWWWWWWWWWOOOOOOOOKK.....",
  ".....KWWWWWWWWWWOOOOOOOOK.....",
  "......WWWWWWWWWWWWOOOOOOKK....",
  "......KWWWWWWWWWWWWOOOOOOK....",
  "......KWWWKWWWWKKWWOOOOOOK....",
  "......KWWWKWWWOKWWWWOOOOOKKKKK",
  ".....KKWWWKWWWKWWWWWWOOOOKKOOK",
  ".....KWWWWKWWKWWWWWWWOOOKOOOOK",
  ".....KWWWKWWWKWWWWWWOOOKKOOOKK",
  ".....KKKKKKKKKKKKKKKKKKKKKKKK.",
 ],
]

RUN = [
 [
  "....KK...KK..............",
  "...KKOK.KOOKK............",
  "...KOOKKKOPOK............",
  "...KKKOKOPPOOK...........",
  "..KKOOOOOPPPOOK..........",
  "..KOOOOOOOOOOOKK....KKKKK",
  ".KKWOOOOOOOOOOOK..KKOOOOK",
  ".KWWOOOOOOOOOOOKKKKOOOOOK",
  ".KWWWOOOOOOOOOOKOOKKKKKKK",
  "KKWWKKKOOOOOOOOWOOOOK....",
  "KWWWWWWOOOOOOWWWOOOOKK...",
  "KWWWWWWWOOWWWWWWWOOOOK...",
  ".KWWWWWWWWWWWWWWWOOOOK...",
  "..KKKWWWWWWWWWKWWWOOKOK..",
  ".....KKWKWWWKWKWWWWOKOOK.",
  ".....KOKKWWWKKKKKKKKKWWK.",
  ".....KOKWWWK.........KKK.",
  ".....KKWWWK..............",
  "......KKKK...............",
 ],
 [
  "....KK...KK.............",
  "...KOK..KOOK............",
  "..KOOK.KOOPK........KKK.",
  "..KOKKKKOPPOK......KKOOK",
  ".KKOOOOOOPPOKK....KKOOKK",
  ".KOOOOOOOOPOOK....KOOKK.",
  "KOOOOOOOOOOOOOK..KKOKK..",
  "KOWOOOOOOOOOOOK..KOOK...",
  "KWWWOOOOOOOOOOKKKKOK....",
  "KWWWKKKOOOOOOOKOOOKK....",
  "KWWWWWWOKKOOOWOOOOOKK...",
  "KWWWWWWOOOOWWWOOOOOOK...",
  "KKWWWWWWWWWWOOOOOOOOK...",
  ".KKKKWWWWWWWOOOOWOOOKK..",
  "....KKKWWWWWWWOOWWOOOKK.",
  ".....KKKWWWWWWWKKWWWWOK.",
  "....KOKWWWKKKKKKKKKKWWK.",
  "....KOKWWKK.........KKK.",
  "....KKWWKK..............",
  "......KKK...............",
 ],
 [
  "...KK...KKK.............",
  "..KOOK.KOOKK............",
  "..KOOKKKOPOKK...........",
  "..KKKKKOPPPOK.......KKKK",
  ".KKOOOOOPPPOOK.....KOOOK",
  ".KOOOOOOOPOOOK....KOOOK.",
  "KOWOOOOOOOOOOKK..KOOKK..",
  "KWWOOOOOOOOOOOK..KOKK...",
  "KWWWOOOOOOOOOOKKKKOK....",
  "KWWKKKOOOOOOOOKOOOK.....",
  "KWWWWWWOKOOOOOOOOOOK....",
  "KWWWWWWOOOWWWOOOOOOKKKK.",
  "KKWWWWWWWWWWWOOOOOOWWWKK",
  ".KKKWWWWWWWWOOOOOWWWKWWK",
  "...KKKWWWWWWWOOOWWWK.KK.",
  "......KWWWWWWWWWWWK.....",
  "......KWWWKKWWKKKKK.....",
  ".....KWWWKKOKWK.........",
  ".....KWWKKKOOK..........",
  "......KKK.KKOK..........",
  "...........KK...........",
 ],
 [
  "......KKK.................",
  "..KK..KOOKK...............",
  "..KOKKKOPOOK...........KK.",
  "..KOKKOOPPOKK.........KOKK",
  "..KKOOOOPPOOKK......KKOOOK",
  ".KKOOOOOOOOOOKK....KOOOOK.",
  ".KOWOOOOOOOOOOK...KOOOKK..",
  ".KWWOOOOOOOOOOKKKKKOOK....",
  ".KWWOOOOOOOOOWOOOOOKK.....",
  "KKWWKKKOOOOWWOOOOOOOK.....",
  "KWWWWWWOOWWWWOOOOOOOOK....",
  "KKWWWWWWWWWWWOOOOWWWWOKKK.",
  "..KWWWWWWWWWWWWWWWWWWWWWK.",
  "...KKKKWWWWWWWWWKKKKKKWWWK",
  "..KKWWWWWWKKKKKK......KKWK",
  "..KWWWKKK..............KKK",
  "..KKKK....................",
 ],
 [
  "........KKK..............",
  "....KK..KOOKK............",
  "....KOKKKPPOKK...........",
  "....KOKOOPPOOKK..........",
  "....KKOOOOOOOOOK.........",
  "....KOOOOOOOOOOKK........",
  "...KOOOOOOOOOOWWK........",
  "...KWWOOOOOOOOWKKKK......",
  "...KWWKKKOOOWWOOOOOK.....",
  "...KWWWWWOWWWWOOOOOOKK...",
  "...KWWWWWWWWWWWOOOOOOK...",
  ".KKKKKWWWWWWWWWOOOOOOK...",
  "KOWWWKKKWWWWWWWWWWWOOK...",
  "KKWWWWWWWWWWWWWWWWWWWOKKK",
  "..KKKKWWWWWKKKKKKKWWWWWWK",
  "..KWWKKKKKK......KKKKKWWK",
  "..KWWK................KWW",
  "...KK..................KK",
 ],
 [
  "......KKK...............",
  "..KKK.KOOKK.............",
  "..KOKKKPOOKK............",
  "..KKKOOPPOOKK...........",
  "..KKOOOOPOOOKK..........",
  "..KOOOOOOOOOOK..........",
  ".KOOOOOOOOOOOOK....KKKKK",
  ".KWWOOOOOOOOOOKK..KOOOOK",
  ".KWKKKOOOOOOOOKOKKOOKKK.",
  "KKWWKKOOOOOOWOOOOKKKK...",
  "KWWWWWWOOWWWOOOOOOKK....",
  "KWWWWWWWWWWWOOOOOOOK....",
  ".KKKWWWWWWWOOOWWOOOKK...",
  "....KKWKWWWOOWWWWOOOK...",
  "...KKOKKWWWKWWWWOOOOK...",
  "...KWWKWWWWKWWWWOOOK....",
  "...KWKKWWWWKKKKWWWKOK...",
  "...KKKKKKOOK..KKWKKOK...",
  "........KOKK...KK.KKK...",
  ".........KK.............",
 ],
 [
  "......KKK...............",
  "..KKK.KOOKK.............",
  "..KOKKKPPOKK............",
  "..KOKKOPPOOK............",
  "..KKOOOOPPOOKK..........",
  "..KOOOOOOOOOOKK.........",
  ".KKWOOOOOOOOOOK.........",
  ".KWWOOOOOOOOOOK...KKKKKK",
  ".KWWKKOOOOOOOOKKKKOOOOOK",
  "KWWWKKOOOOOWWOOOOKOKKKKK",
  "KWWWWWWOOWWWOOOOOOKK....",
  "KWWWWWWWWWWOOOOOOOK.....",
  ".KKKWWWWWWWWOOOOOOOK....",
  "...KKKKWWWWWWWWWWOOK....",
  "......KWWWWWWOWWWWWKK...",
  ".....KOKWWWKKKWWWWKOK...",
  "......KKWWWKOKKWWKKWKK..",
  ".......KKWWWKOKKKKKWWK..",
  "........KKWWWK....KKKK..",
  ".........KKKK...........",
 ],
]

SLEEP = [
 [
  ".........KK.......................",
  ".........KOK......................",
  "....KK..KOOKK.....KKKKKKKKK.......",
  "...KKOKKKOPOOKKKKKOOOOOOOOOK......",
  ".KKKOKKKOPPOOKKOOOOOOOOOOOOOKK....",
  ".KOKKKOOOPPOOOOKOOOOOOOOOOOOOOK...",
  ".KOKOOOOOOOOOOOKKOOOOOOOOOOOOOKK..",
  ".KKOOOOOOOOOOOOOOOOOOOOOOOOOOOOK..",
  "..KOOOOOOOOOOOOOOOOOOWWWOOOOOOOK..",
  ".KOOWOOOOOOOOOOOOOOOWWWWWOOOOOOK..",
  ".KOWWWOOOOKOOOOOOWWWWWWWWWWOOOOKKK",
  ".KKWWWWKKKKWWWWWWWWWKWWWWWWWWOKKOK",
  ".KWWWWWWWWWWWKKKWWWWKWWWWWWKKKOOOK",
  "KOWWWKWWWWWWKOWWWWWWKWWWWKOOOOOOOK",
  ".KKKKKKKKKKKKWWWKKKKKKKKKKOOOOOKK.",
  ".............KKKK........KKKKKK...",
 ],
 [
  "..................KKKKKKKK..........",
  ".......KK.....KKKKOOOOOOOOKKK.......",
  "......KOOKKK.KKOOOOOOOOOOOOOKK......",
  ".....KOOPOOKKKOOOOOOOOOOOOOOOKK.....",
  "KKKK.KOOPPOOOKKOOOOOOOOOOOOOOOKK....",
  "KOOKKKOOPPPOOOKKOOOOOOOOOOOOOOOK....",
  "KKKKOOOOOPPOOOOKOOOOOOOWWWOOOOOKK...",
  ".KKOOOOOOOOOOOOOOOOOOOWWWWWOOOOOK...",
  ".KOOOOOOOOOOOOOOOOOOOOWWWWWOOOOOKKKK",
  "KKOOOOOOOOOOOOOOOOOOWWWWWWWWOOOKKOOK",
  "KOOOOOOOOOOOOOWOKWWWWWWWWOKKKKKKOOOK",
  "KKWWWOKKKKWWKKKKWWWWWWWWKKOOOOOOOOK.",
  ".KWWWWWWWKKKWWWWWWKWWWWWKOOOOOOKKK..",
  ".KKKKKKKKK.KKKKKKKKKKKKKKKKKKKKK....",
 ],
 [
  "........KKK........................",
  ".......KOOOKKK.....KKKKKKKK........",
  "..KKK..KOPPOOKK.KKKOOOOOOOKK.......",
  "..KOKKKKOPPPOOKKKOOOOOOOOOOOKK.....",
  "..KOKKOKOPPPOOOKKOOOOOOOOOOOOKK.KK.",
  "...KOOOOOOOOOOOOKOOOOOOOOOOOOOKKOK.",
  "KKKOOOOOOOOOOOOOOOOOOOOOOOOOOOKKOKK",
  "KOKOOOOOOOOOOOOOOOOOOOOOOOOOOOOKKOK",
  "KOKOOOOOOOOOOOOOOOOOOOWWWOOOOOOKKOK",
  ".KOOWOOOOOOOOOOOOOWWWWWWWWWOOOOKKOK",
  ".KOWWWWKKKKKWWWWWWWWWWWWWWWWWOOKKKK",
  ".KKWWWWKKWWWWWWKKKWWWKWWWWWWWOKKOOK",
  "KKWWWWWWWWWWWWKKWWWWKWWWWWKOOOOOOOK",
  "KWKWWWWWWWWWWWKWWWWWKWWWWKOOOOOOOKK",
  ".KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK.",
 ],
]

# ---- 내보내기 ----
# ---- 줄이기: 원본(1×)을 SCALE배 작게. 1이면 원본 그대로 ----
SCALE = 2
def pick(c):
    n = len(c); k = Counter(c)
    if k['.'] == n: return '.'
    if k['.'] and k['K']: return 'K'          # 실루엣 가장자리는 테두리로
    if k['.'] * 2 > n: return '.'
    if k['P'] * 4 >= n: return 'P'
    if k['K'] * 2 >= n: return 'K'            # 눈·다리 선
    return max('OW', key=lambda ch: k[ch])
def shrink(f, s=SCALE):
    h = len(f); w = max(len(r) for r in f); f = [r.ljust(w, '.') for r in f]
    rows = []
    for y in range(math.ceil(h / s)):
        ys = range(int(y * s), min(h, math.ceil((y + 1) * s)))
        rows.append(''.join(pick([f[a][b] for a in ys for b in range(int(x * s), min(w, math.ceil((x + 1) * s)))])
                            for x in range(math.ceil(w / s))))
    return rows
SIT_SRC = SIT
SIT, RUN, SLEEP = [[shrink(f) for f in fs] for fs in (SIT, RUN, SLEEP)]
# 앉은 원본은 달리는 원본보다 커서(29줄 vs 19줄) 더 줄여 달리는 고양이 높이에 맞춘다
SIT = [shrink(f, SCALE * 1.4) for f in SIT_SRC]
# 그만큼 줄이면 눈이 뭉개져서, 하얀 얼굴 바로 옆(4행 3열)에 눈을 다시 찍는다
SIT = [f[:4] + [f[4][:3] + 'K' + f[4][4:]] + f[5:] for f in SIT]
# 앞다리도 뭉개져서, 아래 두 줄의 하얀 칸 중 3·5열을 선으로 그어 다리를 나눈다
legs = lambda r: ''.join('K' if x in (3, 5) and c == 'W' else c for x, c in enumerate(r))
SIT = [f[:-3] + [legs(r) for r in f[-3:]] for f in SIT]
# 2×로 줄이면 자는 모습이 뭉개져서 손으로 다시 그린 그림을 쓴다(숨 쉬며 등이 오르내림). 달리는 고양이 몸 크기(13칸)에 맞춤
SLEEP_2X = [[
".K...K.......",
"KPK.KPK......",
"KOOKOOOKKKKK.",
"KOOOOOOOOOOOK",
"KWKKWKKOOOOOK",
"KWWWPWWOOWWOK",
".KKKKKKKKKKK.",
], [
".K...K.......",
"KPK.KPK.KKKK.",
"KOOKOOOOOOOOK",
"KOOOOOOOOOOOK",
"KWKKWKKOOOOOK",
"KWWWPWWOOWWOK",
".KKKKKKKKKKK.",
]]
if SCALE == 2: SLEEP = SLEEP_2X


W = max(len(r) for fs in (SIT, RUN, SLEEP) for f in fs for r in f); H = max(len(f) for fs in (SIT, RUN, SLEEP) for f in fs)
H += H % 2  # 반 블록이라 짝수
def fit(f):
    f = [r.ljust(W, '.')[:W] for r in f]
    return ['.' * W] * (H - len(f)) + f
THEMES = {
 '회색': {'K': 0x0e0814, 'O': 0x4a444c, 'P': 0xe68c82, 'W': 0xebddda},
 '검정': {'K': 0x08060a, 'O': 0x2a262c, 'P': 0xe68c82, 'W': 0xebddda},
 '치즈': {'K': 0x2a160a, 'O': 0xe6964b, 'P': 0xfa9696, 'W': 0xfff5e6},
 '흰색': {'K': 0x3c3434, 'O': 0xc8c2be, 'P': 0xfa96a5, 'W': 0xfaf8f5},
}
run_frames = [fit(f) for f in RUN]
sit_frames = [fit(f) for f in SIT]
sleep_frames = [fit(f) for f in SLEEP]

if len(sys.argv) == 1:
    ts = '/** 고양이 도트 그림. 글자 하나가 한 픽셀이고 "."은 투명. K 테두리·눈, O 등 털, W 얼굴·배·발, P 귀·코 */\n'
    ts += f'export const WIDTH = {W}\nexport const HEIGHT = {H}\n'
    ts += '/** 잠잘 때 z를 띄울 첫 칸(열·행). 다음 z는 오른쪽 위로 */\nexport const Z_AT = { column: %d, row: %d }\n' % (len(SLEEP[0][0]) - 2, (H - len(SLEEP[0])) // 2 + 1)
    ts += '/** 색 이름 → 글자별 색(0xRRGGBB) */\nexport const THEMES: Record<string, Record<string, number>> = ' + json.dumps(THEMES, ensure_ascii=False, indent=1) + '\n'
    ts += 'export const RUN: string[][] = ' + json.dumps(run_frames, indent=1) + '\n'
    ts += 'export const SIT: string[][] = ' + json.dumps(sit_frames, indent=1) + '\n'
    ts += 'export const SLEEP: string[][] = ' + json.dumps(sleep_frames, indent=1) + '\n'
    open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'hooks', 'cat.ts'), 'w').write(ts)
    print('hooks/cat.ts 갱신')
elif sys.argv[1] == 'gif':
    from PIL import Image
    S, BG, PAL = 10, (40, 42, 54), THEMES['회색']
    ZG = ["ZZZZ", "..Z.", ".Z..", "ZZZZ"]  # z 한 글자
    def gif(name, frames, ms, zs=None):
        top = min(min(y for y, r in enumerate(f) if r.strip('.')) for f in frames)
        h = (H - top) * S + 20 + (120 if zs else 0)
        imgs = []
        for n, f in enumerate(frames):
            im = Image.new('RGB', (260, h), BG); px = im.load()
            dots = [(x, y - top, PAL[c]) for y, r in enumerate(f) for x, c in enumerate(r) if c in PAL]
            # 잠잘 때 z를 오른쪽 위로 하나씩 늘린다
            for i in range(zs[n] if zs else 0):
                dots += [(len(SLEEP[0][0]) - 4 + i * 4 + x, -5 - i * 4 + y, Z_COLOR) for y, r in enumerate(ZG) for x, c in enumerate(r) if c == 'Z']
            for x, y, v in dots:
                for dy in range(S):
                    for dx in range(S):
                        X, Y = 20 + x * S + dx, h - 10 - (H - top) * S + y * S + dy
                        if 0 <= X < 260 and 0 <= Y < h: px[X, Y] = ((v >> 16) & 255, (v >> 8) & 255, v & 255)
            imgs.append(im)
        out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'docs', name + '.gif')
        imgs[0].save(out, save_all=True, append_images=imgs[1:], duration=ms, loop=0)
        print('docs/' + name + '.gif')
    Z_COLOR = 0x8caae6
    gif('run', run_frames, 120)
    gif('idle', sit_frames, [1500] + [250] * (len(sit_frames) - 1))
    gif('sleep', [sleep_frames[i % len(sleep_frames)] for i in range(4)], 840, zs=[0, 1, 2, 3])
else:
    S = 6; frames = run_frames + sit_frames + sleep_frames
    rgb = lambda v: ((v >> 16) & 255, (v >> 8) & 255, v & 255)
    img = [[(32, 32, 40)] * ((W + 2) * len(frames) * S) for _ in range((H + 2) * len(THEMES) * S)]
    for ti, pal in enumerate(THEMES.values()):
        for n, fr in enumerate(frames):
            for y, row in enumerate(fr):
                for x, ch in enumerate(row):
                    if ch not in pal: continue
                    for dy in range(S):
                        for dx in range(S): img[(ti * (H + 2) + 1 + y) * S + dy][(n * (W + 2) + 1 + x) * S + dx] = rgb(pal[ch])
    base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'preview')
    with open(base + '.ppm', 'wb') as f:
        f.write(f'P6 {len(img[0])} {len(img)} 255\n'.encode())
        for r in img: f.write(bytes(v for p in r for v in p))
    subprocess.run(['sips', '-s', 'format', 'png', base + '.ppm', '--out', base + '.png'], capture_output=True)
    os.remove(base + '.ppm'); print(base + '.png')
