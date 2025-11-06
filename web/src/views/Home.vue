<template>
  <div class="home-container">
    <!-- 主菜单横向滚动区域 -->
    <div class="main-menu-scroll-container">
      <div class="main-menu-scroll-wrapper">
        <button
          v-for="menu in menus"
          :key="menu.id"
          @click="selectMenu(menu)"
          :class="['main-menu-btn', {active: menu.id === activeMenu?.id}]"
        >
          {{ menu.name }}
        </button>
      </div>
    </div>
    
    <div class="search-section">
      <div class="search-box-wrapper">
        <div class="search-engine-select">
          <button v-for="engine in searchEngines" :key="engine.name"
            :class="['engine-btn', {active: selectedEngine.name === engine.name}]"
            @click="selectEngine(engine)"
          >
            {{ engine.label }}
          </button>
        </div>
        <div class="search-container">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="selectedEngine.placeholder"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button v-if="searchQuery" class="clear-btn" @click="clearSearch" aria-label="清空" title="clear">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
          <button @click="handleSearch" class="search-btn" title="search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- 子菜单横向滚动区域 -->
      <div v-if="activeMenu?.subMenus && activeMenu.subMenus.length > 0" class="submenu-scroll-container">
        <div class="submenu-scroll-wrapper">
          <button
            v-for="subMenu in activeMenu.subMenus"
            :key="subMenu.id"
            @click="selectSubMenu(subMenu)"
            :class="['submenu-btn', {active: subMenu.id === activeSubMenu?.id}]"
          >
            {{ subMenu.name }}
          </button>
        </div>
      </div>
      
      <!-- 分割线 -->
      <div v-if="activeMenu?.subMenus && activeMenu.subMenus.length > 0" class="divider"></div>
    </div>
    
    <!-- 左侧广告条 -->
    <div v-if="leftAds.length" class="ad-space-fixed left-ad-fixed">
      <a v-for="ad in leftAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    <!-- 右侧广告条 -->
    <div v-if="rightAds.length" class="ad-space-fixed right-ad-fixed">
      <a v-for="ad in rightAds" :key="ad.id" :href="ad.url" target="_blank">
        <img :src="ad.img" alt="广告" />
      </a>
    </div>
    
    <CardGrid :cards="filteredCards" @reorder="handleCardReorder"/>
    
    <footer class="footer">
      <div class="footer-content">
        <button @click="showFriendLinks = true" class="friend-link-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          友情链接
        </button>
        <a v-if="siteSettings.show_admin_entry === 'true'" href="/admin" class="footer-btn" title="管理后台">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"></path>
          </svg>
          管理后台
        </a>
        <a v-if="siteSettings.show_github_link === 'true'" :href="siteSettings.github_url" target="_blank" class="footer-btn" title="GitHub">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </a>
        <p class="copyright">{{ siteSettings.footer_text }}</p>
      </div>
    </footer>

    <!-- 友情链接弹窗 -->
    <div v-if="showFriendLinks" class="modal-overlay" @click="showFriendLinks = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>友情链接</h3>
          <button @click="showFriendLinks = false" class="close-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="friend-links-grid">
            <a 
              v-for="friend in friendLinks" 
              :key="friend.id" 
              :href="friend.url" 
              target="_blank" 
              class="friend-link-card"
            >
              <div class="friend-link-logo">
                <img 
                  v-if="friend.logo" 
                  :src="friend.logo" 
                  :alt="friend.title"
                  @error="handleLogoError"
                />
                <div v-else class="friend-link-placeholder">
                  {{ friend.title.charAt(0) }}
                </div>
              </div>
              <div class="friend-link-info">
                <h4>{{ friend.title }}</h4>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getMenus, getCards, getAds, getFriends, getSettings } from '../api';
import CardGrid from '../components/CardGrid.vue';

const menus = ref([]);
const activeMenu = ref(null);
const activeSubMenu = ref(null);
const cards = ref([]);
const searchQuery = ref('');
const leftAds = ref([]);
const rightAds = ref([]);
const showFriendLinks = ref(false);
const friendLinks = ref([]);
const siteSettings = ref({
  site_title: 'Nav-Item 导航站',
  site_subtitle: '您的专属导航',
  footer_text: 'Copyright © 2025 Nav-Item',
  github_url: 'https://github.com/eooce/Nav-Item',
  show_admin_entry: 'true',
  show_github_link: 'true'
});

