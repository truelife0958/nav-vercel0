<template>
  <div class="stats-container">
    <div class="stats-overview">
      <div class="stat-card">
        <div class="stat-icon total">📊</div>
        <div class="stat-info">
          <div class="stat-label">总点击量</div>
          <div class="stat-value">{{ overview.totalClicks || 0 }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon today">📅</div>
        <div class="stat-info">
          <div class="stat-label">今日点击</div>
          <div class="stat-value">{{ overview.todayClicks || 0 }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon week">📈</div>
        <div class="stat-info">
          <div class="stat-label">本周点击</div>
          <div class="stat-value">{{ overview.weekClicks || 0 }}</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon month">📆</div>
        <div class="stat-info">
          <div class="stat-label">本月点击</div>
          <div class="stat-value">{{ overview.monthClicks || 0 }}</div>
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <div class="section-header">
        <h3 class="section-title">🔥 热门网站TOP 10</h3>
        <button @click="loadOverview" class="btn btn-refresh">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新
        </button>
      </div>
      
      <div class="top-cards">
        <div v-for="(card, index) in overview.topCards" :key="index" class="top-card-item">
          <div class="rank" :class="getRankClass(index)">{{ index + 1 }}</div>
          <div class="card-info">
            <div class="card-title">{{ card.title }}</div>
            <div class="card-url">{{ card.url }}</div>
          </div>
          <div class="card-clicks">
            <span class="clicks-count">{{ card.click_count }}</span>
            <span class="clicks-label">次</span>
          </div>
        </div>
        
        <div v-if="!overview.topCards || overview.topCards.length === 0" class="no-data">
          暂无统计数据
        </div>
      </div>
    </div>
    
    <div class="stats-section">
      <h3 class="section-title">📊 最近7天点击趋势</h3>
      <div class="trend-chart">
        <div v-for="day in overview.dailyTrend" :key="day.date" class="trend-bar">
          <div class="bar-container">
            <div 
              class="bar-fill" 
              :style="{ height: getBarHeight(day.clicks) + '%' }"
              :title="`${day.clicks}次点击`"
            ></div>
          </div>
          <div class="bar-label">{{ formatDate(day.date) }}</div>
          <div class="bar-value">{{ day.clicks }}</div>
        </div>
        
        <div v-if="!overview.dailyTrend || overview.dailyTrend.length === 0" class="no-data">
          暂无趋势数据
        </div>
      </div>
    </div>
    
    <div class="stats-actions">
      <button @click="clearStatsConfirm" class="btn btn-danger">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
        </svg>
        清空统计数据
      </button>
    </div>
    
    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getStatsOverview, clearStats } from '../../api';

const overview = ref({
  totalClicks: 0,
  todayClicks: 0,
  weekClicks: 0,
  monthClicks: 0,
  topCards: [],
  dailyTrend: []
});

const message = ref('');
const messageType = ref('success');

onMounted(() => {
  loadOverview();
});

async function loadOverview() {
  try {
    const res = await getStatsOverview();
    overview.value = res.data;
  } catch (error) {
    console.error('加载统计数据失败:', error);
    showMessage('加载统计数据失败', 'error');
  }
}

function getRankClass(index) {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return 'bronze';
  return '';
}

function getBarHeight(clicks) {
  if (!overview.value.dailyTrend || overview.value.dailyTrend.length === 0) return 0;
  const maxClicks = Math.max(...overview.value.dailyTrend.map(d => d.clicks), 1);
  return Math.max((clicks / maxClicks) * 100, 5);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function clearStatsConfirm() {
  if (confirm('确定要清空所有统计数据吗？此操作不可恢复！')) {
    clearStatsData();
  }
}

async function clearStatsData() {
  try {
    await clearStats();
    showMessage('统计数据已清空', 'success');
    loadOverview();
  } catch (error) {
    console.error('清空统计数据失败:', error);
    showMessage('清空统计数据失败', 'error');
  }
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
.stats-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-icon.today { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-icon.week { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-icon.month { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #222;
}

.stats-section {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #222;
  margin: 0;
}

.btn-refresh {
  background: #f0f0f0;
  color: #333;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #e0e0e0;
}

.top-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-card-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.2s;
}

.top-card-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.rank {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 18px;
  background: #e0e0e0;
  color: #666;
}

.rank.gold {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(255, 215, 0, 0.5);
}

.rank.silver {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(192, 192, 192, 0.5);
}

.rank.bronze {
  background: linear-gradient(135deg, #cd7f32 0%, #e9a76b 100%);
  color: #fff;
  box-shadow: 0 2px 8px rgba(205, 127, 50, 0.5);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-weight: 600;
  color: #222;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-url {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-clicks {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.clicks-count {
  font-size: 24px;
  font-weight: 700;
  color: #2566d8;
}

.clicks-label {
  font-size: 14px;
  color: #666;
}

.trend-chart {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  height: 200px;
  padding: 20px 0;
}

.trend-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.bar-container {
  width: 100%;
  height: 140px;
  display: flex;
  align-items: flex-end;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px 4px 0 0;
  transition: all 0.3s;
  cursor: pointer;
}

.bar-fill:hover {
  opacity: 0.8;
}

.bar-label {
  font-size: 12px;
  color: #666;
}

.bar-value {
  font-size: 14px;
  font-weight: 600;
  color: #222;
}

.stats-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.btn-danger {
  background: #ef4444;
  color: #fff;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.no-data {
  text-align: center;
  color: #999;
  padding: 40px;
  font-size: 14px;
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

@media (max-width: 1024px) {
  .stats-overview {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-container {
    padding: 16px;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .trend-chart {
    height: 160px;
  }
  
  .bar-container {
    height: 100px;
  }
}
</style>