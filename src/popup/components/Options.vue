<template lang="pug">
.container
  .title Options
  button(@click='onOpenOptions') Open
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { browser } from 'webextension-polyfill-ts'

export default defineComponent({
  setup() {
    const onOpenOptions = (_event: MouseEvent) => {
      browser.tabs.create({
        // This is for chrome-extension tab
        // url: 'chrome://extensions/?options=' + browser.runtime.id
        // This is for new tab
        url: `chrome-extension://${browser.runtime.id}/options/index.html`
      })
    }

    return {
      onOpenOptions
    }
  }
})
</script>

<style lang="scss" scoped>
div.container {
  display: flex;
  flex-direction: column;

  div.title {
    font-size: 1em;
    font-weight: lighter;
    padding: 5px 20px;
    margin: 0px;
  }

  button {
    margin: 5px;
  }
}
</style>
