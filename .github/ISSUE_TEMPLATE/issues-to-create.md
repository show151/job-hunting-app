# 作成するIssue一覧

`implementation-plan.md`の各Phaseを、1PRで完結する粒度のIssueに分解したもの。ラベルは`github-templates-and-labels.md`で定義した種別・優先度・フェーズラベルを使用する。

| # | タイトル | 種別 | 優先度 | フェーズ |
|---|---|---|---|---|
| 1 | プロジェクト初期セットアップ | chore | must | phase: 0-setup |
| 2 | ユーザー登録・ログインAPIの実装 | feature | must | phase: 1-auth |
| 3 | Company CRUD APIの実装 | feature | must | phase: 2-company |
| 4 | SelectionPhase APIの実装 | feature | must | phase: 3-phase-task |
| 5 | Task APIの実装 | feature | must | phase: 3-phase-task |
| 6 | Document APIの実装 | feature | should | phase: 4-doc-note |
| 7 | InterviewNote APIの実装 | feature | should | phase: 4-doc-note |
| 8 | ダッシュボード集約APIの実装 | feature | must | phase: 5-dashboard |
| 9 | APIクライアント・認証状態管理の実装 | feature | must | phase: 6-frontend |
| 10 | ログイン/新規登録画面の実装 | feature | must | phase: 6-frontend |
| 11 | ダッシュボード画面の実装 | feature | must | phase: 6-frontend |
| 12 | 応募先一覧・カンバン画面の実装 | feature | must | phase: 6-frontend |
| 13 | 応募先詳細画面の実装 | feature | must | phase: 6-frontend |
| 14 | 仕上げ(動作確認・README・面接想定問答) | chore | should | phase: 7-polish |

- Must系のPhase(0, 1, 2, 3, 5, 6)を先に着手し、Should系(4, 7)は余裕を見て進める(4章の優先度に対応)
- 各Issueの詳細な作業手順は`implementation-plan.md`の対応するPhaseセクション、またはPhase 0/1については`phase0-setup-guide.md` / `phase1-auth-guide.md`を参照する

実際の作成は `create-issues.sh` を実行する(GitHub CLI `gh` が必要)。
