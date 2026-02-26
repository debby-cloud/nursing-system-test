const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const HOST_IP = "60.251.229.32";
const LOGIN_URL = `http://${HOST_IP}/login`;
const SYSTEM_URL = `http://${HOST_IP}/systemcfg`;

async function getEdcData() {
    try {
        // 1. 嘗試登入 [cite: 101-104]
        const loginRes = await axios.post(LOGIN_URL, {
            username: "admin",
            password: "admin"
        }, { timeout: 3000 }); // 設定 3 秒超時

        // 檢查登入回傳結構 [cite: 112-115]
        if (!loginRes.data || loginRes.data.code !== 0) {
            return { success: false, msg: "登入失敗：帳號密碼錯誤或設備拒絕連線" };
        }

        const token = loginRes.data.data;

        // 2. 獲取數據 [cite: 149-152]
        const dataRes = await axios.post(SYSTEM_URL, {
            request: "getLocalDatas",
            value: {
                suid: "1541", 
                cuid: "128",  
                startTime: String(Date.now() - 3600000), 
                endTime: "0"
            },
            token: token
        }, { timeout: 3000 });

        // 檢查數據回傳 [cite: 171-173]
        if (dataRes.data && dataRes.data.data) {
            return { success: true, data: dataRes.data.data };
        } else {
            return { success: false, msg: "連線成功但無數據回傳" };
        }

    } catch (error) {
        // 當設備沒開機，會進入這裡
        return { success: false, msg: "設備連線失敗：請檢查硬體是否開機及網路設定 (" + error.message + ")" };
    }
}

app.get('/', async (req, res) => {
    const result = await getEdcData();
    const statusColor = result.success ? "#28a745" : "#dc3545";
    const displayData = result.success ? result.data : result.msg;

    res.send(`
        <div style="font-family: sans-serif; padding: 20px; background: #f4f7f6; min-height: 100vh;">
            <div style="max-width: 800px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #2c3e50;">🛡️ 安養機構智控中心</h1>
                
                <div style="background: ${result.success ? '#e8f5e9' : '#ffebee'}; padding: 20px; border-radius: 8px; border-left: 5px solid ${statusColor}; margin: 20px 0;">
                    <h3 style="margin-top:0;">💧 供水設施狀態</h3>
                    <p>目標 IP: <code>${HOST_IP}</code></p>
                    <div style="background: #000; color: #0f0; padding: 15px; border-radius: 5px; font-family: monospace; white-space: pre-wrap;">${displayData}</div>
                    <br>
                    <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer; background: ${statusColor}; color: white; border: none; border-radius: 4px;">🔄 重新嘗試連線</button>
                </div>

                <h3>📋 測試數據 (28床模擬)</h3>
                <p style="color: #666;">系統已準備就緒，等待硬體數據匯入...</p>
            </div>
        </div>
    `);
});

app.listen(port, () => console.log(`Server is running` || "啟動成功"));
