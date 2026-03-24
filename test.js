//循环判断数组里的所有AesKey
const CryptoJS = require('crypto-js');
const axios = require('axios');

const CONFIG = {
    baseUrl: 'https://ali6hxl.sgsaux.com',
    prevtoken: '',//登录接口返回或在session里找到prevtoken
    customerUid: '', //抓包请求里有带
    device: 'h5',
    origin: 'https://zowhhf.ngtyptq.com',
    keyMove: 4,
    sdkmin: [
        "4!vRMj20nH+FZ", "Vr?arYV&t2dAg", "GVM2k_%Po_0fC", "nlja!18utQiMD",
        "$s_iAD9@8bSXS", "xLGHBK6M+GLb&", "5SIfjdt@xz^E4", "y_zUaIM2*aD2D",
        "Myqk!#@kbLl1@", "%@_qVhA_OJAry", "N@+KU85@erwVJ", "QkH&4z7ahHa7h",
        "3%GV4q5uA9sDw", "-_dZjs1==pmEj", "OLyWhrd1MDeHO", "$E1sofi5uiYo7",
        "6kq=JCCjLP3AQ", "n0JJO2s-BEGZB", "-v=N~iqj-SpZz", "lbKBgHnCJ72PU",
        "HfJ@Ak@=$+V+q", "Io&44K@%l%D2g", "*EnSoI1*o_-$@"
    ]
};

function getSecretKey() {
    //根据小时计算索引 (8点=索引0, 9点=索引1...)
    const hour = new Date().getHours();
    const index = (hour - 8 + 24) % 24;  // +24 处理跨天情况
    
    if (index >= CONFIG.sdkmin.length) {
        throw new Error(`SECRET 索引超出范围: ${index}, 当前小时: ${hour}`);
    }
    
    return { index, key: CONFIG.sdkmin[index] };
}

function generateTokenWithKey() {
    //生成3位随机数
    const randomNum = Math.floor(Math.random() * 900 + 100);
    const randomStr = randomNum.toString();

    //获取13位时间戳
    const tsMs = Date.now().toString().substring(0, 13);

    //根据小时选择 SDK Key
    const { index: sdkKeyIndex, key: sdkKey } = getSecretKey();

    //构造时间部分: rand + timestamp + rand
    const timePart = `${randomStr}${tsMs}${randomStr}`;

    //格式: {random}&{SECRET}&{random}{timestamp}{random}&{keyMove}
    const input = `${randomStr}&${sdkKey}&${timePart}&${CONFIG.keyMove}`;

    //计算MD5
    const md5Full = CryptoJS.MD5(input).toString();

    //截取 AES 密钥 (从索引 4 开始，取 16 位)
    const aesKeyStr = md5Full.substring(4, 20);

    //AES 加密 (ECB 模式)
    const key = CryptoJS.enc.Utf8.parse(aesKeyStr);
    const plain = CryptoJS.enc.Utf8.parse(CONFIG.prevtoken);
    const token = CryptoJS.AES.encrypt(plain, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
    }).toString();

    //构造 header 用的 timestamp
    const timestamp = tsMs + randomStr;

    return { token, timestamp };
}

async function testAllKeys() {

    for (let i = 0; i < CONFIG.sdkmin.length; i++) {
        const sdkKey = CONFIG.sdkmin[i];
        const { token, timestamp } = generateTokenWithKey();

        try {
            const response = await axios({
                method: 'GET',
                url: `${CONFIG.baseUrl}/api/v1/lottery/sale/issue`,
                params: { gameId: 26, gameRoomId: 5, count: 50, isFirst: 1, activeId: '' },
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Origin': CONFIG.origin,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    'customerUID': CONFIG.customerUid,
                    'device': CONFIG.device,
                    'timestamp': timestamp,
                    'token': token
                },
                timeout: 3000
            });

            if (response.data.code === 200) {
                console.log(`\n✅✅✅ 索引 ${i} 成功！`);
                console.log('sdkKey:', sdkKey);
                console.log('响应:', JSON.stringify(response.data, null, 2));

                // 检查是否有新 token
                if (response.data.data?.token) {
                    console.log('\n📝 新 prevToken:', response.data.data.token);
                }
                return;
            } else {
                console.log(`索引 ${i}: ${response.data.msg}`);
            }
        } catch (error) {
            console.log(`索引 ${i}: 请求失败 - ${error.message}`);
        }
    }
}

testAllKeys();