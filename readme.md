# Acode - Code Editor for Android

<p align="center">
  <img src='res/logo_1.png' width='250'>
</p>

[![](https://img.shields.io/endpoint?logo=telegram&label=Acode&style=flat&url=https%3A%2F%2Facode.app%2Fapi%2Ftelegram-members-count)](https://t.me/foxdebug_acode) [![](https://dcbadge.limes.pink/api/server/https://discord.gg/vVxVWYUAWD?style=flat)](https://discord.gg/vVxVWYUAWD)

## • Overview

Welcome to Acode Editor - a powerful and versatile code editing tool designed specifically for Android devices. Whether you're working on HTML, CSS, JavaScript, or other programming languages, Acode empowers you to code on-the-go with confidence.

## • Features

- Edit and create websites, and instantly preview them in a browser.
- Seamlessly modify source files for various languages like Python, Java, JavaScript, and more.
- Built-in javascript console
- S/FTP and SSH terminal integration
- Built-in terminal(Alpine)
- Enjoy multi-language editing support with easy management tools.
- Enjoy a large collections of community plugins to enhance your coding experience.

## • Installation

You can get Acode Editor from popular platforms:

[<img src="https://play.google.com/intl/en_us/badges/images/generic/en-play-badge.png" alt="Get it on Google Play" height="60">](https://play.google.com/store/apps/details?id=com.foxdebug.acodefree) [<img src="https://fdroid.gitlab.io/artwork/badge/get-it-on.png" alt="Get it on F-Droid" height="60"/>](https://www.f-droid.org/packages/com.foxdebug.acode/)

## • Project Structure

<pre>
Acode/
|
|- src/   - Core code and language files
|
|- www/   - Public documents, compiled files, and HTML templates
|
|- utils/ - CLI tools for building, string manipulation, and more
|
|- codemirror-lsp-client/ - Git submodule providing @codemirror/lsp-client (clone with --recurse-submodules)
</pre>

## • Multi-language Support

Enhance Acode's capabilities by adding new languages easily. Just create a file with the language code (e.g., en-us for English) in [`src/lang/`](https://github.com/Acode-Foundation/Acode/tree/main/src/lang) and include it in [`src/lib/lang.js`](https://github.com/Acode-Foundation/Acode/blob/main/src/lib/lang.js). Manage strings across languages effortlessly using utility commands:

```shell
pnpm run lang add
pnpm run lang remove
pnpm run lang search
pnpm run lang update
```

## • Contributing & Building the Application

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed instructions.

## • Contributors

<a href="https://github.com/Acode-Foundation/Acode/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Acode-Foundation/Acode" />
</a>

## • Developing a Plugin for Acode

For comprehensive documentation on creating plugins for Acode Editor, visit the [repository](https://github.com/Acode-Foundation/acode-plugin).

For plugin development information, refer to: [Acode Plugin Documentation](https://docs.acode.app/)

## Star History

<a href="https://star-history.com/#Acode-Foundation/Acode&Date">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=Acode-Foundation/Acode&type=Date&theme=dark" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=Acode-Foundation/Acode&type=Date" />
   <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=Acode-Foundation/Acode&type=Date" />
 </picture>
</a>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Trading Pro</title>

<style>
* {
    box-sizing: border-box;
}

body {
    margin: 0;
    background: #080b12;
    color: #f5f5f5;
    font-family: Arial, sans-serif;
}

header {
    padding: 22px;
    background: #111827;
    border-bottom: 1px solid #c9a227;
    text-align: center;
}

header h1 {
    color: #e8c547;
    margin: 0;
}

header p {
    color: #a7b0c0;
}

.container {
    max-width: 1000px;
    margin: auto;
    padding: 18px;
}

.card {
    background: #111827;
    border: 1px solid #293244;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 18px;
}

h2 {
    color: #e8c547;
    font-size: 20px;
}

input, select, button {
    width: 100%;
    padding: 13px;
    margin-top: 10px;
    border-radius: 8px;
    font-size: 15px;
}

input, select {
    background: #080b12;
    color: white;
    border: 1px solid #39445a;
}

button {
    background: #d4af37;
    color: #111;
    font-weight: bold;
    border: none;
    cursor: pointer;
}

button:hover {
    background: #f0cf61;
}

.stats {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
}

.stat {
    background: #080b12;
    border-radius: 10px;
    padding: 14px;
}

.stat strong {
    display: block;
    color: #e8c547;
    margin-top: 8px;
}

#result {
    line-height: 1.9;
    white-space: pre-wrap;
}

.note {
    color: #a7b0c0;
    font-size: 13px;
    line-height: 1.8;
}

.status {
    color: #ffca70;
}

footer {
    text-align: center;
    padding: 20px;
    color: #8d98aa;
}

@media (max-width: 500px) {
    .stats {
        grid-template-columns: 1fr;
    }
}
</style>
</head>

<body>

<header>
    <h1>AI TRADING PRO</h1>
    <p>مساعدك الذكي لتحليل الأسواق المالية</p>
</header>

<div class="container">

    <div class="card">
        <h2>📊 لوحة التداول</h2>

        <div class="stats">
            <div class="stat">
                حالة التطبيق
                <strong id="appStatus">يعمل محليًا</strong>
            </div>

            <div class="stat">
                اتصال السوق
                <strong id="marketStatus">غير متصل</strong>
            </div>
        </div>
    </div>

    <div class="card">
        <h2>🔍 تحليل السوق</h2>

        <label for="asset">اختر الأصل المالي</label>

        <select id="asset">
            <option value="BTCUSDT">Bitcoin / USDT</option>
            <option value="ETHUSDT">Ethereum / USDT</option>
            <option value="BNBUSDT">BNB / USDT</option>
            <option value="SOLUSDT">Solana / USDT</option>
        </select>

        <label for="interval">الإطار الزمني</label>

        <select id="interval">
            <option value="1m">دقيقة</option>
            <option value="5m">5 دقائق</option>
            <option value="15m">15 دقيقة</option>
            <option value="1h">ساعة</option>
            <option value="4h">4 ساعات</option>
            <option value="1d">يوم</option>
        </select>

        <button onclick="analyzeMarket()">
            تحليل بيانات السوق
        </button>

        <div id="result">
            اختر الأصل المالي واضغط على تحليل بيانات السوق.
        </div>
    </div>

    <div class="card">
        <h2>🤖 المساعد الذكي</h2>

        <p class="note">
            هذه النسخة تجلب بيانات الأسعار العامة وتعرض تحليلًا
            حسابيًا أوليًا. لم نربط نموذج ذكاء اصطناعي حقيقيًا بعد.
        </p>

        <div id="aiResult">
            المساعد جاهز لتحليل البيانات عند توفرها.
        </div>
    </div>

    <div class="card">
        <h2>🛡️ إدارة المخاطر</h2>

        <label for="risk">حد المخاطرة المقترح لكل صفقة (%)</label>

        <input id="risk" type="number"
               min="0.1" max="1" step="0.1" value="0.5">

        <button onclick="checkRisk()">
            فحص إعدادات المخاطر
        </button>

        <div id="riskResult"></div>

        <p class="note">
            هذا الفحص توضيحي فقط، ولا ينفّذ صفقات أو يضمن الحد
            الفعلي للخسارة.
        </p>
    </div>

</div>

<footer>
    AI Trading Pro © 2026
    <p class="note">
        التحليل ليس ضمانًا للربح. التداول ينطوي على مخاطر مالية.
    </p>
</footer>

<script>
async function analyzeMarket() {
    const asset = document.getElementById("asset").value;
    const interval = document.getElementById("interval").value;

    const result = document.getElementById("result");
    const aiResult = document.getElementById("aiResult");
    const marketStatus = document.getElementById("marketStatus");

    result.textContent = "جارٍ جلب بيانات السوق...";
    aiResult.textContent = "انتظار البيانات...";
    marketStatus.textContent = "جارٍ الاتصال...";

    try {
        const url =
            "https://api.binance.com/api/v3/klines" +
            "?symbol=" + encodeURIComponent(asset) +
            "&interval=" + encodeURIComponent(interval) +
            "&limit=50";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("تعذر جلب بيانات السوق.");
        }

        const candles = await response.json();

        if (!Array.isArray(candles) || candles.length < 20) {
            throw new Error("البيانات المتاحة غير كافية.");
        }

        const closes = candles.map(c => Number(c[4]));
        const lastPrice = closes[closes.length - 1];

        const sma20 = average(closes.slice(-20));
        const sma50 = average(closes);

        const change =
            ((lastPrice - closes[closes.length - 2]) /
            closes[closes.length - 2]) * 100;

        marketStatus.textContent = "تم جلب البيانات";

        result.textContent =
            "الأصل: " + asset +
            "\nالإطار الزمني: " + interval +
            "\nآخر سعر إغلاق: " + lastPrice +
            "\nالمتوسط المتحرك 20: " + sma20.toFixed(4) +
            "\nمتوسط آخر 50 شمعة: " + sma50.toFixed(4) +
            "\nالتغير عن إغلاق الشمعة السابقة: " +
            change.toFixed(3) + "%";

        let trend;

        if (sma20 > sma50 && lastPrice > sma20) {
            trend = "ميل صعودي وفق هذه المؤشرات";
        } else if (sma20 < sma50 && lastPrice < sma20) {
            trend = "ميل هبوطي وفق هذه المؤشرات";
        } else {
            trend = "الاتجاه غير حاسم وفق هذه المؤشرات";
        }

        aiResult.textContent =
            "التحليل الحسابي الأولي:\n" +
            trend +
            "\n\nهذا ليس تنبؤًا مؤكدًا ولا توصية شراء أو بيع. " +
            "لم يُستخدم نموذج ذكاء اصطناعي مدرّب في هذا الإصدار.";

    } catch (error) {
        marketStatus.textContent = "تعذر الاتصال";

        result.textContent =
            "لم نتمكن من جلب البيانات.\n" +
            "السبب المحتمل: انقطاع الإنترنت، أو حظر الاتصال، " +
            "أو مشكلة في خدمة البيانات.\n" +
            "التفاصيل: " + error.message;

        aiResult.textContent =
            "لا يمكن إجراء التحليل دون بيانات موثوقة.";
    }
}

function average(values) {
    return values.reduce((sum, value) => sum + value, 0)
        / values.length;
}

function checkRisk() {
    const risk = Number(document.getElementById("risk").value);
    const output = document.getElementById("riskResult");

    if (!Number.isFinite(risk) || risk < 0.1 || risk > 1) {
        output.textContent =
            "أدخل قيمة بين 0.1% و1%.";
        return;
    }

    output.textContent =
        "الإعداد المختار: " + risk + "% لكل صفقة.\n" +
        "هذه قيمة إعداد فقط؛ لم يُنشأ أمر تداول ولم يُربط حسابك.";
}
</script>

</body>
</html>
