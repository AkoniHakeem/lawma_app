<template>
  <q-layout view="hHh lpR fFf">
    <!-- Header -->
    <q-header elevated class="bg-white text-dark">
      <q-toolbar>
        <q-avatar>
          <q-img src="/assets/boundless_logo.png" />
        </q-avatar>
        <q-toolbar-title class="text-h6 text-weight-bold">
          <span class="text-primary">Boundless Edge</span>
        </q-toolbar-title>

        <q-space />

        <div class="gt-sm">
          <q-btn flat label="Home" />
          <q-btn
            flat
            label="Waste Operator Registration"
            to="/onboarding/register"
          />
          <!-- <q-btn flat label="Features" />
          <q-btn flat label="Pricing" />
          <q-btn flat label="About" />
          <q-btn flat label="Contact" /> -->
          <q-btn
            unelevated
            color="primary"
            label="Get Started with WastePro"
            class="q-ml-md"
            to="/auth/signin"
          />
        </div>

        <q-btn flat round dense icon="menu" class="lt-md">
          <q-menu>
            <q-list>
              <q-item clickable v-close-popup>
                <q-item-section>Home</q-item-section>
              </q-item>
              <!-- <q-item clickable v-close-popup>
                <q-item-section>Features</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>Pricing</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>About</q-item-section>
              </q-item>
              <q-item clickable v-close-popup>
                <q-item-section>Contact</q-item-section>
              </q-item> -->
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <!-- Footer -->
    <q-footer class="bg-dark text-white">
      <div class="row q-pa-lg q-col-gutter-md">
        <div class="col-12 col-md-6">
          <p class="text-subtitle2">
            © 2024 Boundless Edge. All rights reserved.
          </p>
        </div>
        <div class="col-12 col-md-6 text-right">
          <q-btn flat round icon="fab fa-facebook" />
          <q-btn flat round icon="fab fa-twitter" />
          <q-btn
            href="https://www.linkedin.com/in/boundless-edge-22b432338/"
            flat
            round
            icon="fab fa-linkedin"
          />
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
//
</script>
