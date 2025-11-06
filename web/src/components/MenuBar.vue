<template>
  <nav class="menu-bar">
    <button
      v-for="menu in menus"
      :key="menu.id"
      @click="$emit('select', menu)"
      :class="{active: menu.id === activeId}"
    >
      {{ menu.name }}
    </button>
  </nav>
</template>

<script setup>
const props = defineProps({
  menus: Array,
  activeId: Number
});
</script>

<style scoped>
.menu-bar {
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 1rem;
  position: relative;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
}

.menu-bar::-webkit-scrollbar {
  display: none;
}

.menu-bar button {
  background: transparent;
  border: none;
  color: #fff;
  font-size: 16px;
  font-weight: 500;
  padding: 0.8rem 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  box-shadow: none;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.menu-bar button::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #399dff;
  transition: all 0.3s ease;
  transform: translateX(-50%);
}

.menu-bar button:hover {
  color: #399dff;
  transform: translateY(-1px);
}

.menu-bar button.active {
  color: #399dff;
}

.menu-bar button.active::before {
  width: 60%;
}

@media (max-width: 768px) {
  .menu-bar {
    gap: 0.2rem;
  }
  
  .menu-bar button {
    font-size: 14px;
    padding: .4rem .8rem;
  }
}
</style> 