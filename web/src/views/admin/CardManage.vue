<template>
  <div class="card-manage">
    <div class="card-header">
      <div class="header-content">
        <h2 class="page-title">管理网站导航卡片，支持主菜单和子菜单分类</h2>
      </div>
      <div class="card-add">
        <select v-model="selectedMenuId" class="input narrow" @change="onMenuChange">
          <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
        </select>
        <select v-model="selectedSubMenuId" class="input narrow" @change="onSubMenuChange">
          <option value="">主菜单</option>
          <option v-for="subMenu in currentSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
        </select>
        <input v-model="newCardTitle" placeholder="卡片标题" class="input narrow" />
        <input v-model="newCardUrl" placeholder="卡片链接" class="input wide" />
        <input v-model="newCardLogo" placeholder="logo链接(可选)" class="input wide" />
        <button class="btn" @click="addCard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          添加卡片
        </button>
        <button class="btn btn-secondary" @click="showBatchImport = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          批量导入
        </button>
      </div>
    </div>
    <div class="card-card">
      <table class="card-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>网址</th>
            <th>Logo链接</th>
            <th>描述</th>
            <th>排序</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="card in cards" :key="card.id">
            <td><input v-model="card.title" @blur="updateCard(card)" class="table-input" /></td>
            <td><input v-model="card.url" @blur="updateCard(card)" class="table-input" /></td>
            <td><input v-model="card.logo_url" @blur="updateCard(card)" class="table-input" placeholder="logo链接(可选)" /></td>
            <td><input v-model="card.desc" @blur="updateCard(card)" class="table-input" placeholder="描述（可选）" /></td>
            <td><input v-model.number="card.order" type="number" @blur="updateCard(card)" class="table-input order-input" /></td>
            <td>
              <button class="btn btn-danger btn-icon" @click="deleteCard(card.id)" title="删除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                  <path d="M10 11v6M14 11v6"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  
  <!-- 批量导入弹窗 -->
  <div v-if="showBatchImport" class="modal-overlay" @click="showBatchImport = false">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>批量导入卡片</h3>
        <button @click="showBatchImport = false" class="close-btn">×</button>
      </div>
      <div class="modal-body">
        <div class="import-tabs">
          <button
            v-for="tab in importTabs"
            :key="tab.value"
            @click="importType = tab.value"
            :class="['tab-btn', { active: importType === tab.value }]"
          >
            {{ tab.label }}
          </button>
        </div>
        <div class="import-content">
          <div v-if="importType === 'txt'" class="import-hint">
            格式：每行一个，用 | 分隔<br>
            示例：标题|网址|描述
          </div>
          <div v-else-if="importType === 'html'" class="import-hint">
            粘贴包含 &lt;a&gt; 标签的 HTML 代码
          </div>
          <div v-else class="import-hint">
            JSON 格式数组，每个对象包含 title, url, logo_url, description
          </div>
          <textarea
            v-model="importContent"
            class="import-textarea"
            :placeholder="getImportPlaceholder()"
          ></textarea>
          <button class="btn btn-primary" @click="handleBatchImport">
            开始导入
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import {
  getMenus,
  getCards,
  addCard as apiAddCard,
  updateCard as apiUpdateCard,
  deleteCard as apiDeleteCard,
  batchImportCardsJSON,
  batchImportCardsTXT,
  batchImportCardsHTML
} from '../../api';

const menus = ref([]);
const cards = ref([]);
const selectedMenuId = ref();
const selectedSubMenuId = ref('');
const newCardTitle = ref('');
const newCardUrl = ref('');
const newCardLogo = ref('');
const showBatchImport = ref(false);
const importType = ref('txt');
const importContent = ref('');

const importTabs = [
  { label: 'TXT格式', value: 'txt' },
  { label: 'HTML格式', value: 'html' },
  { label: 'JSON格式', value: 'json' }
];

const currentSubMenus = computed(() => {
  if (!selectedMenuId.value) return [];
  const menu = menus.value.find(m => m.id === selectedMenuId.value);
  return menu?.subMenus || [];
});

onMounted(async () => {
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    selectedMenuId.value = menus.value[0].id;
    selectedSubMenuId.value = '';
  }
});

watch(selectedMenuId, () => {
  selectedSubMenuId.value = '';
  loadCards();
});

watch(selectedSubMenuId, loadCards);

function onMenuChange() {
  selectedSubMenuId.value = '';
}

function onSubMenuChange() {
  loadCards();
}

async function loadCards() {
  if (!selectedMenuId.value) return;
  const res = await getCards(selectedMenuId.value, selectedSubMenuId.value || null);
  cards.value = res.data;
}

async function addCard() {
  if (!newCardTitle.value || !newCardUrl.value) return;
  await apiAddCard({ 
    menu_id: selectedMenuId.value, 
    sub_menu_id: selectedSubMenuId.value || null,
    title: newCardTitle.value, 
    url: newCardUrl.value, 
    logo_url: newCardLogo.value 
  });
  newCardTitle.value = '';
  newCardUrl.value = '';
  newCardLogo.value = '';
  loadCards();
}

async function updateCard(card) {
  await apiUpdateCard(card.id, {
    menu_id: selectedMenuId.value,
    sub_menu_id: selectedSubMenuId.value || null,
    title: card.title,
    url: card.url,
    logo_url: card.logo_url,
    desc: card.desc,
    order: card.order
  });
  loadCards();
}

