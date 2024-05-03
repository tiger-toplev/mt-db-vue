<template>
  <b-container id="app">
    <b-row class="top-nav">
      <b-col>
        <b-link href="#" to="/"
          ><img src="/images/logo_1.jpg" width="200px" />
        </b-link>
      </b-col>
      <b-col cols="8">
        <b-nav variant="light" justified tabs>
          <b-nav-item to="/product" :active="selectedMenu === 'product'">{{
            $t("product.label")
          }}</b-nav-item>
          <b-nav-item to="/family" :active="selectedMenu === 'family'">{{
            $t("family.label")
          }}</b-nav-item>
          <b-nav-item to="/equipment" :active="selectedMenu === 'equipment'">{{
            $t("equipment.label")
          }}</b-nav-item>
          <b-nav-item to="/group" :active="selectedMenu === 'group'">{{
            $t("group.label")
          }}</b-nav-item>
          <b-button @click="simulateLogout" small variant="outline-secondary">
            <b-icon-power></b-icon-power
            ><span>&nbsp;{{ $t("auth.logout") }}</span>
          </b-button>
        </b-nav>
      </b-col>
      <b-col></b-col>
    </b-row>
    <b-row>
      <b-col cols="12">
        <router-view
          @family-changed="loadFamilies"
          @group-changed="loadGroups"
          @reload="reloadData"
        >
        </router-view>
      </b-col>
    </b-row>
  </b-container>
</template>
<script>
import AuthRoute from "@/mixins/AuthRoute";

export default {
  name: "Layout",
  mixins: [AuthRoute],
  data: function() {
    return {
      in_process: 0,
      lang: window.navigator.language.substr(0, 2),
      error: null,
      message: null,
      selectedMenu: null,

      warranties: []
    };
  },
  computed: {
    busy: function() {
      return this.in_process > 0;
    },
    hasError: function() {
      return this.error ? true : false;
    },
    hasMessage: function() {
      return this.message ? true : false;
    }
  },
  created: async function() {
    console.log("App created : vue store state", this.$store.state);
  },
  methods: {
    simulateLogout: function() {
      this.$store.dispatch("simulateLogout");
      this.$router.push({ path: "/" });
    },
    loadFamilies: function() {},
    loadGroups: function() {},
    reloadData: function() {}
  }
};
</script>