// 聚合搜索配置
const searchEngines = [
  {
    name: 'google',
    label: 'Google',
    placeholder: 'Google 搜索...',
    url: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`
  },
  {
    name: 'baidu',
    label: '百度',
    placeholder: '百度搜索...',
    url: q => `https://www.baidu.com/s?wd=${encodeURIComponent(q)}`
  },
  {
    name: 'bing',
    label: 'Bing',
    placeholder: 'Bing 搜索...',
    url: q => `https://www.bing.com/search?q=${encodeURIComponent(q)}`
  },
  {
    name: 'github',
    label: 'github',
    placeholder: 'GitHub 搜索...',
    url: q => `https://github.com/search?q=${encodeURIComponent(q)}&type=repositories`
  },
  {
    name: 'site',
    label: '站内',
    placeholder: '站内搜索...',
    url: q => `/search?query=${encodeURIComponent(q)}`
  }
];
const selectedEngine = ref(searchEngines[0]);

function selectEngine(engine) {
  selectedEngine.value = engine;
}

function clearSearch() {
  searchQuery.value = '';
}

const filteredCards = computed(() => {
  if (!searchQuery.value) return cards.value;
  return cards.value.filter(card => 
    card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

onMounted(async () => {
  // 加载网站设置
  try {
    const settingsRes = await getSettings();
    if (settingsRes.data && settingsRes.data.data) {
      Object.assign(siteSettings.value, settingsRes.data.data);
      // 更新页面标题
      if (siteSettings.value.site_title) {
        document.title = siteSettings.value.site_title;
      }
    }
  } catch (error) {
    console.error('加载网站设置失败:', error);
  }
  
  const res = await getMenus();
  menus.value = res.data;
  if (menus.value.length) {
    activeMenu.value = menus.value[0];
    loadCards();
  }
  // 加载广告
  const adRes = await getAds();
  leftAds.value = adRes.data.filter(ad => ad.position === 'left');
  rightAds.value = adRes.data.filter(ad => ad.position === 'right');
  
  const friendRes = await getFriends();
  friendLinks.value = friendRes.data;
});

async function selectMenu(menu) {
  activeMenu.value = menu;
  activeSubMenu.value = null;
  loadCards();
}

async function selectSubMenu(subMenu) {
  activeSubMenu.value = subMenu;
  loadCards();
}

async function loadCards() {
  if (!activeMenu.value) return;
  const res = await getCards(activeMenu.value.id, activeSubMenu.value?.id);
  cards.value = res.data;
}

async function handleSearch() {
  if (!searchQuery.value.trim()) return;
  if (selectedEngine.value.name === 'site') {
    // 站内搜索：遍历所有菜单，查找所有卡片
    let found = false;
    for (const menu of menus.value) {
      const res = await getCards(menu.id);
      const match = res.data.find(card =>
        card.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        card.url.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
      if (match) {
        activeMenu.value = menu;
        cards.value = res.data;
        setTimeout(() => {
          const el = document.querySelector(`[data-card-id='${match.id}']`);
          if (el) el.scrollIntoView({behavior: 'smooth', block: 'center'});
        }, 100);
        found = true;
        break;
      }
    }
    if (!found) {
      alert('未找到相关内容');
    }
  } else {
    const url = selectedEngine.value.url(searchQuery.value);
    window.open(url, '_blank');
  }
}

function handleLogoError(event) {
  event.target.style.display = 'none';
  event.target.nextElementSibling.style.display = 'flex';
}

// 处理卡片重新排序（仅在前端更新，不保存到数据库）
function handleCardReorder(newCards) {
  cards.value = newCards;
}
</script>

<style scoped>
/* 主菜单横向滚动样式 - 毛玻璃效果 */
.main-menu-scroll-container {
  position: fixed;
  top: 0.6rem;
  left: 0;
  width: 100vw;
  z-index: 100;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
  padding: 0.5rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.main-menu-scroll-wrapper {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  max-width: 1400px;
  margin: 0 auto;
}

.main-menu-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.main-menu-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.main-menu-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.main-menu-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.main-menu-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  padding: 0.6rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.main-menu-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(57, 157, 255, 0.6);
  color: #66b3ff;
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(57, 157, 255, 0.3);
}

.main-menu-btn.active {
  background: rgba(57, 157, 255, 0.35);
  backdrop-filter: blur(15px) saturate(200%);
  border-color: rgba(102, 179, 255, 0.8);
  color: #fff;
  box-shadow: 0 8px 24px rgba(57, 157, 255, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

.search-engine-select {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: .3rem;
  gap: 5px;
  z-index: 2;
}
.engine-btn {
  border: none;
  background: none;
  color: #ffffff;
  font-size: .8rem ;
  padding: 2px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}
.engine-btn.active, .engine-btn:hover {
  color: #399dff;
  background: #ffffff1a;
}

.search-container {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  padding: 0.3rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  max-width: 480px;
  width: 92%;
  position: relative;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: .1rem .5rem;
  font-size: 1.2rem;
  color: #ffffff;
  outline: none;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  margin-right: 0.2rem;
  display: flex;
  align-items: center;
  padding: 0;
}

.search-btn {
  background: #e9e9eb00;
  color: #ffffff;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  margin-right: 0.1rem;
}

.search-btn:hover {
  background: #3367d6;
}

.home-container {
  min-height: 95vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-top: 50px;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.home-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.search-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.8rem 0 1rem 0;
  position: relative;
  z-index: 2;
}

/* 子菜单横向滚动样式 */
.submenu-scroll-container {
  width: 100%;
  max-width: 55rem;
  margin-top: 1.5rem;
  overflow: hidden;
  position: relative;
}

.submenu-scroll-wrapper {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  overflow-x: auto;
  overflow-y: hidden;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.submenu-scroll-wrapper::-webkit-scrollbar {
  height: 6px;
}

.submenu-scroll-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.submenu-scroll-wrapper::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.submenu-scroll-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.submenu-btn {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.submenu-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(57, 157, 255, 0.6);
  color: #66b3ff;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(57, 157, 255, 0.25);
}

.submenu-btn.active {
  background: rgba(57, 157, 255, 0.3);
  backdrop-filter: blur(15px) saturate(200%);
  border-color: rgba(102, 179, 255, 0.7);
  color: #fff;
  box-shadow: 0 6px 20px rgba(57, 157, 255, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2);
}

/* 分割线样式 */
.divider {
  width: 100%;
  max-width: 55rem;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3) 20%,
    rgba(255, 255, 255, 0.3) 80%,
    transparent
  );
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.search-box-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 480px;
}

.content-wrapper {
  display: flex;
  max-width: 1400px;
  margin: 0 auto;
  gap: 2rem;
  position: relative;
  z-index: 2;
  flex: 1;
  justify-content: space-between;
}

.main-content {
  flex: 1;
  min-width: 0;
}

.ad-space {
  width: 90px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.ad-space a {
  width: 100%;
  display: block;
}
.ad-space img {
  width: 100%;
  max-width: 90px;
  max-height: 160px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  background: #fff;
  object-fit: contain;
  margin: 0 auto;
}

.ad-placeholder {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  padding: 2rem 1rem;
  text-align: center;
  font-size: 14px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer {
  margin-top: auto;
  text-align: center;
  padding-top: 1rem;
  padding-bottom: 2rem;
  position: relative;
  z-index: 2;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.friend-link-btn,
.footer-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  padding: 0;
  text-decoration: none;
}

.friend-link-btn:hover,
.footer-btn:hover {
  color: #399dff;
  transform: translateY(-1px);
}

/* 弹窗样式 */
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
  backdrop-filter: blur(5px);
}

.modal-content {
  background: #8585859c;
  border-radius: 16px;
  width: 55rem;
  height: 30rem;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #d3d6d8;
}

.modal-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  color: #6b7280;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #cf1313;
}

.modal-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
}

.friend-links-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
}
@media (max-width: 768px) {
  .friend-links-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .container {
    width: 95%;
  }
}

.friend-link-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px;
  background: #cfd3d661;
  border-radius: 15px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
  border: 1px solid #cfd3d661;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
}

.friend-link-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  background: #ffffff8e;
}

.friend-link-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.friend-link-logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.friend-link-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
}