async function deleteCard(id) {
  await apiDeleteCard(id);
  loadCards();
}

function getImportPlaceholder() {
  if (importType.value === 'txt') {
    return '标题1|https://example1.com|描述1\n标题2|https://example2.com|描述2';
  } else if (importType.value === 'html') {
    return '<a href="https://example.com">示例网站</a>';
  } else {
    return '[{"title":"示例","url":"https://example.com","description":"描述"}]';
  }
}

async function handleBatchImport() {
  if (!importContent.value.trim()) {
    alert('请输入导入内容');
    return;
  }
  
  try {
    let result;
    if (importType.value === 'txt') {
      result = await batchImportCardsTXT(
        importContent.value,
        selectedMenuId.value,
        selectedSubMenuId.value || null
      );
    } else if (importType.value === 'html') {
      result = await batchImportCardsHTML(
        importContent.value,
        selectedMenuId.value,
        selectedSubMenuId.value || null
      );
    } else {
      const cards = JSON.parse(importContent.value);
      result = await batchImportCardsJSON(
        cards,
        selectedMenuId.value,
        selectedSubMenuId.value || null
      );
    }
    
    alert(`成功导入 ${result.data.imported} 个卡片！`);
    showBatchImport.value = false;
    importContent.value = '';
    loadCards();
  } catch (err) {
    alert('导入失败：' + err.message);
  }
}
</script>

<style scoped>
.card-manage {
  max-width: 1200px;
  width: 95%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  width: 95%;
  text-align: center;
}

.header-content {
  margin-bottom: 15px;
  text-align: center;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
}



.card-add {
  margin: 0 auto;
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
}

.card-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  width: 100%;
}

.card-table {
  width: 100%;
  border-collapse: collapse;
  padding: 24px;
}

.card-table th,
.card-table td {
  padding: 8px 12px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.card-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

/* 表格列宽度设置 */
.card-table th:nth-child(1), /* 标题列 */
.card-table td:nth-child(1) {
  width: 12%;
}

.card-table th:nth-child(2), /* 网址列 */
.card-table td:nth-child(2) {
  width: 25%;
}

.card-table th:nth-child(3), /* Logo链接列 */
.card-table td:nth-child(3) {
  width: 25%;
}

.card-table th:nth-child(4), /* 描述列 */
.card-table td:nth-child(4) {
  width: 15%;
}

.card-table th:nth-child(5), /* 排序列 */
.card-table td:nth-child(5) {
  width: 8%;
}

.card-table th:nth-child(6), /* 操作列 */
.card-table td:nth-child(6) {
  width: 15%;
  text-align: center;
}

.input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

/* 窄输入框 - 主菜单、子菜单、卡片标题 */
.input.narrow {
  width: 140px;
}

/* 中等输入框 - 添加卡片按钮 */
.input.medium {
  width: 140px;
}

/* 宽输入框 - 卡片链接、logo链接 */
.input.wide {
  width: 200px;
}

/* 表格内输入框 */
.table-input {
  width: 100%;
  padding: 8px 4px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #222;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.table-input:focus {
  outline: none;
  border-color: #399dff;
  box-shadow: 0 0 0 2px rgba(57, 157, 255, 0.1);
}

.input:focus {
  outline: none;
  border-color: #399dff;
  box-shadow: 0 0 0 3px rgba(57, 157, 255, 0.1);
}

.order-input {
  width: 60px;
}

.btn {
  padding: 10px 8px;
  border: none;
  border-radius: 8px;
  background: #399dff;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  justify-content: center;
  border-radius: 6px;
}

.btn:hover {
  background: #2d7dd2;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
}

.btn-danger:hover {
  background: #dc2626;
}

@media (max-width: 768px) {
  .card-manage {
    width: 94%;
    padding: 16px;
  }
  
  .card-card {
    padding: 16px 12px;
  }
  
  .card-add {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .input.narrow,
  .input.medium,
  .input.wide {
    width: 100%;
  }
  
  .order-input {
    width: 60px;
  }
  
  /* 移动端表格列宽度调整 */
  .card-table th:nth-child(1),
  .card-table td:nth-child(1),
  .card-table th:nth-child(2),
  .card-table td:nth-child(2),
  .card-table th:nth-child(3),
  .card-table td:nth-child(3),
  .card-table th:nth-child(4),
  .card-table td:nth-child(4),
  .card-table th:nth-child(5),
  .card-table td:nth-child(5),
  .card-table th:nth-child(6),
  .card-table td:nth-child(6) {
    width: auto;
  }
}

/* 批量导入弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 600px;
  max-width: 90vw;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6b7280;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
}

.close-btn:hover {
  color: #ef4444;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.import-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.tab-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.import-hint {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
  color: #1e40af;
  border-radius: 4px;
}

.import-textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.9rem;
  margin-bottom: 16px;
  resize: vertical;
}

.import-textarea:focus {
  outline: none;
  border-color: #667eea;
}

.btn-secondary {
  background: #10b981;
}

.btn-secondary:hover {
  background: #059669;
}

.btn-primary {
  width: 100%;
  justify-content: center;
}
</style>