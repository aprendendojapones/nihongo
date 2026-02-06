export const JLPT_EXPANDED = {
    N5: {
        kanji: [
            // Numbers
            { char: '一', u: 'ichi', m: 'Um' }, { char: '二', u: 'ni', m: 'Dois' }, { char: '三', u: 'san', m: 'Três' },
            { char: '四', u: 'yon/shi', m: 'Quatro' }, { char: '五', u: 'go', m: 'Cinco' }, { char: '六', u: 'roku', m: 'Seis' },
            { char: '七', u: 'nana/shichi', m: 'Sete' }, { char: '八', u: 'hachi', m: 'Oito' }, { char: '九', u: 'kyuu', m: 'Nove' },
            { char: '十', u: 'juu', m: 'Dez' }, { char: '百', u: 'hyaku', m: 'Cem' }, { char: '千', u: 'sen', m: 'Mil' },
            { char: '万', u: 'man', m: 'Dez Mil' }, { char: '円', u: 'en', m: 'Iene' },
            // Time
            { char: '日', u: 'hi/nichi', m: 'Dia/Sol' }, { char: '月', u: 'tsuki/getsu', m: 'Mês/Lua' },
            { char: '火', u: 'hi/ka', m: 'Fogo' }, { char: '水', u: 'mizu/sui', m: 'Água' },
            { char: '木', u: 'ki/moku', m: 'Árvore' }, { char: '金', u: 'kane/kin', m: 'Ouro/Dinheiro' },
            { char: '土', u: 'tsuchi/do', m: 'Terra' }, { char: '年', u: 'toshi/nen', m: 'Ano' },
            { char: '時', u: 'toki/ji', m: 'Tempo/Hora' }, { char: '分', u: 'fun/bun', m: 'Minuto' },
            { char: '午', u: 'go', m: 'Meio-dia' }, { char: '今', u: 'ima/kon', m: 'Agora' },
            { char: '先', u: 'saki/sen', m: 'Anterior' }, { char: '来', u: 'ku/rai', m: 'Vir' },
            // People & Body
            { char: '人', u: 'hito/jin', m: 'Pessoa' }, { char: '名', u: 'na/mei', m: 'Nome' },
            { char: '女', u: 'onna/jo', m: 'Mulher' }, { char: '男', u: 'otoko/dan', m: 'Homem' },
            { char: '子', u: 'ko/shi', m: 'Criança' }, { char: '目', u: 'me/moku', m: 'Olho' },
            { char: '耳', u: 'mimi/ji', m: 'Orelha' }, { char: '口', u: 'kuchi/kou', m: 'Boca' },
            { char: '手', u: 'te/shu', m: 'Mão' }, { char: '足', u: 'ashi/soku', m: 'Pé/Perna' },
            // Nature & Elements
            { char: '山', u: 'yama/san', m: 'Montanha' }, { char: '川', u: 'kawa/sen', m: 'Rio' },
            { char: '田', u: 'ta/den', m: 'Campo de Arroz' }, { char: '雨', u: 'ame/u', m: 'Chuva' },
            { char: '空', u: 'sora/kuu', m: 'Céu/Vazio' }, { char: '気', u: 'ki', m: 'Espírito/Ar' },
            { char: '天', u: 'ten', m: 'Céu/Paraíso' },
            // Actions & State
            { char: '行', u: 'i/kou', m: 'Ir' }, { char: '来', u: 'ku/rai', m: 'Vir' },
            { char: '食', u: 'ta/shoku', m: 'Comer' }, { char: '飲', u: 'no/in', m: 'Beber' },
            { char: '見', u: 'mi/ken', m: 'Ver' }, { char: '聞', u: 'ki/bun', m: 'Ouvir' },
            { char: '読', u: 'yo/doku', m: 'Ler' }, { char: '書', u: 'ka/sho', m: 'Escrever' },
            { char: '話', u: 'hana/wa', m: 'Falar' }, { char: '買', u: 'ka/bai', m: 'Comprar' },
            // Adjectives
            { char: '大', u: 'oo/dai', m: 'Grande' }, { char: '小', u: 'chii/shou', m: 'Pequeno' },
            { char: '新', u: 'atara/shin', m: 'Novo' }, { char: '古', u: 'furu/ko', m: 'Velho' },
            { char: '高', u: 'taka/kou', m: 'Alto/Caro' }, { char: '安', u: 'yasu/an', m: 'Barato/Seguro' },
            { char: '多', u: 'oo/ta', m: 'Muitos' }, { char: '少', u: 'suku/shou', m: 'Poucos' },
            { char: '長', u: 'naga/chou', m: 'Longo' }, { char: '白', u: 'shiro/haku', m: 'Branco' },
            // Objects & Places
            { char: '本', u: 'hon', m: 'Livro' }, { char: '校', u: 'kou', m: 'Escola' },
            { char: '店', u: 'mise/ten', m: 'Loja' }, { char: '社', u: 'sha', m: 'Empresa/Santuário' },
            { char: '国', u: 'kuni/koku', m: 'País' }, { char: '道', u: 'michi/dou', m: 'Caminho/Estrada' },
            { char: '車', u: 'kuruma/sha', m: 'Carro' }, { char: '駅', u: 'eki', m: 'Estação' },
            { char: '電', u: 'den', m: 'Eletricidade' }, { char: '魚', u: 'sakana/gyo', m: 'Peixe' },
        ],
        vocab: [
            // Greetings
            { w: 'こんにちは', r: 'Konnichiwa', m: 'Olá (tarde)' }, { w: 'おはよう', r: 'Ohayou', m: 'Bom dia' },
            { w: 'こんばんは', r: 'Konbanwa', m: 'Boa noite' }, { w: 'さようなら', r: 'Sayounara', m: 'Adeus' },
            { w: 'ありがとう', r: 'Arigatou', m: 'Obrigado' }, { w: 'すみません', r: 'Sumimasen', m: 'Com licença/Desculpe' },
            // Pronouns
            { w: '私', r: 'Watashi', m: 'Eu' }, { w: 'あなた', r: 'Anata', m: 'Você' },
            { w: '彼', r: 'Kare', m: 'Ele/Namorado' }, { w: '彼女', r: 'Kanojo', m: 'Ela/Namorada' },
            // Family
            { w: '家族', r: 'Kazoku', m: 'Família' }, { w: '父', r: 'Chichi', m: 'Meu Pai' },
            { w: '母', r: 'Haha', m: 'Minha Mãe' }, { w: '兄', r: 'Ani', m: 'Irmão Mais Velho' },
            { w: '姉', r: 'Ane', m: 'Irmã Mais Velha' }, { w: '弟', r: 'Otouto', m: 'Irmão Mais Novo' },
            // Food
            { w: 'ご飯', r: 'Gohan', m: 'Arroz/Refeição' }, { w: 'パン', r: 'Pan', m: 'Pão' },
            { w: '肉', r: 'Niku', m: 'Carne' }, { w: '魚', r: 'Sakana', m: 'Peixe' },
            { w: '野菜', r: 'Yasai', m: 'Legumes' }, { w: '果物', r: 'Kudamono', m: 'Frutas' },
            { w: 'お茶', r: 'Ocha', m: 'Chá Verde' }, { w: '水', r: 'Mizu', m: 'Água' },
            // Daily Life
            { w: '学校', r: 'Gakkou', m: 'Escola' }, { w: '先生', r: 'Sensei', m: 'Professor' },
            { w: '学生', r: 'Gakusei', m: 'Estudante' }, { w: '会社', r: 'Kaisha', m: 'Empresa' },
            { w: '仕事', r: 'Shigoto', m: 'Trabalho' }, { w: '銀行', r: 'Ginkou', m: 'Banco' },
            { w: '郵便局', r: 'Yuubinkyoku', m: 'Correio' }, { w: '図書館', r: 'Toshokan', m: 'Biblioteca' },
            { w: 'デパート', r: 'Depaato', m: 'Loja de Departamento' }, { w: 'レストラン', r: 'Resutoran', m: 'Restaurante' },
            // Time
            { w: '今日', r: 'Kyou', m: 'Hoje' }, { w: '明日', r: 'Ashita', m: 'Amanhã' },
            { w: '昨日', r: 'Kinou', m: 'Ontem' }, { w: '毎日', r: 'Mainichi', m: 'Todos os dias' },
            { w: '朝', r: 'Asa', m: 'Manhã' }, { w: '昼', r: 'Hiru', m: 'Dia/Tarde' },
            { w: '夜', r: 'Yoru', m: 'Noite' }, { w: '週', r: 'Shuu', m: 'Semana' },
            // Adjectives (i-adj)
            { w: '大きい', r: 'Ookii', m: 'Grande' }, { w: '小さい', r: 'Chiisai', m: 'Pequeno' },
            { w: '新しい', r: 'Atarashii', m: 'Novo' }, { w: '古い', r: 'Furui', m: 'Velho' },
            { w: '良い', r: 'Ii/Yoi', m: 'Bom' }, { w: '悪い', r: 'Warui', m: 'Ruim' },
            { w: '暑い', r: 'Atsui', m: 'Quente (clima)' }, { w: '寒い', r: 'Samui', m: 'Frio (clima)' },
            { w: '熱い', r: 'Atsui', m: 'Quente (toque)' }, { w: '冷たい', r: 'Tsumetai', m: 'Frio (toque)' },
            { w: '難しい', r: 'Muzukashii', m: 'Difícil' }, { w: '易しい', r: 'Yasashii', m: 'Fácil' },
            { w: '高い', r: 'Takai', m: 'Alto/Caro' }, { w: '安い', r: 'Yasui', m: 'Barato' },
            { w: '低い', r: 'Hikui', m: 'Baixo' }, { w: '面白い', r: 'Omoshiroi', m: 'Interessante' },
            { w: '忙しい', r: 'Isogashii', m: 'Ocupado' }, { w: '楽しい', r: 'Tanoshii', m: 'Divertido' },
            { w: '白い', r: 'Shiroi', m: 'Branco' }, { w: '黒い', r: 'Kuroi', m: 'Preto' },
            { w: '赤い', r: 'Akai', m: 'Vermelho' }, { w: '青い', r: 'Aoi', m: 'Azul' },
            // Verbs
            { w: '行く', r: 'Iku', m: 'Ir' }, { w: '来る', r: 'Kuru', m: 'Vir' },
            { w: '帰る', r: 'Kaeru', m: 'Voltar (casa)' }, { w: '食べる', r: 'Taberu', m: 'Comer' },
            { w: '飲む', r: 'Nomu', m: 'Beber' }, { w: '見る', r: 'Miru', m: 'Ver' },
            { w: '聞く', r: 'Kiku', m: 'Ouvir' }, { w: '読む', r: 'Yomu', m: 'Ler' },
            { w: '書く', r: 'Kaku', m: 'Escrever' }, { w: '買う', r: 'Kau', m: 'Comprar' },
            { w: 'する', r: 'Suru', m: 'Fazer' }, { w: '寝る', r: 'Neru', m: 'Dormir' },
            { w: '起きる', r: 'Okiru', m: 'Acordar' }, { w: '会う', r: 'Au', m: 'Encontrar' },
            { w: '遊ぶ', r: 'Asobu', m: 'Brincar/Divirtir' }, { w: '待つ', r: 'Matsu', m: 'Esperar' },
            { w: '分かる', r: 'Wakaru', m: 'Entender' }, { w: 'ある', r: 'Aru', m: 'Haver/Estar (inanimado)' },
            { w: 'いる', r: 'Iru', m: 'Haver/Estar (animado)' }
        ]
    },
    N4: {
        kanji: [
            { char: '会', u: 'kai/a', m: 'Encontro' }, { char: '同', u: 'dou/ona', m: 'Mesmo' },
            { char: '事', u: 'ji/koto', m: 'Assunto' }, { char: '自', u: 'ji/mizuka', m: 'Si mesmo' },
            { char: '社', u: 'sha/yashiro', m: 'Empresa' }, { char: '発', u: 'hatsu', m: 'Partida' },
            { char: '者', u: 'sha/mono', m: 'Pessoa' }, { char: '地', u: 'chi/ji', m: 'Terra' },
            { char: '業', u: 'gyou/waza', m: 'Negócio' }, { char: '方', u: 'hou/kata', m: 'Direção' },
            { char: '新', u: 'shin/atara', m: 'Novo' }, { char: '場', u: 'jou/ba', m: 'Lugar' },
            { char: '員', u: 'in', m: 'Membro' }, { char: '立', u: 'ritsu/ta', m: 'Levantar' },
            { char: '開', u: 'kai/hira', m: 'Abrir' }, { char: '手', u: 'shu/te', m: 'Mão' },
            { char: '力', u: 'ryoku/chikara', m: 'Força' }, { char: '目', u: 'moku/me', m: 'Olho' },
            { char: '通', u: 'tsuu/too', m: 'Passar' }, { char: '代', u: 'dai/ka', m: 'Substituir' },
        ],
        vocab: [
            { w: '間', r: 'Aida', m: 'Entre/Intervalo' }, { w: '合う', r: 'Au', m: 'Caber/Combinar' },
            { w: '赤ちゃん', r: 'Akachan', m: 'Bebê' }, { w: '上がる', r: 'Agaru', m: 'Subir' },
            { w: '赤ん坊', r: 'Akanbou', m: 'Bebê' }, { w: '空く', r: 'Aku', m: 'Estar vazio' },
            { w: 'アクセサリー', r: 'Akusesari', m: 'Acessório' }, { w: 'あげる', r: 'Ageru', m: 'Dar' },
            { w: '浅い', r: 'Asai', m: 'Raso' }, { w: '味', r: 'Aji', m: 'Sabor' },
            { w: 'アジア', r: 'Ajia', m: 'Ásia' }, { w: '明日', r: 'Asu', m: 'Amanhã' },
            { w: '遊び', r: 'Asobi', m: 'Brincadeira' }, { w: '集まる', r: 'Atsumaru', m: 'Reunir-se' },
            { w: '集める', r: 'Atsumeru', m: 'Colecionar' }, { w: 'アナウンサー', r: 'Anaunsaa', m: 'Locutor' },
            { w: 'アフリカ', r: 'Afurika', m: 'África' }, { w: 'アメリカ', r: 'Amerika', m: 'América/EUA' },
            { w: '謝る', r: 'Ayamaru', m: 'Pedir desculpas' }, { w: 'アルコール', r: 'Arukooru', m: 'Álcool' },
        ]
    },
    N3: {
        kanji: [
            { char: '政', u: 'sei/matsurigoto', m: 'Política' }, { char: '議', u: 'gi', m: 'Deliberação' },
            { char: '民', u: 'min/tami', m: 'Povo' }, { char: '連', u: 'ren/tsu', m: 'Levar' },
            { char: '選', u: 'sen/era', m: 'Escolher' }, { char: '関', u: 'kan/seki', m: 'Relação' },
            { char: '戦', u: 'sen/tataka', m: 'Guerra' }, { char: '最', u: 'sai/mo', m: 'Mais' },
            { char: '約', u: 'yaku', m: 'Promessa/Aprox' }, { char: '法', u: 'hou', m: 'Lei' },
        ],
        vocab: [
            { w: '愛', r: 'Ai', m: 'Amor' }, { w: '愛情', r: 'Aijou', m: 'Afeição' },
            { w: '合図', r: 'Aizu', m: 'Sinal' }, { w: '愛する', r: 'Aisuru', m: 'Amar' },
            { w: '相手', r: 'Aite', m: 'Parceiro' }, { w: 'あいにく', r: 'Ainiku', m: 'Infelizmente' },
            { w: '明かり', r: 'Akari', m: 'Luz/Claridade' }, { w: '空き', r: 'Aki', m: 'Vaga/Espaço' },
            { w: '明らか', r: 'Akiraka', m: 'Óbvio' }, { w: '諦める', r: 'Akirameru', m: 'Desistir' },
        ]
    },
    N2: {
        kanji: [
            { char: '党', u: 'tou', m: 'Partido' }, { char: '協', u: 'kyou', m: 'Cooperação' },
            { char: '総', u: 'sou', m: 'Total' }, { char: '区', u: 'ku', m: 'Distrito' },
            { char: '領', u: 'ryou', m: 'Território' }, { char: '県', u: 'ken', m: 'Prefeitura' },
            { char: '設', u: 'setsu/mou', m: 'Estabelecer' }, { char: '保', u: 'ho/tamo', m: 'Preservar' },
            { char: '改', u: 'kai/arata', m: 'Reformar' }, { char: '第', u: 'dai', m: 'Número (ordinal)' },
        ],
        vocab: [
            { w: '永遠', r: 'Eien', m: 'Eternidade' }, { w: '永久', r: 'Eikyuu', m: 'Permanente' },
            { w: '影響', r: 'Eikyou', m: 'Influência' }, { w: '営業', r: 'Eigyou', m: 'Negócios/Vendas' },
            { w: '衛星', r: 'Eisei', m: 'Satélite' }, { w: '栄養', r: 'Eiyou', m: 'Nutrição' },
            { w: '得る', r: 'Eru', m: 'Obter' }, { w: '延期', r: 'Enki', m: 'Adiamento' },
        ]
    },
    N1: {
        kanji: [
            { char: '氏', u: 'shi/uji', m: 'Sobrenome' }, { char: '統', u: 'tou/su', m: 'Unificar' },
            { char: '保', u: 'ho/tamo', m: 'Garantir' }, { char: '提', u: 'tei/sa', m: 'Propor' },
            { char: '挙', u: 'kyo/a', m: 'Levantar' }, { char: '裁', u: 'sai/saba', m: 'Julgar' },
        ],
        vocab: [
            { w: '意図', r: 'Ito', m: 'Intenção' }, { w: '緯度', r: 'Ido', m: 'Latitude' },
            { w: '異動', r: 'Idou', m: 'Mudança (pessoal)' }, { w: '挑む', r: 'Idomu', m: 'Desafiar' },
            { w: '委任', r: 'Inin', m: 'Delegação' }, { w: '異議', r: 'Igi', m: 'Objeção' },
        ]
    }
};
