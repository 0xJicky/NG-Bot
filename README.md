# NG-Bot
NG体育token加密逆向方法
Author: Jicky X:@EphraimLarjah

方法加密主入口在app.cfeca95c.js文件的_0x3372db()函数里
<img width="807" height="363" alt="ScreenShot_2026-03-24_161154_866" src="https://github.com/user-attachments/assets/1aee2736-f45d-44ac-b0fb-03c6c0109afe" />


| 步骤 | 内容 |
|------|------|
| 1️⃣ SECRET | `DECRYPT_SECRET[hour - 8]` |
| 2️⃣ 随机数 | 3位数字 (100-999) |
| 3️⃣ 时间戳 | 13位毫秒时间戳 |
| 4️⃣ MD5 输入 | `{random}&{SECRET}&{random}{timestamp}{random}&{keyMove}` |
| 5️⃣ aesKey | `MD5.substring(4, 20)` |
| 6️⃣ Token | 需要 `_0xac8278.c` 源码 |

需要注意的是：本次最难的操作是数组里的AES密钥会变化，理论上是一小时变一次，如后期数组发生变化，在浏览器上执行以下命令获取密钥数组
 console.log('\n=== 检查 store.state.sdkmin 结构 ===');
 const app = document.getElementById('app') || document.querySelector('#app');
 const store = app.__vue__.$store;
 console.log('sdkmin 所有字段:', Object.keys(store.state.sdkmin));
 console.log('SECRET:', store.state.sdkmin.SECRET);
 console.log('DECRYPT_SECRET:', store.state.sdkmin.DECRYPT_SECRET);

本次v1.0 密钥数组为：
 sdkmin: [
        "4!vRMj20nH+FZ", "Vr?arYV&t2dAg", "GVM2k_%Po_0fC", "nlja!18utQiMD",
        "$s_iAD9@8bSXS", "xLGHBK6M+GLb&", "5SIfjdt@xz^E4", "y_zUaIM2*aD2D",
        "Myqk!#@kbLl1@", "%@_qVhA_OJAry", "N@+KU85@erwVJ", "QkH&4z7ahHa7h",
        "3%GV4q5uA9sDw", "-_dZjs1==pmEj", "OLyWhrd1MDeHO", "$E1sofi5uiYo7",
        "6kq=JCCjLP3AQ", "n0JJO2s-BEGZB", "-v=N~iqj-SpZz", "lbKBgHnCJ72PU",
        "HfJ@Ak@=$+V+q", "Io&44K@%l%D2g", "*EnSoI1*o_-$@"
    ]

MD5字符串生成格式：520&y_zUaIM2*aD2D&5201774336963251520&4 -> 转换为格式：${randomStr}&${sdkKey}&${timePart}&${CONFIG.keyMove} 

v1.1 update AES KEY获取逻辑