.friend-link-info h4 {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  text-align: center;
  line-height: 1.3;
  word-break: break-all;
}

.copyright {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

:deep(.card-grid) {
  position: relative;
  z-index: 2;
}

.ad-space-fixed {
  position: fixed;
  top: 13rem;
  z-index: 10;
  width: 90px;
  min-width: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 0;
  background: transparent;
  margin: 0;
}
.left-ad-fixed {
  left: 0;
}
.right-ad-fixed {
  right: 0;
}
.ad-space-fixed a {
  width: 100%;
  display: block;
}
.ad-space-fixed img {
  width: 100%;
  max-width: 90px;
  max-height: 160px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
  background: #fff;
  margin: 0 auto;
}

@media (max-width: 1200px) {
  .content-wrapper {
    flex-direction: column;
    gap: 1rem;
  }
  
  .ad-space {
    width: 100%;
    height: 100px;
  }
  
  .ad-placeholder {
    height: 80px;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding-top: 80px;
  }
  
  .content-wrapper {
    gap: 0.5rem;
  }
  
  .ad-space {
    height: 60px;
  }
  
  .ad-placeholder {
    height: 50px;
    font-size: 12px;
    padding: 1rem 0.5rem;
  }
  .footer {
    padding-top: 2rem;
  }
  
  .friend-link-btn,
  .footer-btn {
    font-size: 0.7rem;
  }
  .copyright {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.7rem;
    margin: 0;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }
  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }
  
  .submenu-scroll-container {
    max-width: 95vw;
  }
  
  .submenu-btn {
    font-size: 12px;
    padding: 0.4rem 1rem;
  }
  
  .main-menu-btn {
    font-size: 13px;
    padding: 0.5rem 1.2rem;
  }
  
  .footer-content {
    gap: 15px;
  }
}
</style> 