# Media Pulse 📡

お気に入りメディアの更新情報を一括チェックできるWebアプリです。

## 機能

- 📺 YouTubeチャンネルの最新動画
- 📰 RSSブログに表示
- 📚 Google Books APIで本の新刊
- 🎬 MovieDBで映画の情報を取得
- 🐦 Nitter + RSSでTwitter/Xの代わり（準備中）

## 設定

### API Keyの取得

1. **YouTube Data API**
   - [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
   - YouTube Data API v3 を有効化
   - API Keyを作成

2. **MovieDB**
   - [The MovieDB](https://www.themoviedb.org/) でアカウント作成
   - Settings → API でAPI Keyを取得

### ソースの追加

設定パネルから追加できます：
- YouTube: チャンネルURLまたはチャンネルID
- RSS: RSSフィードのURL
- 本: ジャンルを選択
- 映画: ジャンルを選択

## GitHub Pagesでの公開

```bash
# リポジトリにpush
git add .
git commit -m "Initial commit"
git push origin main

# GitHub Pagesを有効化
# Settings → Pages → Source: main branch
```

## 技術

- 単一HTMLファイル（HTML/CSS/JS）
- localStorageで設定保存
- ダークモードUI

## License

MIT
