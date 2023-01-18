<template class="darker" color="#1c1e21">
  <v-row justify="center" color="#1c1e21">
    <v-col cols="12" md="11">
      <h1 class="h1">Buy and sell <span class="px_orange">handcrafts</span> with crypto!</h1>
      <p class="explain">
      Shop for unique pieces from artisans, or list your cool crafts!<br/>Sign in with MetaMask.
      </p>
      <v-row>
        <v-col cols="12" md="6">
          <v-btn to="/sell" class="mainButton mx-1">{{ $t('main.btn_sell') }}</v-btn>
        </v-col>
        <v-col cols="12" md="6">
          <v-btn to="/buy" class="mainButton mx-1">Shop Cool Stuff</v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
