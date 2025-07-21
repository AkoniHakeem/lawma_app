<template>
  <div class="lawma-app-badge" :class="{ 'in-header': inHeader }">
    <q-badge class="modern-badge" :style="badgeStyle" @click="handleClick">
      <div class="badge-content">
        <div class="wastepro-logo-mini" v-if="!inHeader">
          <div class="logo-symbol-mini">
            <div class="arrow arrow-1"></div>
            <div class="arrow arrow-2"></div>
            <div class="arrow arrow-3"></div>
          </div>
        </div>
        <span class="badge-text">WastePro</span>
        <div class="badge-subtitle" v-if="!inHeader">Management System</div>
      </div>
    </q-badge>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { getCssVar } from 'quasar';

const props = defineProps({
  /**
   * Use color name that can be obtained via getCssVar
   */
  color: {
    type: String,
    default: 'primary',
  },
  /**
   * Whether this badge is used in a header context
   */
  inHeader: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

const badgeStyle = computed(() => {
  const baseColor = getCssVar(props.color) || '#1976d2';

  if (props.inHeader) {
    return {
      background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}dd 100%)`,
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '600',
      border: 'none',
      boxShadow: `0 4px 12px ${baseColor}40`,
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      minHeight: '36px',
    };
  }

  return {
    background: `linear-gradient(135deg, ${baseColor} 0%, ${baseColor}cc 100%)`,
    color: 'white',
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '700',
    border: 'none',
    boxShadow: `0 6px 20px ${baseColor}30`,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '48px',
  };
});

function handleClick() {
  if (router.currentRoute.value.path !== '/auth/signin') {
    router.push({ path: '/auth/signin' });
  }
}

defineComponent({
  name: 'LawmaAppBadge',
});
</script>

<style scoped>
.lawma-app-badge {
  display: inline-block;
}

.modern-badge {
  transition: all 0.3s ease;
}

.modern-badge:hover {
  transform: translateY(-2px);
  filter: brightness(1.1);
}

.badge-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.in-header .badge-content {
  flex-direction: row;
  align-items: center;
}

.badge-text {
  font-weight: inherit;
  line-height: 1.2;
}

.badge-subtitle {
  font-size: 10px;
  opacity: 0.9;
  margin-top: 2px;
  line-height: 1;
}

.in-header .badge-subtitle {
  display: none;
}

/* WastePro Logo Mini */
.wastepro-logo-mini {
  margin-bottom: 4px;
}

.logo-symbol-mini {
  width: 20px;
  height: 20px;
  position: relative;
  margin: 0 auto;
}

.logo-symbol-mini .arrow {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 2px solid white;
  border-top-color: transparent;
  border-left-color: transparent;
  border-radius: 50%;
}

.logo-symbol-mini .arrow::before {
  content: '';
  position: absolute;
  right: 0;
  top: -2px;
  width: 0;
  height: 0;
  border-left: 3px solid transparent;
  border-right: 3px solid transparent;
  border-bottom: 5px solid white;
  transform: rotate(35deg);
}

.logo-symbol-mini .arrow-1 {
  transform: rotate(45deg);
}

.logo-symbol-mini .arrow-2 {
  transform: rotate(165deg);
}

.logo-symbol-mini .arrow-3 {
  transform: rotate(285deg);
}
</style>
