<template>
  <button type="button" @click="count++">count is {{ count }}</button>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: "MainPage",
  setup(props) {
    const count = ref(0)
    return {
      count,
    }
  }
})
</script>