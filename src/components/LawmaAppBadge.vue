<template>
  <div class="lawma-app-badge" :class="{ 'in-header': inHeader }">
    <q-badge class="modern-badge" :style="badgeStyle" @click="handleClick">
      <div class="badge-content">
        <q-icon name="eco" size="18px" class="q-mr-xs" v-if="!inHeader" />
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
</style>
