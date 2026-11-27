# Claude Cat 작업 규칙 (에이전트용)

이 레포는 `main` + `release/*` + `feature/*`·`hotfix/*` 브랜치를 쓴다(`develop` 없음). 자세한 건 DEVELOPMENT.md의 "브랜치와 배포".

- `main`, `release/*`에 직접 commit·push하지 않는다(GitHub에서 막혀 있다). 항상 `main`에서 `feature/*`(급한 수정은 `hotfix/*`)를 따서 작업하고, 다음 버전의 `release/0.1.N`으로 PR을 연다.
- `main`으로는 `release/0.1.N` → `main` 배포 PR만 간다. 배포(그 PR 합치기·태그·Release)는 사람이 시킬 때만 한다.
- `release/0.1.N`이 없으면 `main`에서 만들고, 만들 때 `.claude-plugin/plugin.json` 버전을 그 번호로 올린다.
- 버전(`.claude-plugin/plugin.json`)은 마지막 자리만 올리고, 이미 쓴 번호는 다시 쓰지 않는다. 0.2.0~0.5.1은 건너뛴다.
- PR 전에 `claude plugin validate .`와 `claude plugin test .`를 통과시킨다.
- 그림은 `tools/cat_sprites.py`만 고치고 `python3 tools/cat_sprites.py`로 `hooks/cat.ts`를 다시 만든다. `hooks/cat.ts`를 직접 고치지 않는다.
- 커밋 작성자 이메일은 이 레포의 로컬 git 설정(개인 메일)을 쓴다. 전역 설정을 바꾸지 않는다.
