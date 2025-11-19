// グローバル変数
let participants = [];
let participantNames = {};
let roundNumber = 1;

// 「誰が」の選択肢
const whoOptions = ['個人', 'ペア', '2チーム'];

// 「何で」の選択肢
const whatOptions = [
    '普通の採点',
    '消費カロリー',
    '音程バー非表示',
    'しゃくり勝負',
    'ビブラート勝負',
    '抑揚勝負',
    'ロングトーン勝負',
    'リズム勝負',
    'アニソン縛り',
    '点数勝負（小数点以下）'
];

// ルール説明
const ruleDescriptions = {
    '普通の採点': '通常の採点モードで歌います。総合得点で競います。',
    '消費カロリー': '歌唱時の消費カロリーで競います。激しく歌って消費カロリーを稼ぎましょう！',
    '音程バー非表示': '音程バーを非表示にして歌います。自分の感覚だけを頼りに歌いましょう。',
    'しゃくり勝負': 'しゃくりの回数で競います。音程を下から上にしゃくり上げるテクニックです。',
    'ビブラート勝負': 'ビブラートの回数や秒数で競います。声を震わせるテクニックです。',
    '抑揚勝負': '抑揚の点数で競います。声の強弱をつけて表現力豊かに歌いましょう。',
    'ロングトーン勝負': 'ロングトーンの秒数で競います。長く安定した音を出し続けるテクニックです。',
    'リズム勝負': 'リズム点数で競います。正確なタイミングで歌うことが重要です。',
    'アニソン縛り': 'アニメソング限定で歌います。好きなアニソンで勝負しましょう！',
    '点数勝負（小数点以下）': '総合得点の小数点以下の数値で競います。例：95.342点なら342が得点です。運要素が強いモードです。'
};

let currentRule = '';

// モーダルを表示
function showRuleModal() {
    const rule = document.getElementById('what').textContent;
    currentRule = rule;
    
    document.getElementById('modalTitle').textContent = rule;
    document.getElementById('modalBody').innerHTML = `<p>${ruleDescriptions[rule] || 'ルールの説明がありません。'}</p>`;
    
    document.getElementById('ruleModal').classList.add('active');
}

// モーダルを閉じる
function closeModal(event) {
    // 引数がない場合、またはモーダル背景をクリックした場合
    if (!event || event.target.id === 'ruleModal') {
        document.getElementById('ruleModal').classList.remove('active');
    }
}

// 配列をシャッフルする関数
function shuffle(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// ランダムに1つ選ぶ関数
function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// 参加者IDから表示名を取得
function getDisplayName(id) {
    return participantNames[id];
}

// 名前入力画面を表示
function showNameInput() {
    const count = document.getElementById('participantCount').value;
    if (!count) {
        alert('参加人数を選択してください');
        return;
    }

    // 参加者にIDを付与 (A, B, C, ...)
    participants = [];
    for (let i = 0; i < parseInt(count); i++) {
        participants.push(String.fromCharCode(65 + i)); // A=65
    }

    // 名前入力フォームを生成
    const container = document.getElementById('nameInputContainer');
    container.innerHTML = '';
    
    participants.forEach((id, index) => {
        const div = document.createElement('div');
        div.className = 'name-input-item';
        div.innerHTML = `
            <label class="name-input-label">${index + 1}人目の名前:</label>
            <input type="text" id="name_${id}" placeholder="例: 太郎" required>
            <div class="error-message" id="error_${id}">名前を入力してください</div>
        `;
        container.appendChild(div);
        
        // 入力時にエラー表示をクリア
        const input = document.getElementById(`name_${id}`);
        if (input) {
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('error');
                    const errorMsg = document.getElementById(`error_${id}`);
                    if (errorMsg) {
                        errorMsg.classList.remove('show');
                    }
                }
            });
        }
    });

    document.getElementById('setupPhase').classList.add('hidden');
    document.getElementById('nameInputPhase').classList.remove('hidden');
}

