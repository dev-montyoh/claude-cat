# Claude Cat 작업 규칙 (에이전트용)

이 레포는 Git Flow를 간단하게 쓴다. 자세한 건 DEVELOPMENT.md의 "브랜치와 배포".

- `main`, `develop`에 직접 commit·push하지 않는다(GitHub에서 막혀 있다). 항상 `develop`에서 `feature/*`를 따서 작업하고 `develop`으로 PR을 연다.
- `main`으로는 `develop` → `main` 배포 PR이나 `hotfix/*` PR만 간다. 배포는 사람이 시킬 때만 한다.
- 버전(`.claude-plugin/plugin.json`)은 마지막 자리만 올리고, 이미 쓴 번호는 다시 쓰지 않는다. 0.2.0~0.5.1은 건너뛴다.
- PR 전에 `claude plugin validate .`와 `claude plugin test .`를 통과시킨다.
- 그림은 `tools/cat_sprites.py`만 고치고 `python3 tools/cat_sprites.py`로 `hooks/cat.ts`를 다시 만든다. `hooks/cat.ts`를 직접 고치지 않는다.
- 커밋 작성자 이메일은 이 레포의 로컬 git 설정(개인 메일)을 쓴다. 전역 설정을 바꾸지 않는다.
