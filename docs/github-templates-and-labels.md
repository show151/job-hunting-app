# GitHub Issueテンプレート・ラベル設計

`requirements.md` 15.3(Issue管理)・15.6(リポジトリ構成)に対応する、実際に配置するテンプレートとラベルの一覧です。

---

## 1. Issueテンプレート

`.github/ISSUE_TEMPLATE/` 配下に以下のファイルを作成してください。

### 1.1 機能追加: `feature_request.md`

```markdown
---
name: 機能追加
about: 新しい機能の実装タスク
title: "[Feature] "
labels: feature
---

## 概要
(何を実装するか、簡潔に)

## 対応する要件
requirements.md の該当章番号を記載する(例: 4.1 応募先管理)

## 完了条件
- [ ]
- [ ]

## 関連ブランチ
`feature/xxx`

## 備考
```

### 1.2 不具合報告: `bug_report.md`

```markdown
---
name: 不具合報告
about: バグ・意図しない挙動の報告
title: "[Bug] "
labels: bug
---

## 発生している問題


## 再現手順
1.
2.
3.

## 期待する挙動


## 実際の挙動


## 環境
- OS:
- ブラウザ:
- 関連コミット/ブランチ:
```

### 1.3 リファクタリング: `refactor_task.md`

```markdown
---
name: リファクタリング
about: 挙動を変えないコード改善タスク
title: "[Refactor] "
labels: refactor
---

## 対象範囲
(ファイル・機能名)

## 改善したい点
(なぜ改善が必要か)

## 完了条件
- [ ] 既存の動作確認(手動テスト)が通ることを確認した
- [ ] 挙動が変わっていないことを確認した
```

### 1.4 ドキュメント: `docs_task.md`

```markdown
---
name: ドキュメント更新
about: requirements.md / implementation-plan.md / README等の更新
title: "[Docs] "
labels: docs
---

## 更新対象
(例: requirements.md 4章、README.md)

## 更新内容


## きっかけ
(なぜ更新が必要になったか。仕様変更/実装との乖離/誤記 等)
```

### 1.5 テンプレート選択画面の設定: `config.yml`

```yaml
blank_issues_enabled: true
contact_links: []
```

> `blank_issues_enabled: true`にしておくと、テンプレートに当てはまらない雑多なメモ的Issueも作成できる(個人開発ではこちらの柔軟性を優先)。

---

## 2. ラベル設計

### 2.1 種別ラベル(必須。15.3のラベル運用と対応)

| ラベル名 | 色(HEX) | 説明 |
|---|---|---|
| `feature` | `#1D76DB` | 新機能の追加 |
| `bug` | `#D73A4A` | 不具合修正 |
| `refactor` | `#FBCA04` | 挙動を変えないコード改善 |
| `docs` | `#0075CA` | ドキュメントの追加・修正 |
| `chore` | `#C5C5C5` | 環境構築・依存関係更新等 |

### 2.2 優先度ラベル(4章のMust/Should/Couldと対応)

| ラベル名 | 色(HEX) | 説明 |
|---|---|---|
| `priority: must` | `#B60205` | MVP必須(4章のMust要件) |
| `priority: should` | `#FF9F1C` | 早期に欲しい(4章のShould要件) |
| `priority: could` | `#C2E0C6` | 余裕があれば(4章のCould要件) |

### 2.3 フェーズラベル(implementation-plan.mdのPhase 0〜7と対応)

| ラベル名 | 色(HEX) | 説明 |
|---|---|---|
| `phase: 0-setup` | `#EEEEEE` | プロジェクト初期セットアップ |
| `phase: 1-auth` | `#EEEEEE` | 認証機能 |
| `phase: 2-company` | `#EEEEEE` | 応募先企業CRUD |
| `phase: 3-phase-task` | `#EEEEEE` | 選考フェーズ・タスク |
| `phase: 4-doc-note` | `#EEEEEE` | 書類・面接メモ |
| `phase: 5-dashboard` | `#EEEEEE` | ダッシュボードAPI |
| `phase: 6-frontend` | `#EEEEEE` | フロントエンド実装 |
| `phase: 7-polish` | `#EEEEEE` | 仕上げ |

> フェーズラベルは全部作らず、着手するフェーズが決まってからその都度1つずつ作る運用でもよい(先に全部作ると使わないラベルが増えるため)。

---

## 3. GitHub CLIでまとめて作成する(任意)

`gh` CLIが使える場合、以下をリポジトリ直下で実行すると一括作成できる。

```bash
# 種別
gh label create "feature" --color "1D76DB" --description "新機能の追加"
gh label create "bug" --color "D73A4A" --description "不具合修正"
gh label create "refactor" --color "FBCA04" --description "挙動を変えないコード改善"
gh label create "docs" --color "0075CA" --description "ドキュメントの追加・修正"
gh label create "chore" --color "C5C5C5" --description "環境構築・依存関係更新等"

# 優先度
gh label create "priority: must" --color "B60205" --description "MVP必須(4章のMust要件)"
gh label create "priority: should" --color "FF9F1C" --description "早期に欲しい(4章のShould要件)"
gh label create "priority: could" --color "C2E0C6" --description "余裕があれば(4章のCould要件)"

# フェーズ(最初に使う0・1だけ先に作る例)
gh label create "phase: 0-setup" --color "EEEEEE" --description "プロジェクト初期セットアップ"
gh label create "phase: 1-auth" --color "EEEEEE" --description "認証機能"
```

> デフォルトで存在する`bug`・`enhancement`等の標準ラベルと重複する場合は、事前に`gh label list`で確認し、不要な標準ラベルは`gh label delete`で削除しておくと運用が整理される。

---

## 4. 運用ルール(補足)

- 1つのIssueには、**種別ラベル1つ + 優先度ラベル1つ**を必ず付ける(フェーズラベルは任意)
- `implementation-plan.md`の各Phaseに書かれたタスクをIssue化する際は、対応するテンプレート(基本は`feature_request.md`)を使う
- ラベルはあくまで検索・フィルタ用。進捗管理はGitHub Projectsの`Todo/In Progress/Done`で行う(15.3参照)
