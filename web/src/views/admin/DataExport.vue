<template>
  <div class="export-container">
    <div class="export-card">
      <h3 class="export-title">数据导出</h3>
      
      <div class="export-section">
        <h4 class="section-title">📦 完整数据导出（JSON）</h4>
        <p class="section-desc">导出所有数据，包括菜单、卡片、广告、友链和设置</p>
        <button @click="exportJSON" class="btn btn-primary" :disabled="exporting">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
          </svg>
          {{ exporting ? '导出中...' : '导出 JSON' }}
        </button>
      </div>
      
      <div class="export-section">
        <h4 class="section-title">📊 CSV格式导出</h4>
        <p class="section-desc">导出单独的数据表格，可用Excel打开</p>
        <div class="export-buttons">
          <button @click="handleExportCards" class="btn btn-secondary" :disabled="exporting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
            导出卡片
          </button>
          <button @click="handleExportMenus" class="btn btn-secondary" :disabled="exporting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            导出菜单
          </button>
          <button @click="handleExportFriends" class="btn btn-secondary" :disabled="exporting">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            导出友链
          </button>
        </div>
      </div>
      
      <div v-if="message" :class="['message', messageType]">
        {{ message }}
      </div>
    </div>
    
    <div class="export-info">
      <h4>💡 导出说明</h4>
      <ul>
        <li><strong>JSON格式：</strong>包含所有数据，可用于备份和恢复</li>
        <li><strong>CSV格式：</strong>可用Excel或其他表格软件打开编辑</li>
        <li><strong>数据安全：</strong>导出数据不包含密码等敏感信息</li>
        <li><strong>建议定期备份：</strong>至少每月导出一次完整数据</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import {
  exportDataJSON,
  exportCardsCSV as apiExportCardsCSV,
  exportMenusCSV as apiExportMenusCSV,
  exportFriendsCSV as apiExportFriendsCSV
} from '../../api';

const exporting = ref(false);
const message = ref('');
const messageType = ref('success');

async function exportJSON() {
  exporting.value = true;
  message.value = '';
  
  try {
    const res = await exportDataJSON();
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    downloadBlob(blob, `nav-export-${Date.now()}.json`);
    showMessage('JSON数据导出成功', 'success');
  } catch (error) {
    console.error('导出失败:', error);
    showMessage(error.response?.data?.message || '导出失败', 'error');
  } finally {
    exporting.value = false;
  }
}

async function handleExportCards() {
  await exportCSV(apiExportCardsCSV, 'cards');
}

async function handleExportMenus() {
  await exportCSV(apiExportMenusCSV, 'menus');
}

async function handleExportFriends() {
  await exportCSV(apiExportFriendsCSV, 'friends');
}

async function exportCSV(exportFunc, name) {
  exporting.value = true;
  message.value = '';
  
  try {
    const res = await exportFunc();
    downloadBlob(res.data, `${name}-export-${Date.now()}.csv`);
    showMessage(`${name}数据导出成功`, 'success');
  } catch (error) {
    console.error('导出失败:', error);
    showMessage(error.response?.data?.message || '导出失败', 'error');
  } finally {
    exporting.value = false;
  }
}

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function showMessage(msg, type = 'success') {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}
</script>

<style scoped>
.export-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.export-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  margin-bottom: 24px;
}

.export-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.export-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.export-section:last-of-type {
  margin-bottom: 0;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.section-desc {
  color: #666;
  font-size: 14px;
  margin: 0 0 16px 0;
}

.export-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: #2566d8;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #174ea6;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #10b981;
  color: #fff;
}

.btn-secondary:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 16px;
}

.message.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.export-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #10b981;
}

.export-info h4 {
  margin: 0 0 16px 0;
  color: #222;
  font-size: 1.1rem;
}

.export-info ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.export-info li {
  margin-bottom: 12px;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  padding-left: 20px;
}

.export-info li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

@media (max-width: 768px) {
  .export-container {
    padding: 16px;
  }
  
  .export-card {
    padding: 20px;
  }
  
  .export-buttons {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>