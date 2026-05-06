export type Locale = 'ja' | 'en';

type Dict = {
  app: {
    name: string;
    untitled: string;
  };
  nav: {
    home: string;
    tags: string;
    trash: string;
  };
  home: {
    tapToRecord: string;
    voiceHint: string;
    frequentTags: string;
    memos: string;
    last: string;
    today: string;
    yesterday: string;
    daysAgo: (n: number) => string;
    weeksAgo: (n: number) => string;
    monthsAgo: (n: number) => string;
  };
  recording: {
    rec: string;
    secondsLeft: string;
    speakStart: string;
    titleTrigger: (cmd: string) => string;
    saveTrigger: (cmd: string) => string;
    backHint: string;
    titleSet: (title: string) => string;
    titleLabel: string;
    permissionFailed: string;
  };
  save: {
    title: string;
    titleField: string;
    tagField: string;
    transcript: string;
    transcriptEmpty: string;
    transcriptHint: string;
    destination: string;
    local: string;
    saveBtn: string;
    retake: string;
    back: string;
    newTag: string;
    tagName: string;
    tagReading: string;
  };
  tagList: {
    title: string;
    countSuffix: string;
    similarFound: string;
    mergeBtn: string;
    empty: string;
  };
  tagDetail: {
    backToTagList: string;
    chars: string;
    pdf: string;
    addRecord: string;
    edit: string;
    delete: string;
    confirmDelete: string;
    empty: string;
  };
  edit: {
    undo: string;
    redo: string;
    speak: string;
    speakStop: string;
    done: string;
    titlePh: string;
    bodyPh: string;
    tagField: string;
    save: string;
    addRecord: string;
    delete: string;
  };
  trash: {
    title: string;
    autoDeleteSuffix: (days: number) => string;
    deleted: string;
    daysLeft: (n: number) => string;
    restore: string;
    purgeAll: string;
    confirmPurge: string;
    empty: string;
  };
  menu: {
    voiceCommands: string;
    recordingTime: string;
    cloud: string;
    language: string;
    notify: string;
    tagManage: string;
    pdf: string;
    theme: (current: string) => string;
    guide: string;
    version: string;
  };
  settings: {
    title: string;
    backToMenu: string;
    secRecording: string;
    secNotify: string;
    secDisplay: string;
    secData: string;
    recTime: string;
    transcriptLang: string;
    soundOnDone: string;
    vibrate: string;
    theme: string;
    trashDays: string;
    pdfFont: string;
    on: string;
    off: string;
    dark: string;
    light: string;
    secs: (n: number) => string;
    days: (n: number) => string;
  };
  voiceCommands: {
    title: string;
    hint: string;
    rowStart: string;
    rowTitle: string;
    rowTag: string;
    rowSave: string;
    rowCancel: string;
    rowRead: string;
    change: string;
    done: string;
    resetDefaults: string;
    testRec: string;
  };
  cloud: {
    title: string;
    autoSync: string;
    notConfigured: string;
    setupGuideTitle: string;
    setupSteps: string[];
    googleDrive: string;
    iCloud: string;
    dropbox: string;
    notConnected: string;
    notConnectedStub: string;
    notSet: string;
    connect: string;
    connecting: string;
    syncing: string;
    connected: string;
    confirmDisconnect: (name: string) => string;
    lastSync: string;
    syncedLabel: string;
    syncedMemos: (n: number) => string;
    format: string;
    syncNow: string;
  };
  pdf: {
    title: string;
    preview: string;
    formatLabel: string;
    formatStyled: string;
    formatStyledSub: string;
    formatPlain: string;
    formatPlainSub: string;
    outputLabel: string;
    outputSearchable: string;
    outputSearchableSub: string;
    outputImage: string;
    outputImageSub: string;
    generate: string;
    generating: string;
    openPrint: string;
    empty: string;
    statsTpl: (n: number, chars: number, date: string) => string;
  };
  search: {
    title: string;
    placeholder: string;
    typeHint: string;
    hits: (n: number) => string;
    initialHelp: string;
    noResults: string;
  };
  tagManage: {
    title: string;
    backToMenu: string;
    addTag: string;
    deleteConfirm: (name: string) => string;
    moveBefore: string;
    moveAfter: string;
  };
  guide: {
    title: string;
    close: string;
    sections: { title: string; items: string[] }[];
    version: string;
  };
  toast: {
    saved: string;
    cancelled: string;
    autoSaving: string;
  };
};

