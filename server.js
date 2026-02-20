const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 設定 EDC 資訊
const EDC_URL = "http://60.251.229.32/cgi-bin/get_local_data.cgi";

app.get('/', async (req, res) => {
    let waterInfo = "尚未取得數據";
    
    try {
        // 嘗試抓取實體 EDC 數據
        // 注意：若 EDC 有帳密保護，此處需額外處理 Token
        const response = await axios.get(EDC_URL, { timeout: 5000 });
        waterInfo = JSON.stringify(response.data); 
    } catch (error) {
        waterInfo = "連線失敗 (原因: 設備未回應或防火牆阻擋)";
    }

    res.send(`
        <div style="font-family: sans-serif; padding: 20px;">
            <h1 style="color: #2c3e50;">🛡️ 安養機構管理系統 - 測試版</h1>
            <p>🟢 系統狀態：<strong>運行中</strong></p>
            
            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; border: 1px solid #dee2e6;">
                <h3>💧 供水設施即時監控</h3>
                <p>設備 IP: <code>${process.env.EDC_IP}</code></p>
                <div style="background: #000; color: #0f0; padding: 10px; border-radius: 4px;">
                    <code>${waterInfo}</code>
                </div>
                <br>
                <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">🔄 重新整理數據</button>
            </div>

            <h3 style="margin-top: 30px;">📋 28床個案紀錄 (模擬數據)</h3>
            <table border="1" cellpadding="10" style="border-collapse: collapse; width: 100%;">
                <tr style="background: #eee;"><th>床號</th><th>姓名</th><th>狀態</th><th>最後更新</th><th>動作</th></tr>
                <tr><td>A01</td><td>王*同</td><td><span style="color: orange;">● 待初審</span></td><td>2026-02-20</td><td><button>進入審核</button></td></tr>
                <tr><td>A02</td><td>李*華</td><td><span style="color: green;">● 已完成</span></td><td>2026-02-20</td><td><button>查看紀錄</button></td></tr>
            </table>
        </div>
    `);
});

app.listen(port, () => console.log(`Server running on port ${port}`));
