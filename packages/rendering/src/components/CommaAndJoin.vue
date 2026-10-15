<template>
  <span>
    <template v-for="(slot, idx) in slotNames" :key="idx">
      <slot :name="slot"></slot>
      <template v-if="idx < slotNames.length - 2">{{ comma }}</template>
      <template v-else-if="idx === slotNames.length - 2">{{ and }}</template>
    </template>
  </span>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

const props = defineProps<{
  comma?: string;
  and?: string;
}>();

// Locale-specific default separators, selected by the document language
const LOCALIZED_DEFAULTS: Record<string, { comma: string; and: string }> = {
  'ar': { comma: '، ', and: ' و' },
  'he': { comma: ', ', and: ' ו' },
};

function localizedDefaults() {
  const lang = document.documentElement.lang || '';
  const language = lang.split('-', 1)[0]!;
  return LOCALIZED_DEFAULTS[language] ?? { comma: ', ', and: ' and ' };
}

const comma = computed(() => props.comma ?? localizedDefaults().comma);
const and = computed(() => props.and ?? localizedDefaults().and);

defineSlots();
const slots = useSlots() as any;
const slotNames = computed(() => Object.keys(slots));
</script>
