<template>
  <b-form @submit="onSubmit" v-if="show" autocomplete="off">
    <b-form-group
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
    </b-form-group>
    <p class="error">{{ error }}</p>
    <b-button type="submit" variant="primary">{{ $t("auth.send") }}</b-button>

    <div class="mt-2">
      <b-link href="/login">{{ $t("auth.go_back_to_login") }}</b-link>
    </div>
  </b-form>
</template>

<script>
import { mapActions, mapState } from "vuex";
export default {
  name: "ForgotPassword",
  data() {
    return {
      form: {
        email: ""
      },
      show: true,
      error: ""
    };
  },
  computed: {
    ...mapState({})
  },
  methods: {
    ...mapActions(["sendForgotPassword"]),
    async onSubmit(evt) {
      evt.preventDefault();
      try {
        let res = await this.sendForgotPassword(this.form);

        if (res) {
          this.$router.push({
            name: "login"
          });
        }
      } catch (err) {
        console.log(err);
        this.error = err.message;
        if (err && err.message && err.message == "Unauthorized") {
          err.message = this.$t("auth.login." + err.message);
        }
      }
    }
  }
};
</script>
