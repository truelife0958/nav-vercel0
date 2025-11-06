<template>
  <div class="settings-container">
    <div class="settings-card">
      <h3 class="settings-title">网站设置</h3>
      <div class="settings-form">
        <div class="form-group">
          <label class="form-label">网站标题</label>
          <input 
            v-model="settings.site_title" 
            type="text" 
            class="form-input"
            placeholder="请输入网站标题"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">网站副标题</label>
          <input 
            v-model="settings.site_subtitle" 
            type="text" 
            class="form-input"
            placeholder="请输入网站副标题"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">页脚文字</label>
          <input 
            v-model="settings.footer_text" 
            type="text" 
            class="form-input"
            placeholder="请输入页脚版权信息"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">GitHub 仓库地址</label>
          <input 
            v-model="settings.github_url" 
            type="text" 
            class="form-input"
            placeholder="https://github.com/用户名/仓库名"
          />
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              v-model="settings.show_admin_entry" 
              type="checkbox"
              class="form-checkbox"
              true-value="true"
              false-value="false"
            />
            <span>显示管理后台入口</span>
          </label>
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input 
              v-model="settings.show_github_link" 
              type="checkbox"
              class="form-checkbox"
              true-value="true"
              false-value="false"
            />
            <span>显示 GitHub 链接</span>
          </label>
        </div>
        
        <div class="form-actions">
          <button @click="saveSettings" class="btn btn-primary" :disabled="saving">
            {{ saving ? '保存中...' : '保存设置' }}
          </button>
          <button @click="loadSettings" class="btn btn-secondary">
            重置
          </button>
        </div>
        
        <div v-if="message" :class="['message', messageType]">
          {{ message }}
        </div>
      </div>
    </div>
    
    <div class="settings-card">
      <h3 class="settings-title">密码管理</h3>
      <div class="settings-form">
        <div class="form-group">
          <label class="form-label">当前密码</label>
          <input
            v-model="passwordForm.oldPassword"
            type="password"
            class="form-input"
            placeholder="请输入当前密码"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">新密码</label>
          <input
            v-model="passwordForm.newPassword"
            type="password"
            class="form-input"
            placeholder="请输入新密码（至少6位）"
          />
        </div>
        
        <div class="form-group">
          <label class="form-label">确认新密码</label>
          <input
            v-model="passwordForm.confirmPassword"
            type="password"
            class="form-input"
            placeholder="请再次输入新密码"
          />
        </div>
        
        <div class="form-actions">
          <button @click="changePassword" class="btn btn-primary" :disabled="changingPassword">
            {{ changingPassword ? '修改中...' : '修改密码' }}
          </button>
        </div>
        
        <div v-if="passwordMessage" :class="['message', passwordMessageType]">
          {{ passwordMessage }}
        </div>
      </div>
    </div>
    
    <div class="settings-info">
      <h4>设置说明</h4>
      <ul>
        <li><strong>网站标题：</strong>显示在浏览器标签页和网站顶部</li>
        <li><strong>网站副标题：</strong>网站的辅助说明文字</li>
        <li><strong>页脚文字：</strong>显示在网站底部的版权信息</li>
        <li><strong>GitHub 仓库地址：</strong>项目开源地址链接</li>
        <li><strong>显示管理后台入口：</strong>在首页底部显示管理入口</li>
        <li><strong>显示 GitHub 链接：</strong>在首页底部显示 GitHub 链接</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getSettings, updateSettings, changePassword as apiChangePassword } from '../../api';

const settings = ref({
  site_title: '',
  site_subtitle: '',
  footer_text: '',
  github_url: '',
  show_admin_entry: 'true',
  show_github_link: 'true'
});

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const saving = ref(false);
const message = ref('');
const messageType = ref('success');
const changingPassword = ref(false);
const passwordMessage = ref('');
const passwordMessageType = ref('success');

onMounted(() => {
  loadSettings();
});

async function loadSettings() {
  try {
    const res = await getSettings();
    if (res.data && res.data.data) {
      Object.assign(settings.value, res.data.data);
    }
  } catch (error) {
    console.error('加载设置失败:', error);
    showMessage('加载设置失败', 'error');
  }
}

async function saveSettings() {
  saving.value = true;
  message.value = '';
  
  try {
    await updateSettings(settings.value);
    showMessage('设置保存成功', 'success');
  } catch (error) {
    console.error('保存设置失败:', error);
    showMessage(error.response?.data?.message || '保存设置失败', 'error');
  } finally {
    saving.value = false;
  }
}

async function changePassword() {
  if (!passwordForm.value.oldPassword || !passwordForm.value.newPassword || !passwordForm.value.confirmPassword) {
    showPasswordMessage('请填写所有密码字段', 'error');
    return;
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showPasswordMessage('两次输入的新密码不一致', 'error');
    return;
  }
  
  if (passwordForm.value.newPassword.length < 6) {
    showPasswordMessage('新密码长度至少6位', 'error');
    return;
  }
  
  changingPassword.value = true;
  passwordMessage.value = '';
  
  try {
    await apiChangePassword(passwordForm.value.oldPassword, passwordForm.value.newPassword);
    showPasswordMessage('密码修改成功，2秒后将自动退出登录', 'success');
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    setTimeout(() => {
      localStorage.removeItem('token');
      window.location.reload();
    }, 2000);
  } catch (error) {
    showPasswordMessage(error.response?.data?.message || '密码修改失败', 'error');
  } finally {
    changingPassword.value = false;
  }
}

function showMessage(msg, type = 'success') {
  message.value = msg;
  messageType.value = type;
  setTimeout(() => {
    message.value = '';
  }, 3000);
}

function showPasswordMessage(msg, type = 'success') {
  passwordMessage.value = msg;
  passwordMessageType.value = type;
  if (type === 'error') {
    setTimeout(() => {
      passwordMessage.value = '';
    }, 3000);
  }
}
</script>

<style scoped>
.settings-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.settings-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  margin-bottom: 24px;
}

.settings-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #222;
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f0f0;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #d0d7e2;
  border-radius: 8px;
  font-size: 15px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #2566d8;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.form-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2566d8;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: #174ea6;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  margin-top: 8px;
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

.settings-info {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid #2566d8;
}

.settings-info h4 {
  margin: 0 0 16px 0;
  color: #222;
  font-size: 1.1rem;
}

.settings-info ul {
  margin: 0;
  padding-left: 20px;
  list-style: none;
}

.settings-info li {
  margin-bottom: 12px;
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  position: relative;
  padding-left: 20px;
}

.settings-info li:before {
  content: "•";
  position: absolute;
  left: 0;
  color: #2566d8;
  font-weight: bold;
}

@media (max-width: 768px) {
  .settings-container {
    padding: 16px;
  }
  
  .settings-card {
    padding: 20px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>