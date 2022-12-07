<template>
  <component :is="Component" />
</template>

<script setup>
import LoginAlt from './login-alt.vue'
import LoginBase from './login-web3.vue'
import LoginLighting from './login-lighting.vue'

const renderNum = Math.floor(Math.random() * 10) + 1

const Component = computed(() => {
  return LoginBase
})
</script>

<style scoped lang="scss">

</style>
