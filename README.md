# Claude Cat (progress-cat)

Claude Code 옆 패널에 작업 진행 상황을 보여주는 플러그인. 패널 맨 위의 도트 고양이(Claude Cat)가 작업 중에는 달리고, 끝나면 잠든다.

- 현재 세션: 작업 중인지, 지금 하는 일, 할 일 목록(TodoWrite)
- 에이전트: 이 세션이 띄운 하위 에이전트의 상태, 지금 하는 일, 할 일 목록

## 설치

```sh
claude plugin install progress-cat --marketplace dev-montyoh/claude-cat
```

이 한 줄이면 된다. user scope로 깔리므로 모든 프로젝트에서 쓸 수 있다. Claude Code를 다시 켜면 패널이 자동으로 열리고, 닫았으면 `/progress`로 다시 연다.

- 설치 없이 한 번만 써보기: `git clone https://github.com/dev-montyoh/claude-cat && claude --plugin-dir claude-cat`
- 지우기: `claude plugin uninstall progress-cat@monty-mods`

## 고친 뒤 반영하기

1. `.claude-plugin/plugin.json`의 `version`을 올린다. 버전이 같으면 업데이트가 안 된다.
2. 아래 명령을 실행한다.
   ```sh
   claude plugin marketplace update monty-mods && claude plugin update progress-cat@monty-mods
   ```
3. 열려 있는 세션에서 `/reload-plugins`를 입력한다. 새로 여는 세션은 그대로 적용된다.

## 명령

- `/progress`: 패널 열기
- `/cat 회색|검정|치즈|흰색`: 고양이 색 바꾸기(다음 세션에도 유지)

## 그림 고치기

`python3 tools/cat_sprites.py`로 `hooks/cat.ts`를 다시 만들고, `python3 tools/cat_sprites.py preview`로 색별 시안(`tools/preview.png`)을 본다. 바꾼 뒤에는 위의 "고친 뒤 반영하기"를 따른다. python3만 있으면 되고, 시안 PNG 만들기는 macOS의 `sips`를 쓰므로 macOS에서만 된다.

- 크기: `tools/cat_sprites.py`의 `SCALE`(1은 레퍼런스 원본, 2는 지금 크기)
- 원본 그림: `귀여운 픽셀 고양이 스프라이트 시트.png`에서 칸마다 색을 뽑아 옮긴 것. 자는 모습은 `SCALE = 2`일 때 손으로 다시 그린 `SLEEP_2X`를 쓴다.
