<template>
  <b-form @submit="onSubmit" v-if="show" autocomplete="off">
    <b-form-group
      id="input-group-1"
      :label="$t('auth.username')"
      label-for="input-1"
    >
      <b-form-input
        id="input-1"
        v-model="form.username"
        type="text"
        required
        :placeholder="$t('auth.enter_username')"
      ></b-form-input>
    </b-form-group>

    <b-form-group
      id="input-group-2"
      :label="$t('auth.password')"
      label-for="input-2"
    >
      <b-form-input
        id="input-2"
        v-model="form.password"
        required
        type="password"
        :placeholder="$t('auth.enter_password')"
      ></b-form-input>
    </b-form-group>
    <p class="error">{{ error }}</p>
    <b-button type="submit" variant="primary">{{ $t("auth.login") }}</b-button>

    <div class="mt-2">
      <b-link href="/forgot-password">{{ $t("auth.forgot_password") }}</b-link>
    </div>
    <!-- <div class="mt-1">
      <b-link href="/reset-password">{{ $t("auth.reset_password") }}</b-link>
    </div> -->
  </b-form>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  name: "Login",
  data() {
    return {
      form: {
        username: "",
        password: ""
      },
      show: true,
      error: ""
    };
  },
  computed: {
    ...mapState({
      loggedInUser: ({ users }) => {
        console.log("Login page : users", users);
        return users.loggedInUser;
      },
      test: ({ test }) => {
        console.log("test map state", test);
      }
    })
  },
  methods: {
    ...mapActions(["login"]),
    async onSubmit(evt) {
      evt.preventDefault();
      try {
        let res = await this.login(this.form);

        if (res) {
          this.$router.push({
            name: "ProductList"
          });
        }
        console.log(res);
        //const {data: {settings: {language}}, ...rest} = await this.me();
      } catch (err) {
        console.log(err);
        this.error = err.message ? err.message : "Wrong credentials";
        if (err && err.message && err.message == "Unauthorized") {
          err.message = this.$t("auth.login." + err.message);
        }
        // displayError(err);
        //this.showError(err);
      }
    }
  }
};
</script>
