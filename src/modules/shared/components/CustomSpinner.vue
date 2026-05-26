<template>
  <q-inner-loading :showing="show">
    <img src="cnpsfavbg.png" alt="Chargement..." class="spinner-img" height="150px" />
  </q-inner-loading>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
    },
  },
}
</script>

<style scoped>
.spinner-img {
  width: 150px;
  height: 150px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
