<template>
  <div class="app flex-row align-items-center">
    <div class="container">
      <b-row class="justify-content-center">
        <b-col md="8">
          <b-card-group>
            <b-card no-body class="p-4">
              <b-card-body>
                <b-form>
                  <h1>Login</h1>
                  <p class="text-muted">Sign In to your account</p>
                  <b-input-group class="mb-3">
                    <b-input-group-prepend><b-input-group-text><i class="icon-user"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input v-model="username" type="text" class="form-control" placeholder="Username" autocomplete="username email" />
                  </b-input-group>
                  <b-input-group class="mb-4">
                    <b-input-group-prepend><b-input-group-text><i class="icon-lock"></i></b-input-group-text></b-input-group-prepend>
                    <b-form-input v-model="password" type="password" class="form-control" placeholder="Password" autocomplete="current-password" />
                  </b-input-group>
                  <!-- <b-alert v-if="error" show variant="danger">{{message}}</b-alert> -->
                  <b-row>
                    <b-col cols="6">
                      <b-button @click="login()" variant="primary" class="px-4">Login</b-button>
                    </b-col>
                    <b-col cols="6" class="text-right">
                      <b-button variant="link" class="px-0">Forgot password?</b-button>
                    </b-col>
                  </b-row>
                </b-form>
              </b-card-body>
            </b-card>
            <b-card no-body class="text-white bg-primary py-5 d-md-down-none" style="width:44%">
              <b-card-body class="text-center">
                <div>
                  <h2>Sign up</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <b-button variant="primary" class="active mt-3">Register Now!</b-button>
                </div>
              </b-card-body>
            </b-card>
          </b-card-group>
        </b-col>
      </b-row>
    </div>
  </div>
</template>

<script>
import Const from '@/core/base/Const';
import Toast from '@/core/base/Toast';

export default {
  name: 'Login',
  data () {
    return {
      username: null,
      password: null,
      message: '',
      error: false,
    }
  },
  methods: {
    async login () {
      if (!this.username) {
        //TODO alert danger
        this.error = true;
        this.message = 'Username is required';
        Toast.alertHide(`${this.message}`, 5000, Const.dangerLevel, Const.alertTitle)        
        return;
      }
      if (!this.password) {
        //TODO alert danger
        this.error = true;
        this.message = 'Password is required';
        Toast.alertHide(`${this.message}`, 5000, Const.dangerLevel, Const.alertTitle)        
        return;
      }
      this.error = false
      try {
        await this.$auth.login({ username: this.username, password: this.password });
        Toast.alertHide('Successfully', 5000, Const.successLevel, Const.alertTitle)
        this.redirectAdminHome();

      } catch (e) {
        //TODO
        Toast.alertHide(`${e.toString()}`, 5000, Const.dangerLevel, Const.alertTitle)
        this.error = true;
        this.message = 'Username or Password is invalid';
      }
    },

    redirectAdminHome () {
      this.$router.push({ name: 'Home' });
    }
  },

  mounted() {
    if (this.$auth._user) {
      if (this.$auth._user.isAdmin) {
        this.redirectAdminHome();
      }
    }
  },
}
</script>