// 1発目の準備
function startFirstSong() {
    // まず全てのエラー表示をクリア
    participants.forEach(id => {
        const input = document.getElementById(`name_${id}`);
        const errorMsg = document.getElementById(`error_${id}`);
        if (input) {
            input.classList.remove('error');
        }
        if (errorMsg) {
            errorMsg.classList.remove('show');
        }
    });

    // 入力された名前を保存・バリデーション
    participantNames = {};
    let hasError = false;
    
    participants.forEach((id) => {
        const input = document.getElementById(`name_${id}`);
        const errorMsg = document.getElementById(`error_${id}`);
        
        if (input && input.value.trim()) {
            participantNames[id] = input.value.trim();
        } else {
            // エラー表示
            hasError = true;
            if (input) {
                input.classList.add('error');
            }
            if (errorMsg) {
                errorMsg.classList.add('show');
            }
        }
    });

    // エラーがある場合は処理を中断
    if (hasError) {
        return;
    }

    document.getElementById('nameInputPhase').classList.add('hidden');
    document.getElementById('firstSongPhase').classList.remove('hidden');
}

// 1発目のマイク回し順を表示
function showFirstSongOrder() {
    const selectedRadio = document.querySelector('input[name="firstSong"]:checked');
    if (!selectedRadio) {
        alert('曲を選択してください');
        return;
    }

    const song = selectedRadio.value;
    document.getElementById('selectedSong').textContent = song;

    // ランダムに開始者を決定
    const startPerson = randomChoice(participants);

    // 「○○さんから時計回り」という形式で表示
    const clockwiseElement = document.getElementById('clockwiseOrder');
    clockwiseElement.innerHTML = `<strong>${getDisplayName(startPerson)}さんから時計回り</strong>`;

    document.getElementById('firstSongResult').classList.remove('hidden');
}

// 2発目以降のフェーズへ
function startSecondRound() {
    document.getElementById('firstSongPhase').classList.add('hidden');
    document.getElementById('mainPhase').classList.remove('hidden');
    roundNumber = 1;
    generateRound();
}

// ラウンドを生成
function generateRound() {
    document.getElementById('roundInfo').textContent = `ラウンド ${roundNumber}`;

    // 「誰が」と「何で」をランダム決定
    const who = randomChoice(whoOptions);
    const what = randomChoice(whatOptions);

    document.getElementById('who').textContent = who;
    document.getElementById('what').textContent = what;

    // 順番を生成
    generateOrder(who);
}

// 順番を生成
function generateOrder(who) {
    const listElement = document.getElementById('orderList');
    listElement.innerHTML = '';

    let order = [];

    if (who === '個人') {
        // 個人: 全員をシャッフル
        order = shuffle(participants).map(p => getDisplayName(p));
    } else if (who === 'ペア') {
        // ペア: 2人ずつランダムにペアリング
        const shuffled = shuffle(participants);
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                order.push(`ペア: ${getDisplayName(shuffled[i])} & ${getDisplayName(shuffled[i + 1])}`);
            } else {
                // 奇数人の場合、最後の人は単独
                order.push(`${getDisplayName(shuffled[i])} (単独)`);
            }
        }
        order = shuffle(order);
    } else if (who === '2チーム') {
        // 2チーム: 半分ずつに分ける
        const shuffled = shuffle(participants);
        const mid = Math.ceil(shuffled.length / 2);
        const team1 = shuffled.slice(0, mid);
        const team2 = shuffled.slice(mid);
        
        order = shuffle([
            `チーム1: ${team1.map(p => getDisplayName(p)).join(', ')}`,
            `チーム2: ${team2.map(p => getDisplayName(p)).join(', ')}`
        ]);
    }

    // 順番を表示
    order.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="order-number">${index + 1}</div>
            <div>${item}</div>
        `;
        listElement.appendChild(li);
    });
}

// 次のラウンドへ
function nextRound() {
    roundNumber++;
    generateRound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
