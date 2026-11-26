# 개발 메모

관리자용. 사용자 안내는 README.md.

## 고친 뒤 반영하기

1. `.claude-plugin/plugin.json`의 `version`을 올린다. 버전이 같으면 업데이트가 안 된다.
2. 아래 명령을 실행한다.
   ```sh
   claude plugin marketplace update monty-mods && claude plugin update progress-cat@monty-mods
   ```
3. 열려 있는 세션에서 `/reload-plugins`를 입력한다. 새로 여는 세션은 그대로 적용된다.

## 그림 고치기

`python3 tools/cat_sprites.py`로 `hooks/cat.ts`를 다시 만들고, `python3 tools/cat_sprites.py preview`로 색별 시안(`tools/preview.png`)을 본다. 바꾼 뒤에는 "고친 뒤 반영하기"를 따른다. python3만 있으면 되고, 시안 PNG 만들기는 macOS의 `sips`를 쓰므로 macOS에서만 된다.

- 크기: `tools/cat_sprites.py`의 `SCALE`(1은 레퍼런스 원본, 2는 지금 크기)
- 원본 그림: `귀여운 픽셀 고양이 스프라이트 시트.png`에서 칸마다 색을 뽑아 옮긴 것. 자는 모습은 `SCALE = 2`일 때 손으로 다시 그린 `SLEEP_2X`를 쓴다.
