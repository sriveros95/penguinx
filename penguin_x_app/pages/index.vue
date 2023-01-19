<template>
  <v-row justify="center">
    <v-col cols="12" md="11">
      <h1 class="h1">🐧 penguinX</h1>
      <p class="explain">
        The market for unique items, just like Etsy...with <span class="mainGradient">crypto</span>.<br/>Sign in with MetaMask.
      </p>
      <!-- <p class="explain">
      Shop for unique pieces from artisans, or list your cool crafts!<br/>Sign in with MetaMask.
      </p> -->
      <v-row class="containerHeader">
        <v-col  >
          <v-btn to="/sell" class="mainButton mx-1">{{ $t('main.btn_sell') }}</v-btn>
        </v-col>
        <v-col  >
          <v-btn to="/buy" class="mainButton mx-1">Shop Cool Stuff</v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
