<template>
  <TreeGrid :items="items"/>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { TreeItem } from '../assets/ts/TreeStore';
import TreeGrid from '../components/TreeGrid.vue';

export default defineComponent({
  name: "MainPage",
  components: {
    TreeGrid,
  },
  setup() {
    const items: TreeItem[] = [
      { id: 1, parent: null, label: 'Айтем 1' },
      { id: '91064cee', parent: 1, label: 'Айтем 2' },
      { id: 3, parent: 1, label: 'Айтем 3' },
      { id: 4, parent: '91064cee', label: 'Айтем 4' },
      { id: 5, parent: '91064cee', label: 'Айтем 5' },
      { id: 6, parent: '91064cee', label: 'Айтем 6' },
      { id: 7, parent: 4, label: 'Айтем 7' },
      { id: 8, parent: 4, label: 'Айтем 8' }
    ]

    return {
      items,
    }
  }
})
</script>