export const STRINGS: Record<Locale, Dict> = {
  ja: {
    app: { name: 'VoiceMemo', untitled: '無題のメモ' },
    nav: { home: 'ホーム', tags: 'タグ', trash: 'ゴミ箱' },
    home: {
      tapToRecord: 'TAP TO RECORD',
      voiceHint: '「録音開始」と言っても始まります',
      frequentTags: 'よく使うタグ',
      memos: 'MEMOS',
      last: '最終',
      today: '今日',
      yesterday: '昨日',
      daysAgo: (n) => `${n}日前`,
      weeksAgo: (n) => `${n}週前`,
      monthsAgo: (n) => `${n}ヶ月前`,
    },
    recording: {
      rec: 'REC',
      secondsLeft: 'SECONDS LEFT',
      speakStart: '話し始めてください...',
      titleTrigger: (cmd) => `「${cmd}、〇〇。」でタイトル確定`,
      saveTrigger: (cmd) => `タップ or「${cmd}」と言うと保存`,
      backHint: '停止ボタンで戻ります',
      titleSet: (t) => `🎙 タイトル確定: ${t}`,
      titleLabel: 'タイトル：',
      permissionFailed: 'マイクへのアクセスに失敗しました',
    },
    save: {
      title: 'メモを保存',
      titleField: 'タイトル（音声から自動生成）',
      tagField: 'タグ（変更・移動できます）',
      transcript: '文字起こし（タップで編集）',
      transcriptEmpty: '（本文なし）',
      transcriptHint: '文字起こし内容を直接編集できます',
      destination: '保存先',
      local: '📱 ローカル ✓',
      saveBtn: '保存する',
      retake: 'もう一度録音',
      back: '← 戻る',
      newTag: '+ 新しいタグ',
      tagName: 'タグ名',
      tagReading: '読み（ひらがな・任意。類似タグ統合用）',
    },
    tagList: {
      title: 'タグ一覧',
      countSuffix: 'タグ',
      similarFound: '⚠ 似ているタグを検出',
      mergeBtn: '統合する →',
      empty: 'タグがまだありません',
    },
    tagDetail: {
      backToTagList: '← タグ一覧',
      chars: '文字',
      pdf: 'PDF出力',
      addRecord: '+ 追加録音',
      edit: '編集',
      delete: '削除',
      confirmDelete: 'このメモをゴミ箱へ移動しますか？',
      empty: 'このタグのメモはまだありません',
    },
    edit: {
      undo: '元に戻す',
      redo: 'やり直し',
      speak: '🔊 読む',
      speakStop: '⏸ 停止',
      done: '完了',
      titlePh: 'タイトル',
      bodyPh: '本文',
      tagField: 'タグ（変更・移動）',
      save: '保存',
      addRecord: '+ 録音を追加',
      delete: '削除',
    },
    trash: {
      title: 'ゴミ箱',
      autoDeleteSuffix: (n) => `${n}日で自動削除`,
      deleted: '削除',
      daysLeft: (n) => `残り${n}日`,
      restore: '復元',
      purgeAll: '⚠ すべて完全削除 — 取り消せません',
      confirmPurge: 'すべて完全削除します。取り消せません。続行しますか？',
      empty: 'ゴミ箱は空です',
    },
    menu: {
      voiceCommands: '音声コマンド設定',
      recordingTime: '録音時間設定',
      cloud: '保存先・クラウド同期',
      language: '文字起こし言語',
      notify: '通知・フィードバック',
      tagManage: 'タグ管理',
      pdf: 'PDF設定',
      theme: (cur) => `テーマ（${cur}）`,
      guide: '使い方ガイド',
      version: 'バージョン 1.0.0',
    },
    settings: {
      title: '設定',
      backToMenu: '← メニュー',
      secRecording: '録音',
      secNotify: '通知',
      secDisplay: '表示',
      secData: 'データ',
      recTime: '録音時間',
      transcriptLang: '文字起こし言語',
      soundOnDone: '録音完了の音',
      vibrate: 'バイブレーション',
      theme: 'テーマ',
      trashDays: 'ゴミ箱 自動削除',
      pdfFont: 'PDFフォント',
      on: 'ON',
      off: 'OFF',
      dark: 'ダーク',
      light: 'ライト',
      secs: (n) => `${n}秒`,
      days: (n) => `${n}日後`,
    },
    voiceCommands: {
      title: '音声コマンド設定',
      hint: 'タップして自分の言葉に変更できます',
      rowStart: '録音開始',
      rowTitle: 'タイトル確定',
      rowTag: 'タグ指定',
      rowSave: '保存',
      rowCancel: 'キャンセル',
      rowRead: '読み上げ',
      change: '変更',
      done: '完了',
      resetDefaults: 'デフォルトに戻す',
      testRec: '🎙 テスト録音で確認する',
    },
    cloud: {
      title: '保存先 · 同期',
      autoSync: '✓ 録音保存のたびに即時同期',
      notConfigured:
        '⚠ Google Drive 連携には VITE_GOOGLE_CLIENT_ID が必要です。.env.local に貼り付けて再起動してください。',
      setupGuideTitle: '📖 Google Drive セットアップ手順',
      setupSteps: [
        'console.cloud.google.com で新規プロジェクト作成',
        '「Google Drive API」を有効化',
        '「OAuth 2.0 クライアント ID」を作成（Web アプリケーション）',
        '承認済み JS 生成元に http://localhost:5179 を追加',
        'クライアント ID を .env.local の VITE_GOOGLE_CLIENT_ID に貼り付け',
        'dev サーバーを再起動',
      ],
      googleDrive: 'Google ドライブ',
      iCloud: 'iCloud',
      dropbox: 'Dropbox',
      notConnected: '未接続',
      notConnectedStub: '未接続（スタブ）',
      notSet: '未設定',
      connect: '接続する',
      connecting: '認証中…',
      syncing: '同期中…',
      connected: '接続済',
      confirmDisconnect: (n) => `${n} の接続を解除しますか？`,
      lastSync: '最終同期',
      syncedLabel: '同期済みメモ',
      syncedMemos: (n) => `${n} 件`,
      format: '保存形式',
      syncNow: '今すぐ同期',
    },
    pdf: {
      title: 'PDF出力',
      preview: 'PREVIEW',
      formatLabel: '出力形式',
      formatStyled: '整形PDFで出力',
      formatStyledSub: 'タグ名・日付・テキスト整形',
      formatPlain: 'シンプルテキスト',
      formatPlainSub: '最小限の装飾',
      outputLabel: '出力種別',
      outputSearchable: '検索可能PDF（推奨）',
      outputSearchableSub: '印刷ダイアログ → PDFとして保存',
      outputImage: '画像PDF',
      outputImageSub: 'ファイル直接ダウンロード（検索不可）',
      generate: 'PDFを生成 → 保存',
      generating: '生成中…',
      openPrint: '印刷ダイアログを開く',
      empty: 'メモがありません',
      statsTpl: (n, chars, date) => `${n} memos · ${chars} chars · ${date}`,
    },
    search: {
      title: '検索',
      placeholder: 'メモ・タグ・本文を検索',
      typeHint: 'キーワードを入力',
      hits: (n) => `${n} 件ヒット`,
      initialHelp: 'タイトル・本文・タグ名・読みから検索できます',
      noResults: '一致するメモはありません',
    },
    tagManage: {
      title: 'タグ管理',
      backToMenu: '← メニュー',
      addTag: '+ タグを追加',
      deleteConfirm: (name) =>
        `「${name}」を削除しますか？このタグのメモは未分類になります。`,
      moveBefore: '↑',
      moveAfter: '↓',
    },
    guide: {
      title: '📖 使い方ガイド',
      close: '閉じる',
      sections: [
        {
          title: '🎙 録音する',
          items: [
            'ホームの赤いボタンをタップ',
            'または音声コマンドで開始',
            '最大録音時間は設定で変更可（デフォルト30秒）',
          ],
        },
        {
          title: '🗣 音声コマンド',
          items: [
            '「タイトルは、〇〇。」でタイトル確定',
            '「保存」で保存',
            '「キャンセル」でキャンセル',
            'コマンド文言はメニュー → 音声コマンド設定で変更可',
          ],
        },
        {
          title: '🏷 タグ',
          items: [
            '保存時にタグを選ぶ／新規作成',
            '読み（ひらがな）を入れると類似タグ統合に役立つ',
            'タグ一覧で似たタグを自動検出 → ワンタップ統合',
          ],
        },
        {
          title: '📄 PDF出力',
          items: [
            'タグ詳細 → 「PDF出力」',
            '検索可能PDF: 印刷ダイアログ → PDFとして保存',
            '画像PDF: ファイル直接ダウンロード',
          ],
        },
        {
          title: '☁️ クラウド同期',
          items: [
            'メニュー → 保存先・クラウド同期',
            'Google Drive 接続後、変更が自動同期（2秒デバウンス）',
            '事前に VITE_GOOGLE_CLIENT_ID の設定が必要',
          ],
        },
        {
          title: '🔊 読み上げ',
          items: [
            'メモ詳細／編集画面の 🔊 ボタンで読み上げ',
            '読み上げ中にもう一度タップで停止',
          ],
        },
        {
          title: '🌙 テーマ',
          items: ['メニューまたは設定からダーク／ライト切替'],
        },
        {
          title: '🗑 ゴミ箱',
          items: [
            '削除メモは 30 日後に自動削除（日数は設定で変更可）',
            '期間内ならいつでも復元可能',
          ],
        },
        {
          title: '⚡ Siri ハンズフリー起動',
          items: [
            '「Hey Siri、ボイスメモ」だけで録音開始まで自動化できます',
            'iOS の「ショートカット」アプリで「+」→「URLを開く」アクションを追加',
            'URL に <APP_URL>?autoRecord=true を貼り付け',
            'ショートカット名を「ボイスメモ」に設定 →「Siriに追加」',
            '初回のみアプリを開いてマイク権限を許可',
            '次回からは「Hey Siri、ボイスメモ」→ 録音 → 「保存」発声で完結',
          ],
        },
      ],
      version: 'VoiceMemo v1.0.0',
    },
    toast: {
      saved: '✓ メモを保存しました',
      cancelled: 'キャンセルしました',
      autoSaving: '保存中…',
    },
  },
  en: {
    app: { name: 'VoiceMemo', untitled: 'Untitled' },
    nav: { home: 'Home', tags: 'Tags', trash: 'Trash' },
    home: {
      tapToRecord: 'TAP TO RECORD',
      voiceHint: 'Or say the start command',
      frequentTags: 'FREQUENT TAGS',
      memos: 'MEMOS',
      last: 'last',
      today: 'today',
      yesterday: 'yesterday',
      daysAgo: (n) => `${n}d ago`,
      weeksAgo: (n) => `${n}w ago`,
      monthsAgo: (n) => `${n}mo ago`,
    },
    recording: {
      rec: 'REC',
      secondsLeft: 'SECONDS LEFT',
      speakStart: 'Start speaking…',
      titleTrigger: (cmd) => `Say "${cmd} <text>." to set title`,
      saveTrigger: (cmd) => `Tap or say "${cmd}" to save`,
      backHint: 'Tap stop to go back',
      titleSet: (t) => `🎙 Title set: ${t}`,
      titleLabel: 'Title:',
      permissionFailed: 'Microphone access failed',
    },
    save: {
      title: 'Save memo',
      titleField: 'Title (auto-generated from voice)',
      tagField: 'Tag (tap to change)',
      transcript: 'Transcript (tap to edit)',
      transcriptEmpty: '(empty)',
      transcriptHint: 'You can edit the transcript directly',
      destination: 'Destination',
      local: '📱 Local ✓',
      saveBtn: 'Save',
      retake: 'Record again',
      back: '← Back',
      newTag: '+ New tag',
      tagName: 'Tag name',
      tagReading: 'Reading (optional, helps merge similar tags)',
    },
    tagList: {
      title: 'Tags',
      countSuffix: 'tags',
      similarFound: '⚠ Similar tags detected',
      mergeBtn: 'Merge →',
      empty: 'No tags yet',
    },
    tagDetail: {
      backToTagList: '← Tags',
      chars: 'chars',
      pdf: 'PDF',
      addRecord: '+ Record',
      edit: 'Edit',
      delete: 'Delete',
      confirmDelete: 'Move this memo to trash?',
      empty: 'No memos in this tag yet',
    },
    edit: {
      undo: 'Undo',
      redo: 'Redo',
      speak: '🔊 Speak',
      speakStop: '⏸ Stop',
      done: 'Done',
      titlePh: 'Title',
      bodyPh: 'Body',
      tagField: 'Tag (move)',
      save: 'Save',
      addRecord: '+ Add recording',
      delete: 'Delete',
    },
    trash: {
      title: 'Trash',
      autoDeleteSuffix: (n) => `auto-delete in ${n}d`,
      deleted: 'Deleted',
      daysLeft: (n) => `${n}d left`,
      restore: 'Restore',
      purgeAll: '⚠ Empty trash — cannot undo',
      confirmPurge: 'Permanently delete all? This cannot be undone.',
      empty: 'Trash is empty',
    },
    menu: {
      voiceCommands: 'Voice commands',
      recordingTime: 'Recording time',
      cloud: 'Cloud sync',
      language: 'Transcript language',
      notify: 'Notifications',
      tagManage: 'Manage tags',
      pdf: 'PDF settings',
      theme: (cur) => `Theme (${cur})`,
      guide: 'How to use',
      version: 'Version 1.0.0',
    },
    settings: {
      title: 'Settings',
      backToMenu: '← Menu',
      secRecording: 'Recording',
      secNotify: 'Notifications',
      secDisplay: 'Display',
      secData: 'Data',
      recTime: 'Recording time',
      transcriptLang: 'Transcript language',
      soundOnDone: 'Sound on finish',
      vibrate: 'Vibration',
      theme: 'Theme',
      trashDays: 'Trash auto-delete',
      pdfFont: 'PDF font',
      on: 'ON',
      off: 'OFF',
      dark: 'Dark',
      light: 'Light',
      secs: (n) => `${n}s`,
      days: (n) => `${n}d`,
    },
    voiceCommands: {
      title: 'Voice commands',
      hint: 'Tap a row to customize the wording',
      rowStart: 'Start recording',
      rowTitle: 'Set title',
      rowTag: 'Set tag',
      rowSave: 'Save',
      rowCancel: 'Cancel',
      rowRead: 'Read aloud',
      change: 'Edit',
      done: 'Done',
      resetDefaults: 'Reset to defaults',
      testRec: '🎙 Test in recording',
    },
    cloud: {
      title: 'Storage · Sync',
      autoSync: '✓ Syncs immediately on save',
      notConfigured:
        '⚠ Google Drive needs VITE_GOOGLE_CLIENT_ID. Set it in .env.local and restart.',
      setupGuideTitle: '📖 Google Drive setup',
      setupSteps: [
        'Create a project at console.cloud.google.com',
        'Enable the Google Drive API',
        'Create an OAuth 2.0 Client ID (Web)',
        'Add http://localhost:5179 to authorized JS origins',
        'Paste the client ID into VITE_GOOGLE_CLIENT_ID in .env.local',
        'Restart the dev server',
      ],
      googleDrive: 'Google Drive',
      iCloud: 'iCloud',
      dropbox: 'Dropbox',
      notConnected: 'Not connected',
      notConnectedStub: 'Not connected (stub)',
      notSet: 'Not set',
      connect: 'Connect',
      connecting: 'Authenticating…',
      syncing: 'Syncing…',
      connected: 'Connected',
      confirmDisconnect: (n) => `Disconnect ${n}?`,
      lastSync: 'Last sync',
      syncedLabel: 'Synced memos',
      syncedMemos: (n) => `${n}`,
      format: 'Format',
      syncNow: 'Sync now',
    },
    pdf: {
      title: 'Export PDF',
      preview: 'PREVIEW',
      formatLabel: 'Format',
      formatStyled: 'Styled PDF',
      formatStyledSub: 'Tag, dates, formatted text',
      formatPlain: 'Plain text',
      formatPlainSub: 'Minimal styling',
      outputLabel: 'Output',
      outputSearchable: 'Searchable PDF (recommended)',
      outputSearchableSub: 'Print dialog → Save as PDF',
      outputImage: 'Image PDF',
      outputImageSub: 'Direct download (not searchable)',
      generate: 'Generate PDF',
      generating: 'Generating…',
      openPrint: 'Open print dialog',
      empty: 'No memos',
      statsTpl: (n, chars, date) => `${n} memos · ${chars} chars · ${date}`,
    },
    search: {
      title: 'Search',
      placeholder: 'Search memos, tags, body',
      typeHint: 'Type a keyword',
      hits: (n) => `${n} hits`,
      initialHelp: 'Search title, body, tag name, and reading.',
      noResults: 'No matching memos',
    },
    tagManage: {
      title: 'Manage tags',
      backToMenu: '← Menu',
      addTag: '+ Add tag',
      deleteConfirm: (name) =>
        `Delete "${name}"? Its memos will become untagged.`,
      moveBefore: '↑',
      moveAfter: '↓',
    },
    guide: {
      title: '📖 How to use',
      close: 'Close',
      sections: [
        {
          title: '🎙 Record',
          items: [
            'Tap the red button on Home',
            'Or say the start command',
            'Max length is configurable (default 30s)',
          ],
        },
        {
          title: '🗣 Voice commands',
          items: [
            'Say "Title is, X." to set the title',
            'Say "Save" to save',
            'Say "Cancel" to cancel',
            'Customize wording in Menu → Voice commands',
          ],
        },
        {
          title: '🏷 Tags',
          items: [
            'Pick or create a tag on save',
            'Add a reading to help similar-tag merging',
            'Tag list auto-detects similars → one-tap merge',
          ],
        },
        {
          title: '📄 Export PDF',
          items: [
            'Tag detail → "PDF"',
            'Searchable PDF: print dialog → save as PDF',
            'Image PDF: direct download',
          ],
        },
        {
          title: '☁️ Cloud sync',
          items: [
            'Menu → Cloud sync',
            'Once connected, changes sync after a 2s debounce',
            'Set VITE_GOOGLE_CLIENT_ID first',
          ],
        },
        {
          title: '🔊 Read aloud',
          items: [
            'Tap 🔊 in tag detail or edit screens',
            'Tap again to stop',
          ],
        },
        {
          title: '🌙 Theme',
          items: ['Toggle dark/light from Menu or Settings'],
        },
        {
          title: '🗑 Trash',
          items: [
            'Deleted memos auto-delete after 30 days (configurable)',
            'Restore anytime within the window',
          ],
        },
        {
          title: '⚡ Siri hands-free launch',
          items: [
            'Trigger recording with just "Hey Siri, voice memo"',
            'iOS Shortcuts app → "+" → "Open URL" action',
            'Use URL: <APP_URL>?autoRecord=true',
            'Name the shortcut, then "Add to Siri"',
            'Open the app once to grant mic permission',
            'Then say the phrase → record → say "Save" to finish',
          ],
        },
      ],
      version: 'VoiceMemo v1.0.0',
    },
    toast: {
      saved: '✓ Memo saved',
      cancelled: 'Cancelled',
      autoSaving: 'Saving…',
    },
  },
};
