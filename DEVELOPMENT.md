# 개발 메모

관리자용. 사용자 안내는 README.md.

## 브랜치와 배포

브랜치 규칙은 CONTRIBUTING.md와 같다. 사용자는 `main`(기본 브랜치)을 받으므로 기본 브랜치는 꼭 `main`으로 둔다. `develop`은 쓰지 않는다.

```
main ─┬─ feature/*  ─┐
      └─ hotfix/*   ─┤ PR
                     ▼
               release/0.1.N   ← 이번에 낼 버전
                     │ PR (merge commit)
                     ▼
                    main  → 태그 v0.1.N, GitHub Release
```

작업:
1. 다음에 낼 버전의 `release/0.1.N` 브랜치가 없으면 `main`에서 만든다. 만들 때 `.claude-plugin/plugin.json`의 `version`을 그 번호로 올린 커밋을 같이 올린다.
2. `main`에서 `feature/*`(급한 수정이면 `hotfix/*`)를 따서 고치고 `release/0.1.N`으로 PR, 합친다.

배포:
1. `release/0.1.N` → `main` PR(제목 `release v0.1.N`)을 merge commit으로 합친다.
2. `main`의 그 커밋에 `v0.1.N` 태그를 달고 GitHub Release를 만든다.
3. 이 컴퓨터 반영: `claude plugin marketplace update monty-mods && claude plugin update progress-cat@monty-mods`, 열린 세션에서 `/reload-plugins`(설치본이 바뀌면 재시작이 필요할 수 있다).

버전:
- 마지막 자리만 올린다(0.1.x). 이미 쓴 번호는 절대 다시 쓰지 않는다. 같은 번호면 Claude Code가 예전에 받아 둔 폴더를 그대로 써서 옛 코드가 돈다.
- 0.2.0~0.5.1은 예전에 썼던 번호라 건너뛴다.
- 문서만 바뀐 배포는 버전을 올리지 않아도 된다.

급한 수정(`hotfix/*`)도 `feature/*`와 똑같이 `main`에서 따서 `release/0.1.N`으로 PR한다. 급하면 그 수정만 담은 새 `release/0.1.N`을 만들어 바로 배포한다.

GitHub 보호: `main`과 `release/*`는 PR로만 합칠 수 있고 강제 push가 막혀 있다(관리자도 마찬가지).

## 그림 고치기

`python3 tools/cat_sprites.py`로 `hooks/cat.ts`를 다시 만들고, `python3 tools/cat_sprites.py preview`로 색별 시안(`tools/preview.png`)을 본다. 그림을 바꿨으면 `python3 tools/cat_sprites.py gif`로 README 움짤(`docs/*.gif`, Pillow 필요)도 다시 만든다. 바꾼 뒤에는 "고친 뒤 반영하기"를 따른다. python3만 있으면 되고, 시안 PNG 만들기는 macOS의 `sips`를 쓰므로 macOS에서만 된다.

- 크기: `tools/cat_sprites.py`의 `SCALE`(1은 레퍼런스 원본, 2는 지금 크기)
- 원본 그림: `귀여운 픽셀 고양이 스프라이트 시트.png`에서 칸마다 색을 뽑아 옮긴 것. 자는 모습은 `SCALE = 2`일 때 손으로 다시 그린 `SLEEP_2X`를 쓴다.
