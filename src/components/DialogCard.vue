<template>
  <q-card
    :style="{
      width: width,
      maxWidth: maxWidth,
      height: height,
      backgroundColor: $getColor(bgColor),
    }"
  >
    <slot></slot>
    <q-card-actions v-if="$slots['modal-actions']">
      <slot name="modal-actions"></slot>
    </q-card-actions>
  </q-card>
</template>
<script setup lang="ts">
import { defineComponent } from 'vue';

defineComponent({
  name: 'dialog-card',
});
export interface DialogCardProps {
  width?: string;
  height?: string;
  bgColor?: string;
  maxWidth?: string;
}

withDefaults(defineProps<DialogCardProps>(), {
  width: '100%',
  height: '100%',
  bgColor: 'accent',
  maxWidth: '80rem',
});
</script>
