export const mockResultJson = {
  success: true,
  plans: [
    {
      title: '読書ログ #1',
      description: 'Kindleの本を10ページ読んだ',
      category: '読書',
      schema: {
        pages: {
          type: 'number',
          unit: 'ページ',
        },
        bookTitle: {
          type: 'string',
        },
        timestamp: {
          type: 'date',
        },
      },
      archetype: 'attribute-card',
      data: {
        pages: 10,
        bookTitle: 'Kindleの本',
        timestamp: '2023-10-01T00:00:00Z',
      },
      items: [
        {
          id: '1-1',
          label: 'カテゴリ: 読書',
          status: 'pending',
        },
        {
          id: '1-2',
          label: 'アーキタイプ: attribute-card',
          status: 'pending',
        },
        {
          id: '1-3',
          label: 'データ項目: 3件',
          status: 'pending',
        },
      ],
    },
    {
      title: 'タスクログ #2',
      description: 'CESのイベントのどのパビリオンを回るかを検討する必要がある',
      category: 'タスク',
      schema: {
        task: {
          type: 'string',
        },
        status: {
          type: 'string',
        },
      },
      archetype: 'task-list',
      data: {
        task: 'CESのイベントのパビリオンを検討する',
        status: '未着手',
      },
      items: [
        {
          id: '2-1',
          label: 'カテゴリ: タスク',
          status: 'pending',
        },
        {
          id: '2-2',
          label: 'アーキタイプ: task-list',
          status: 'pending',
        },
        {
          id: '2-3',
          label: 'データ項目: 2件',
          status: 'pending',
        },
      ],
    },
    {
      title: 'プログラミングログ #3',
      description: 'プログラミングについてお客様への対応を行った',
      category: 'プログラミング',
      schema: {
        activity: {
          type: 'string',
        },
        timestamp: {
          type: 'date',
        },
      },
      archetype: 'attribute-card',
      data: {
        activity: 'お客様へのプログラミング対応',
        timestamp: '2023-10-01T00:00:00Z',
      },
      items: [
        {
          id: '3-1',
          label: 'カテゴリ: プログラミング',
          status: 'pending',
        },
        {
          id: '3-2',
          label: 'アーキタイプ: attribute-card',
          status: 'pending',
        },
        {
          id: '3-3',
          label: 'データ項目: 2件',
          status: 'pending',
        },
      ],
    },
    {
      title: 'プログラミングログ #4',
      description: 'プログラミングに関する必要な知識のインプットを行った',
      category: 'プログラミング',
      schema: {
        activity: {
          type: 'string',
        },
        timestamp: {
          type: 'date',
        },
      },
      archetype: 'attribute-card',
      data: {
        activity: '必要な知識のインプット',
        timestamp: '2023-10-01T00:00:00Z',
      },
      items: [
        {
          id: '4-1',
          label: 'カテゴリ: プログラミング',
          status: 'pending',
        },
        {
          id: '4-2',
          label: 'アーキタイプ: attribute-card',
          status: 'pending',
        },
        {
          id: '4-3',
          label: 'データ項目: 2件',
          status: 'pending',
        },
      ],
    },
  ],
  multiPlan: {
    title: '4件のログレコードを抽出',
    description: '入力テキストから4件のログレコードを抽出しました。各レコードを確認・編集してから保存してください。',
    plans: [
      {
        title: '読書ログ #1',
        description: 'Kindleの本を10ページ読んだ',
        category: '読書',
        schema: {
          pages: {
            type: 'number',
            unit: 'ページ',
          },
          bookTitle: {
            type: 'string',
          },
          timestamp: {
            type: 'date',
          },
        },
        archetype: 'attribute-card',
        data: {
          pages: 10,
          bookTitle: 'Kindleの本',
          timestamp: '2023-10-01T00:00:00Z',
        },
        items: [
          {
            id: '1-1',
            label: 'カテゴリ: 読書',
            status: 'pending',
          },
          {
            id: '1-2',
            label: 'アーキタイプ: attribute-card',
            status: 'pending',
          },
          {
            id: '1-3',
            label: 'データ項目: 3件',
            status: 'pending',
          },
        ],
      },
      {
        title: 'タスクログ #2',
        description: 'CESのイベントのどのパビリオンを回るかを検討する必要がある',
        category: 'タスク',
        schema: {
          task: {
            type: 'string',
          },
          status: {
            type: 'string',
          },
        },
        archetype: 'task-list',
        data: {
          task: 'CESのイベントのパビリオンを検討する',
          status: '未着手',
        },
        items: [
          {
            id: '2-1',
            label: 'カテゴリ: タスク',
            status: 'pending',
          },
          {
            id: '2-2',
            label: 'アーキタイプ: task-list',
            status: 'pending',
          },
          {
            id: '2-3',
            label: 'データ項目: 2件',
            status: 'pending',
          },
        ],
      },
      {
        title: 'プログラミングログ #3',
        description: 'プログラミングについてお客様への対応を行った',
        category: 'プログラミング',
        schema: {
          activity: {
            type: 'string',
          },
          timestamp: {
            type: 'date',
          },
        },
        archetype: 'attribute-card',
        data: {
          activity: 'お客様へのプログラミング対応',
          timestamp: '2023-10-01T00:00:00Z',
        },
        items: [
          {
            id: '3-1',
            label: 'カテゴリ: プログラミング',
            status: 'pending',
          },
          {
            id: '3-2',
            label: 'アーキタイプ: attribute-card',
            status: 'pending',
          },
          {
            id: '3-3',
            label: 'データ項目: 2件',
            status: 'pending',
          },
        ],
      },
      {
        title: 'プログラミングログ #4',
        description: 'プログラミングに関する必要な知識のインプットを行った',
        category: 'プログラミング',
        schema: {
          activity: {
            type: 'string',
          },
          timestamp: {
            type: 'date',
          },
        },
        archetype: 'attribute-card',
        data: {
          activity: '必要な知識のインプット',
          timestamp: '2023-10-01T00:00:00Z',
        },
        items: [
          {
            id: '4-1',
            label: 'カテゴリ: プログラミング',
            status: 'pending',
          },
          {
            id: '4-2',
            label: 'アーキタイプ: attribute-card',
            status: 'pending',
          },
          {
            id: '4-3',
            label: 'データ項目: 2件',
            status: 'pending',
          },
        ],
      },
    ],
    totalRecords: 4,
  },
}
