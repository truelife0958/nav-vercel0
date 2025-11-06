import axios from 'axios';
const BASE = '/api';

export const login = (username, password) => axios.post(`${BASE}/login`, { username, password });

function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// 菜单相关API
export const getMenus = () => axios.get(`${BASE}/menus`);
export const addMenu = (data) => axios.post(`${BASE}/menus`, data, { headers: authHeaders() });
export const updateMenu = (id, data) => axios.put(`${BASE}/menus/${id}`, data, { headers: authHeaders() });
export const deleteMenu = (id) => axios.delete(`${BASE}/menus/${id}`, { headers: authHeaders() });

// 子菜单相关API
export const getSubMenus = (menuId) => axios.get(`${BASE}/menus/${menuId}/submenus`);
export const addSubMenu = (menuId, data) => axios.post(`${BASE}/menus/${menuId}/submenus`, data, { headers: authHeaders() });
export const updateSubMenu = (id, data) => axios.put(`${BASE}/menus/submenus/${id}`, data, { headers: authHeaders() });
export const deleteSubMenu = (id) => axios.delete(`${BASE}/menus/submenus/${id}`, { headers: authHeaders() });
export const batchDeleteSubMenus = (ids) => axios.post(`${BASE}/menus/submenus/batch-delete`, { ids }, { headers: authHeaders() });
export const batchMoveSubMenus = (ids, targetParentId) => axios.post(`${BASE}/menus/submenus/batch-move`, { ids, targetParentId }, { headers: authHeaders() });

// 卡片相关API
export const getCards = (menuId, subMenuId = null) => {
  const params = subMenuId ? { subMenuId } : {};
  return axios.get(`${BASE}/cards/${menuId}`, { params });
};
export const addCard = (data) => axios.post(`${BASE}/cards`, data, { headers: authHeaders() });
export const updateCard = (id, data) => axios.put(`${BASE}/cards/${id}`, data, { headers: authHeaders() });
export const deleteCard = (id) => axios.delete(`${BASE}/cards/${id}`, { headers: authHeaders() });
export const batchDeleteCards = (ids) => axios.post(`${BASE}/cards/batch-delete`, { ids }, { headers: authHeaders() });
export const batchMoveCards = (ids, targetMenuId, targetSubMenuId = null) => axios.post(`${BASE}/cards/batch-move`, { ids, targetMenuId, targetSubMenuId }, { headers: authHeaders() });
export const batchImportCardsJSON = (cards, menuId, subMenuId = null) => axios.post(`${BASE}/cards/batch-import-json`, { cards, menuId, subMenuId }, { headers: authHeaders() });
export const batchImportCardsTXT = (content, menuId, subMenuId = null) => axios.post(`${BASE}/cards/batch-import-txt`, { content, menuId, subMenuId }, { headers: authHeaders() });
export const batchImportCardsHTML = (content, menuId, subMenuId = null) => axios.post(`${BASE}/cards/batch-import-html`, { content, menuId, subMenuId }, { headers: authHeaders() });

export const uploadLogo = (file) => {
  const formData = new FormData();
  formData.append('logo', file);
  return axios.post(`${BASE}/upload`, formData, { headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' } });
};

// 广告API
export const getAds = () => axios.get(`${BASE}/ads`);
export const addAd = (data) => axios.post(`${BASE}/ads`, data, { headers: authHeaders() });
export const updateAd = (id, data) => axios.put(`${BASE}/ads/${id}`, data, { headers: authHeaders() });
export const deleteAd = (id) => axios.delete(`${BASE}/ads/${id}`, { headers: authHeaders() });

// 友链API
export const getFriends = () => axios.get(`${BASE}/friends`);
export const addFriend = (data) => axios.post(`${BASE}/friends`, data, { headers: authHeaders() });
export const updateFriend = (id, data) => axios.put(`${BASE}/friends/${id}`, data, { headers: authHeaders() });
export const deleteFriend = (id) => axios.delete(`${BASE}/friends/${id}`, { headers: authHeaders() });

// 用户API
export const getUserProfile = () => axios.get(`${BASE}/users/profile`, { headers: authHeaders() });
export const changePassword = (oldPassword, newPassword) => axios.put(`${BASE}/users/password`, { oldPassword, newPassword }, { headers: authHeaders() });
export const getUsers = () => axios.get(`${BASE}/users`, { headers: authHeaders() });

// 网站设置API
export const getSettings = () => axios.get(`${BASE}/settings`);
export const getSetting = (key) => axios.get(`${BASE}/settings/${key}`);
export const updateSettings = (settings) => axios.put(`${BASE}/settings`, settings, { headers: authHeaders() });
export const updateSetting = (key, value, description) => axios.put(`${BASE}/settings/${key}`, { value, description }, { headers: authHeaders() });
export const deleteSetting = (key) => axios.delete(`${BASE}/settings/${key}`, { headers: authHeaders() });

// 数据导出API
export const exportDataJSON = () => axios.get(`${BASE}/export/json`, { headers: authHeaders() });
export const exportCardsCSV = () => axios.get(`${BASE}/export/csv/cards`, { headers: authHeaders(), responseType: 'blob' });
export const exportMenusCSV = () => axios.get(`${BASE}/export/csv/menus`, { headers: authHeaders(), responseType: 'blob' });
export const exportFriendsCSV = () => axios.get(`${BASE}/export/csv/friends`, { headers: authHeaders(), responseType: 'blob' });

// 统计API
export const recordClick = (cardId) => axios.post(`${BASE}/stats/click/${cardId}`);
export const getPopularCards = (limit = 10, days = 30) => axios.get(`${BASE}/stats/popular`, { params: { limit, days } });
export const getStatsOverview = () => axios.get(`${BASE}/stats/overview`, { headers: authHeaders() });
export const getCardStats = (cardId) => axios.get(`${BASE}/stats/card/${cardId}`, { headers: authHeaders() });
export const clearStats = () => axios.delete(`${BASE}/stats/clear`, { headers: authHeaders() });