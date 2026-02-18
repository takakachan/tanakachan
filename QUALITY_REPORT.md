# Media Pulse 品質チェックレポート

作成日: 2026-02-18

---

## 概要

Media Pulseプロジェクトのコード品質チェックを実施。35の問題を発見した。

---

## JavaScript Issues (app.js) - 20件

### セキュリティ関連

1. **XSS: ユーザー入力がエスケープされずにonclickハンドラに挿入されている** — `app.js:652-674, 724, 776`
2. **CSRF: feed追加/削除操作にトークン検証がない** — `app.js:93-137`

### データ処理関連

3. **非同期RSS取得にタイムアウト/リトライがない** — `app.js:161-213`
4. **nopeタイムスタンプ管理のRace Condition** — `app.js:938-984, 1004-1016`
5. **24時間のクリーンアップ間隔がハードコードード** — `app.js:63`
6. **RSSアイテムID衝突の可能性 (feed.id + index方式)** — `app.js:174-175`
7. **fetchのHTTPステータスがJSONパース前にチェックされていない** — `app.js:166`

### エラー処理関連

8. **重要なパスでDOMクエリのnullチェックがない** — `app.js:140-158, 333-341, 810-827`
9. **localStorageのQuotaExceededErrorが処理されていない** — `app.js:52-58, 84-90, 409-413`
10. **querySelectorAllの結果在使用前にnullチェックがない** — `app.js:458**
11. **querySelector結果が存在確認なしで使われている** — `app.js:979**

### メモリリーク関連

12. **swipeハンドラが再初期化でクリーンアップなしに毎回追加される** — `app.js:1124-1195`
13. **setupTinderSwipe()内のmousemove/mouseupリスナーが毎回追加され、削除されない** — `app.js:1135**

### ロジック関連

14. **fetchAllRss()のRace Condition: 全部のアイテムが処理される前にstateがレンダリングされる** — `app.js:201`
15. **undoLast()がアイテムがまだそのindexにあることを検証せずにlast.indexを使用** — `app.js:1010`
16. **無限定義: loose equality (==) の代わりに === を使用すべき** — `app.js:68**
17. **変数シャドウリング: cardが関数スコープで宣言された後、ifブロック内で再宣言** — `app.js:871`
18. ** 無限ループのリスク: state変更がデバウンス/ロックなしで再レンダーをトリガー** — `app.js:534-567, 938-984`

### その他

19. **インラインCSSの書式エラー (fontrem;">×-size:1)** — `app.js:155`
20. **RSS feed URLがエスケープされずにonclick属性に直接挿入** — `app.js:724`

---

## CSS Issues (style.css) - 10件

1. **.filter-barのpadding-bottom: 0が不必要** — line 252
2. **.cardのmargin-bottom: 0がサイズバリアントと競合** — line 354
3. **.search-iconの垂直配置が52%而不是50%** — lines 169-170, 1240
4. **.mobile-navで過度の !important 使用** — lines 1332-1348 (9個)
5. **-webkit-transitionが重複して不使用** — lines 1344-1345, 1381-1382
6. **ハードコードドのrgba色がデザイントークンシステムをバイパス** — lines 802, 1010, 1142, 1415, 1429
7. **.card-checkbox::afterがcolor: whiteを設定しているが効果なし** — line 491
8. **.masonryがcolumn-countとcolumn-widthを同時に設定** — lines 346-348
9. **padding-bottom: 0 on .filter-bar冗長** — line 252
10. **mobile-nav-btnの過剰なマージン設定** — 最近の修正で追加

---

## HTML Issues (index.html) - 5件

1. **重複した `<nav>` ランドマーク** — Lines 15, 33: aria-labelなしで区別不能
2. **tinder画像の空のalt属性** — Line 88: 意味のある画像のaltが空
3. **インラインonclickイベントハンドラ** — Lines 14-199: HTMLベストプラクティス違反
4. **labelがinputと関連付けられていない** — Lines 151-153: for属性がない
5. **Modalにroleとaria-modalがない** — Line 143: アクセシビリティ問題

---

## 優先度高

1. XSS脆弱性 (app.js:652-674, 724, 776)
2. CSRF対策 (app.js:93-137)
3. メモリリーク (app.js:1124-1195)
4. localStorageエラー処理 (app.js:52-58, 84-90)
5. アクセシビリティ (index.html: 5件)

---

## 優先度中

6. Race Condition (app.js:938-984, 201)
7. nullチェック欠如 (app.js:多处)
8. !important過度使用 (style.css: 1332-1348)

---

## 優先度低

9. コードスタイル (loose equality, 変数名)
10. CSS最適化 (Vendor prefix, hardcoded colors)
