/** 고양이 도트 그림. 글자 하나가 한 픽셀이고 "."은 투명. K 테두리·눈, O 등 털, W 얼굴·배·발, P 귀·코 */
export const WIDTH = 13
export const HEIGHT = 12
/** 잠잘 때 z를 띄울 첫 칸(열·행). 다음 z는 오른쪽 위로 */
export const Z_AT = { column: 11, row: 3 }
/** 색 이름 → 글자별 색(0xRRGGBB) */
export const THEMES: Record<string, Record<string, number>> = {
 "회색": {
  "K": 919572,
  "O": 4867148,
  "P": 15109250,
  "W": 15457754
 },
 "검정": {
  "K": 525834,
  "O": 2762284,
  "P": 15109250,
  "W": 15457754
 },
 "치즈": {
  "K": 2758154,
  "O": 15111755,
  "P": 16422550,
  "W": 16774630
 },
 "흰색": {
  "K": 3945524,
  "O": 13157054,
  "P": 16422565,
  "W": 16447733
 }
}
export const RUN: string[][] = [
 [
  ".............",
  ".............",
  ".KKKKKK......",
  ".KKKPPK......",
  ".KOOPPOK..KKK",
  "KWOOOOOKKKOOK",
  "KWKOOOOOOKKKK",
  "KWWWOOWWOOK..",
  "KKWWWWWWWOKK.",
  "..KKKWKKKKKK.",
  "..KKWK....KK.",
  "...KK........"
 ],
 [
  ".............",
  ".............",
  ".KK.KK.......",
  ".KKKPPK..KKK.",
  "KOOOPPK..KOK.",
  "KOOOOOOKKOK..",
  "KWKOOOOKKK...",
  "KWWOKOWOOOK..",
  "KKWWWWOOOOK..",
  "..KKWWWOWOOK.",
  "..KKWKKKKKKK.",
  "..KKK........"
 ],
 [
  ".............",
  ".KKKKK.......",
  ".KKKPPK...KK.",
  "KOOOPPK..KOK.",
  "KOOOOOOKKOK..",
  "KWKOOOOKKK...",
  "KWWOOOOOOKKK.",
  "KKWWWWOOOWWK.",
  ".KKWWWWOWKKK.",
  "..KWWKWKKK...",
  "..KKKKK......",
  ".....KK......"
 ],
 [
  ".............",
  ".............",
  ".............",
  ".K.KKK.......",
  ".KKOPKK....KK",
  "KKOOPOKK.KKOK",
  "KWOOOOOKKKOK.",
  "KWKOOOOOOOK..",
  "KWWWWWOOOOOKK",
  ".KKWWWWWKKKWK",
  ".KWKKKKK...KK",
  ".KK.........."
 ],
 [
  ".............",
  ".............",
  ".............",
  "..K.KKK......",
  "..KKPPKK.....",
  "..KOOOOKK....",
  ".KOOOOOWKK...",
  ".KWKOOWOOOK..",
  "KKKWWWWOOOK..",
  "KWWKWWWWWWOKK",
  ".KKKKKKKKKKWK",
  ".KK........KK"
 ],
 [
  ".............",
  ".............",
  ".KKKKK.......",
  ".KKPPKK......",
  ".KOOPOK......",
  "KOOOOOOK.KKK.",
  "KWKOOOOOKKKK.",
  "KWWWWWOOOK...",
  "KKKWWOOWOOK..",
  ".KWKWKWWOOK..",
  ".KKKWKKKWKK..",
  "....KK.KKKK.."
 ],
 [
  ".............",
  ".............",
  ".KKKKK.......",
  ".KKPPK.......",
  ".KOOPOKK.....",
  "KWOOOOOK.KKK.",
  "KWKOOOOKKOKK.",
  "KWWWWWOOOK...",
  "KKKWWWOOOK...",
  "..KKWWKWWKK..",
  "...KWWKKKKK..",
  "....KKK..KK.."
 ]
]
export const SIT: string[][] = [
 [
  ".............",
  ".KKKKK.......",
  ".KKKPKK......",
  "KKOOPOK......",
  "KWOOOOKK.....",
  "KWWKOOOK.....",
  "KWWWWWKK.....",
  "KKWWWOOKK....",
  ".KWWWOOOK....",
  ".KWKWKOOKKK..",
  ".KWKWKWOKOK..",
  ".KKKKKKKKK..."
 ],
 [
  ".............",
  ".............",
  ".KKKKK.......",
  ".KOOPKK......",
  "KKOOOOKK.....",
  "KWOOOOOK.....",
  "KWWKOOOK.....",
  "KWWWWWOKK....",
  "KKWWWOOOK....",
  ".KWKWKOOKKK..",
  ".KKKWKWOKKK..",
  ".KKKKKWOKOK.."
 ],
 [
  ".............",
  ".............",
  "..KKK........",
  ".KKPKK.......",
  "KKOOOKK......",
  "KOOOOOK......",
  "KWWKOOK......",
  "KWWWWOKK.....",
  "KKWWWOOK.....",
  "KKWKWOOKKK...",
  "KKWKWKOOKK...",
  "KKKKWKOKOK..."
 ],
 [
  ".............",
  ".............",
  ".KKKKK.......",
  ".KOKPKK......",
  "KKOOOOKK.....",
  "KWOOOOOK.....",
  "KWWKOOOK.....",
  "KWWWWWOKK....",
  "KKWWWOOOK....",
  ".KKKWKOOKK...",
  ".KKKWKWOOKK..",
  ".KKKKKWOKOK.."
 ]
]
export const SLEEP: string[][] = [
 [
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".K...K.......",
  "KPK.KPK......",
  "KOOKOOOKKKKK.",
  "KOOOOOOOOOOOK",
  "KWKKWKKOOOOOK",
  "KWWWPWWOOWWOK",
  ".KKKKKKKKKKK."
 ],
 [
  ".............",
  ".............",
  ".............",
  ".............",
  ".............",
  ".K...K.......",
  "KPK.KPK.KKKK.",
  "KOOKOOOOOOOOK",
  "KOOOOOOOOOOOK",
  "KWKKWKKOOOOOK",
  "KWWWPWWOOWWOK",
  ".KKKKKKKKKKK."
 ]
]
