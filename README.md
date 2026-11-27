# Claude Cat (progress-cat)

Claude Code 옆 패널에 작업 진행 상황을 보여주는 플러그인. 패널 맨 위의 도트 고양이(Claude Cat)가 작업 중에는 달리고, 끝나면 앉아서 쉬다가 10분 뒤 잠든다.

| 달리기 (작업 중) | 대기 (끝난 직후) | 자기 (10분 넘게 쉼) |
| :---: | :---: | :---: |
| ![달리는 고양이](docs/run.gif) | ![앉아서 귀를 쫑긋하는 고양이](docs/idle.gif) | ![자는 고양이](docs/sleep.gif) |

- 현재 세션: 작업 중인지, 지금 하는 일, 할 일 목록(TodoWrite)
- 에이전트: 이 세션이 띄운 하위 에이전트 중 작업 중인 것의 이름, 지금 하는 일, 할 일 목록(끝나면 사라짐)

## 설치

```sh
claude plugin install progress-cat --marketplace dev-montyoh/claude-cat
```

이 한 줄이면 된다. user scope로 깔리므로 모든 프로젝트에서 쓸 수 있다. Claude Code를 다시 켜면 입력창 바로 위에 고양이가 나온다. 오른쪽 패널로 보려면 `/cat-mode 세로`, 숨기려면 `/cat-mode`.

- 설치 없이 한 번만 써보기: `git clone https://github.com/dev-montyoh/claude-cat && claude --plugin-dir claude-cat`
- 지우기: `claude plugin uninstall progress-cat@monty-mods`

### 업데이트 받기

- 새 버전이 GitHub에 올라오면 세션을 시작할 때 패널 왼쪽 아래에 알림과 업데이트 명령이 뜬다. 업데이트한 뒤 `/reload-plugins`.
- 자동으로 받으려면 `/plugin`을 열고 Marketplaces 탭에서 `monty-mods`를 골라 auto-update를 켠다. 직접 추가한 마켓플레이스는 기본으로 꺼져 있다. 켜두면 세션에서 첫 메시지를 보낸 뒤 10분 안에 새 버전을 받고, `/reload-plugins`를 하라는 안내가 뜬다.

## 명령

- `/cat 회색|검정|치즈|흰색`: 고양이 색 바꾸기(다음 세션에도 유지)
- `/cat 1~5`: 고양이 마릿수 바꾸기. 첫 마리는 고른 색, 나머지는 다른 색이고, 고양이마다 다른 박자로 달리고, 쉬고, 잔다(다음 세션에도 유지)
- `/cat-mode`: 고양이 켜기/끄기. 꺼져 있으면 마지막으로 쓰던 자리로 켠다
- `/cat-mode 가로|세로|끄기`: 가로(기본)는 입력창 바로 위 띠(고양이 | 현재 세션 | 에이전트), 세로는 오른쪽 패널. 다음 세션에도 유지
