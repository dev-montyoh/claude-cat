# 기여 안내

Claude Cat에 관심 가져 주셔서 고마워요. 이 레포에 직접 push하는 건 관리자(@dev-montyoh)만 할 수 있어요. 대신 누구나 이슈를 올리거나 PR을 보낼 수 있어요.

## 버그 제보, 아이디어

[Issues](https://github.com/dev-montyoh/claude-cat/issues)에 올려 주세요. 아래 내용을 같이 적어 주면 빨리 볼 수 있어요.

- Claude Code 버전(`claude --version`), 플러그인 버전(`claude plugin list`)
- 화면 스크린샷

## 코드나 그림 보내기 (PR)

1. 레포를 fork하고, `main`에서 `feature/짧은-이름` 브랜치를 따서 작업해요.
2. 아래 확인을 통과시켜요.
   ```sh
   claude plugin validate .   # 플러그인 형식 검사
   claude plugin test .       # tests/ 의 테스트
   ```
3. 열려 있는 **`release/0.1.N`** 브랜치로 PR을 보내요(다음에 나갈 버전이에요). 열린 release 브랜치가 없으면 `main`으로 보내 주세요. 관리자가 옮겨서 합쳐요.

### 브랜치

| 브랜치 | 역할 |
|---|---|
| `main` | 배포본. 사용자가 설치하면 받는 곳이라 항상 동작하는 상태로 둬요 |
| `release/0.1.N` | 다음에 낼 버전을 모으는 곳. 다 모이면 `main`으로 합쳐 배포해요 |
| `feature/*` | 기능·수정 하나. `main`에서 따서 `release/0.1.N`으로 |
| `hotfix/*` | 배포본의 급한 수정. `feature/*`와 똑같이 `main`에서 따서 `release/0.1.N`으로 |

`main`과 `release/*`에는 관리자도 직접 push하지 않고 PR로만 합쳐요.

### 그림을 고칠 때

- 그림은 `tools/cat_sprites.py`에 글자로 적혀 있어요. 글자 하나가 픽셀 하나예요. `K` 테두리·눈, `O` 등 털, `W` 얼굴·배·발, `P` 귀 안·코, `.` 투명이고, 고양이는 왼쪽을 봐요.
- `hooks/cat.ts`는 스크립트가 만드는 결과물이라 직접 고치지 말고, `python3 tools/cat_sprites.py`로 다시 만들어요.
- `python3 tools/cat_sprites.py preview`로 시안 PNG를, `python3 tools/cat_sprites.py gif`로 README 움짤을 다시 만들 수 있어요(gif는 Pillow 필요). PR에 시안 이미지를 붙여 주면 좋아요.

### 버전

`.claude-plugin/plugin.json`의 `version`은 관리자가 `release/0.1.N` 브랜치를 만들 때 올려요. PR에서는 건드리지 않아도 돼요.

더 자세한 관리 메모는 [DEVELOPMENT.md](DEVELOPMENT.md)에 있어요.
