const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// 從環境變數或說明書定義獲取配置 [cite: 92, 103, 107, 109]
const HOST_IP = "60.251.229.32";
const LOGIN_URL = `http://${HOST_IP}/login`;
const SYSTEM_URL = `http://${HOST_IP}/systemcfg`;

async function getEdcData() {
    try {
        // 1. 系統登入獲取 Token [cite: 101, 102, 115]
        const loginRes = await axios.post(LOGIN_URL, {
            username: "admin",
            password: "admin"
        });
        const token = loginRes.data.data;

        // 2. 獲取感測器列表以確認 suid 和 cuid [cite: 117, 118, 124, 126]
        // 註：測試階段若已知 ID 可跳過此步直接請求數據
        
        // 3. 獲取歷史數據 (使用說明書範例 ID) [cite: 149, 155, 157, 158]
        const dataRes = await axios.post(SYSTEM_URL, {
            request: "getLocalDatas",
            value: {
                suid: "1541", // 根據說明書 4.2 範例 [cite: 132]
                cuid: "128",  // 根據說明書 4.2 範例 [cite: 143]
                startTime: Date.now() - 3600000, // 抓取過去一小時 [cite: 161]
                endTime: "0" // 設為 0 代表至今 [cite: 166]
            },
            token: token
        });

        return { success: true, data: dataRes.data.data }; // data 為純文字字串 
    } catch (error) {
        return { success: false, msg: error.message };
    }
}

app.get('/', async (req, res) => {
    const result = await getEdcData();
    let statusColor = result.success ? "#28a745" : "#dc3545";

    res.send(`
        <div style="font-family: sans-serif; padding: 20px; background: #f4f7f6;">
            <div style="max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h1 style="color: #2c3e50; border-left: 5px solid ${statusColor}; padding-left: 15px;">🛡️ 安養機構智控中心 (API 聯動版)</h1>
                
                <div style="background: ${result.success ? '#e8f5e9' : '#ffebee'}; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>💧 供水監測數據 (suid: 1541 / cuid: 128)</h3>
                    <p>連線狀態：<strong style="color: ${statusColor}">${result.success ? '已連線' : '連線失敗'}</strong></p>
                    <div style="background: #000; color: #0f0; padding: 15px; border-radius: 5px; overflow-x: auto;">
                        <code>${result.data || result.msg}</code>
                    </div>
                    <p style="font-size: 0.8em; color: #666;">※ 數據格式：時間戳,數值 (換行分隔) [cite: 173]</p>
                    <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer; background: #2c3e50; color: white; border: none; border-radius: 5px;">🔄 立即刷新</button>
                </div>

                <h3>📋 個案紀錄審核</h3>
                <table border="1" style="width: 100%; border-collapse: collapse; text-align: left;">
                    <tr style="background: #eee;">
                        <th style="padding: 10px;">床號</th><th style="padding: 10px;">姓名</th><th style="padding: 10px;">狀態</th>
                    </tr>
                    <tr><td style="padding: 10px;">A01</td><td style="padding: 10px;">王*同</td><td>待審核</td></tr>
                </table>
            </div>
        </div>
    `);
});

app.listen(port, () => console.log(`系統啟動於埠號 ${port}`));
