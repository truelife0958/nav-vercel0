<template>
  <div class="ad-manage">
    <div class="ad-settings-card">
      <h3 class="settings-title">广告设置</h3>
      <form class="ad-add-form" @submit.prevent="handleAddAd">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">广告图片链接</label>
            <input v-model="newAdImg" placeholder="https://example.com/ad.jpg" class="input" />
          </div>
          <div class="form-group">
            <label class="form-label">广告跳转链接</label>
            <input v-model="newAdUrl" placeholder="https://example.com" class="input" />
          </div>
          <div class="form-group">
            <label class="form-label">广告位置</label>
            <select v-model="newAdPos" class="input select-input">
              <option value="left">左侧广告</option>
              <option value="right">右侧广告</option>
            </select>
          </div>
        </div>
        <button class="btn btn-add" type="submit">添加广告</button>
      </form>
    </div>
    <div class="ad-section">
      <h3 class="section-title">左侧广告列表</h3>
      <div class="ad-card">
        <table class="ad-table">
          <thead><tr><th>图片</th><th>跳转链接</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="ad in leftAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="input" /></td>
              <td><button class="btn btn-danger" @click="deleteAd(ad.id)">删除广告</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="ad-section">
      <h3 class="section-title">右侧广告列表</h3>
      <div class="ad-card">
        <table class="ad-table">
          <thead><tr><th>图片</th><th>跳转链接</th><th>操作</th></tr></thead>
          <tbody>
            <tr v-for="ad in rightAds" :key="ad.id">
              <td><input v-model="ad.img" @blur="updateAd(ad)" class="input" /></td>
              <td><input v-model="ad.url" @blur="updateAd(ad)" class="input" /></td>
              <td><button class="btn btn-danger" @click="deleteAd(ad.id)">删除广告</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getAds, addAd as apiAddAd, updateAd as apiUpdateAd, deleteAd as apiDeleteAd } from '../../api';

const leftAds = ref([]);
const rightAds = ref([]);
const newAdImg = ref('');
const newAdUrl = ref('');
const newAdPos = ref('left');

onMounted(loadAds);

async function loadAds() {
  const res = await getAds();
  // API 直接返回数组，不是 {data: []}
  const ads = Array.isArray(res) ? res : (res.data || []);
  leftAds.value = ads.filter(ad => ad.position === 'left');
  rightAds.value = ads.filter(ad => ad.position === 'right');
}
async function handleAddAd() {
  if (!newAdImg.value || !newAdUrl.value) return;
  await apiAddAd({ position: newAdPos.value, img: newAdImg.value, url: newAdUrl.value });
  newAdImg.value = '';
  newAdUrl.value = '';
  newAdPos.value = 'left';
  loadAds();
}
async function updateAd(ad) {
  await apiUpdateAd(ad.id, { img: ad.img, url: ad.url });
  loadAds();
}
async function deleteAd(id) {
  await apiDeleteAd(id);
  loadAds();
}
</script>

<style scoped>
.ad-manage {
  max-width: 1400px;
  width: 90%;
  margin: 0 auto;
}

.ad-settings-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 24px 32px;
  margin-bottom: 32px;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.ad-add-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr;
  gap: 16px;
  align-items: end;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.section-title {
  text-align: left;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 12px;
  color: #2566d8;
}
.ad-section {
  margin-bottom: 32px;
}
.ad-add {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
.ad-card {
  width: 98%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 20px 10px;
}
.input {
  padding: 12px 8px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  margin-right: 8px;
}
.input:focus {
  outline: 2px solid #2566d8;
}

.btn {
  background: #2566d8;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 10px 24px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background 0.2s;
}

.btn:hover {
  background: #174ea6;
}

.btn-add {
  align-self: flex-start;
  padding: 10px 32px;
}
.btn-danger {
  background: #e74c3c;
  display: inline-block;
  margin: 0 auto;
}
.btn-danger:hover {
  background: #c0392b;
}
.ad-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  color: #222;
  border-radius: 8px;
  overflow: hidden;
}
.ad-table th, .ad-table td {
  padding: 10px 14px;
  border: 1px solid #e3e6ef;
}
.ad-table th {
  background: #f5f7fa;
  color: #222;
  font-weight: bold;
}
.ad-table td input {
  width: 95%;
  background: #f9f9f9;
  color: #222;
  border: 1px solid #d0d7e2;
  border-radius: 4px;
  padding: 4px 8px;
}
.ad-table th:last-child,
.ad-table td:last-child {
  text-align: center;
  vertical-align: middle;
}
.ad-add-group {
  display: flex;
  gap: 32px;
  justify-content: center;
  align-items: flex-start;
}
.ad-add-block {
  background: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 24px 32px 16px 32px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 320px;
}
.ad-add-block .section-title {
  margin-bottom: 12px;
  color: #2566d8;
  font-size: 1.1rem;
  font-weight: bold;
}
.ad-add-block .input {
  margin-bottom: 12px;
  width: 100%;
}
.select-input {
  height: 42px;
}
@media (max-width: 768px) {
  .ad-manage {
    width: 100%;
    padding: 0 2vw;
  }
  
  .ad-settings-card {
    padding: 20px 16px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .btn-add {
    width: 100%;
  }
  .ad-section {
    width: 92%;
    padding-top: 2rem;
    margin-bottom: 2rem;
  }
  .ad-card {
    width: 100%;
    padding: 12px 2vw;
  }
  .ad-table {
    display: block;
    width: 100%;
    overflow-x: auto;
    font-size: 14px;
  }
  .ad-table thead, .ad-table tbody, .ad-table tr {
    display: table;
    width: 100%;
    table-layout: fixed;
  }
  .ad-table th, .ad-table td {
    padding: 8px 6px;
    font-size: 13px;
  }
  .input, .select-input {
    width: 84%;
    min-width: 0;
    margin-right: 0;
    font-size: 14px;
    padding: 8px 8px;
    height: 32px !important;
  }
  .ad-add-row input.input {
    margin: 0 auto;
  }
  .btn {
    width: 84%;
    margin-right: 0;
    padding: 8px 0;
    font-size: 14px;
  }
}
</style> 