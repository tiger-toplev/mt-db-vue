<template>
  <div class="layout">
    <div class="main-content">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import NonAuthRoute from "@/mixins/NonAuthRoute";

export default {
  mixins: [NonAuthRoute]
};
</script>
<style lang="scss">
.layout {
  display: flex;
  margin: auto;
  padding: 0;
  max-width: 600px;
  text-align: center;
  margin-top: 200px;

  .error {
    color: red;
  }
}

.main-content {
  flex: 1;
}
</style>
