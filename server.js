const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

const EDC_URL = "http://60.251.229.32/cgi-bin/get_local_data.cgi";

app.get('/', async (req, res) => {
    let waterData = null;
    let statusColor = "#28a745"; // 預設綠色 (正常)
    let errorMsg = "";

    try {
        const response = await axios.get(EDC_URL, { timeout: 3000 });
        waterData = response.data;
    } catch (error) {
        statusColor = "#dc3545"; // 失敗變紅色
        errorMsg = "⚠️ 設備連線中斷 (請檢查設備開機狀態或網路設定)";
    }

    res.send(`
        <div style="font-family: 'Microsoft JhengHei', sans-serif; background: #f4f7f6; min-height: 100vh; padding: 20px;">
            <div style="max-width: 900px; margin: auto; background: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h1 style="color: #2c3e50; border-bottom: 2px solid ${statusColor}; padding-bottom: 10px;">🛡️ 安養機構智控中心</h1>
                
                <div style="display: flex; gap: 20px; margin-top: 20px;">
                    <div style="flex: 1; background: ${waterData ? '#e8f5e9' : '#ffebee'}; padding: 20px; border-radius: 8px; border-left: 5px solid ${statusColor};">
                        <h3 style="margin-top:0;">💧 供水系統監測</h3>
                        <p>設備 IP: <code>60.251.229.32</code></p>
                        <div style="font-size: 1.2em; font-weight: bold; color: ${statusColor};">
                            ${waterData ? '✅ 數據接收中' : errorMsg}
                        </div>
                        <pre style="background: rgba(0,0,0,0.05); padding: 10px; border-radius: 4px; font-size: 0.8em;">${waterData ? JSON.stringify(waterData, null, 2) : '等待硬體訊號...'}</pre>
                        <button onclick="location.reload()" style="background: ${statusColor}; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer;">立即刷新</button>
                    </div>

                    <div style="width: 250px; background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 5px solid #2196f3;">
                        <h3 style="margin-top:0;">📊 今日概況</h3>
                        <p>總床位：28 床</p>
                        <p>待審核：<span style="color: #f39c12; font-weight:bold;">5 筆</span></p>
                        <p>水質異常：<span style="color: ${waterData ? '#28a745' : '#dc3545'}; font-weight:bold;">${waterData ? '0' : '--'}</span></p>
                    </div>
                </div>

                <h3 style="margin-top: 40px; color: #34495e;">📋 個案紀錄審核流水線 (2026/02/20)</h3>
                <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                    <thead>
                        <tr style="background: #34495e; color: white; text-align: left;">
                            <th style="padding: 12px;">床號</th><th style="padding: 12px;">個案姓名</th><th style="padding: 12px;">當前狀態</th><th style="padding: 12px;">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 12px;">A01</td><td style="padding: 12px;">王*同</td>
                            <td style="padding: 12px;"><span style="background: #fff3e0; color: #e65100; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">待初審</span></td>
                            <td style="padding: 12px;"><button style="cursor:pointer;">開啟紀錄</button></td>
                        </tr>
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 12px;">A02</td><td style="padding: 12px;">李*華</td>
                            <td style="padding: 12px;"><span style="background: #e8f5e9; color: #2e7d32; padding: 4px 8px; border-radius: 4px; font-size: 0.9em;">已完成</span></td>
                            <td style="padding: 12px;"><button style="cursor:pointer;">查看</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `);
});

app.listen(port, () => console.log(`Server started on port ${port}`));

