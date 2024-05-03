<template>
  <b-form @submit="onSubmit" v-if="show" autocomplete="off">
    <!-- <b-form-group
      id="input-group-1"
      :label="$t('auth.email')"
      label-for="input-1"
    >
      <b-form-input
        id="input-1"
        v-model="form.email"
        type="email"
        required
        :placeholder="$t('auth.enter_email')"
      ></b-form-input>
    </b-form-group> -->

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
    <b-form-group
      id="input-group-3"
      :label="$t('auth.confirm_password')"
      label-for="input-3"
    >
      <b-form-input
        id="input-3"
        v-model="form.confirm_password"
        required
        type="password"
        :placeholder="$t('auth.enter_confirm_password')"
      ></b-form-input>
    </b-form-group>
    <p class="error">{{ error }}</p>
    <b-button type="submit" variant="primary">{{
      $t("auth.reset_password")
    }}</b-button>

    <div class="mt-2">
      <b-link href="/login">{{ $t("auth.go_back_to_login") }}</b-link>
    </div>
  </b-form>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  name: "ResetPassword",
  data() {
    return {
      form: {
        token: "",
        password: "",
        confirm_password: ""
      },
      error: "",
      show: true
    };
  },
  computed: {
    ...mapState({})
  },
  methods: {
    ...mapActions(["resetPasswordRequest"]),
    async onSubmit(evt) {
      evt.preventDefault();
      console.log(this.$route.query.token);
      this.form.token = this.$route.query.token ? this.$route.query.token : "";
      try {
        if (this.form.password != this.form.confirm_password) {
          this.error = "Password must match";
          return;
        }
        let res = await this.resetPasswordRequest(this.form);

        if (res) {
          this.$router.push({
            name: "login"
          });
        }
        console.log(res);
      } catch (err) {
        console.log(err);
        this.error = err.message;
        if (err && err.message && err.message == "Unauthorized") {
          this.error = this.$t("auth.login." + err.message);
        }
      }
    }
  }
};
</script>
