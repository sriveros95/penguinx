<template>
  <v-row justify="center" class="fullWidth">
    <v-container fluid class="mainHeader">
      <h1 class="h1">Buy and sell unique items, like Etsy...<br/>with <span class="mainGradient">crypto</span></h1>
      <p class="mainSub">
        Shop for unique pieces from artisans, or list your cool crafts!.<br/>Sign in with MetaMask.
      </p>
      <v-row class="containerMain">
        <v-col  >
          <v-btn to="/sell" class="mainButton mx-1">{{ $t('main.btn_sell') }}</v-btn>
        </v-col>
        <v-col  >
          <v-btn to="/buy" class="mainButton mx-1">Shop Cool Stuff</v-btn>
        </v-col>
      </v-row>
      
    </v-container>
    <v-container>
      <v-row class="left">
        <p class="sub2 text-left">
          {{ $t('main.listing_requests.title') }}
          <ListingRequests></ListingRequests>
        </p>
      </v-row>
      <!-- <v-row class="left">
        <p class="sub2 text-left">
          Unverified listings
        </p>
      </v-row> -->
      <v-row class="left">
        <p class="sub2 text-left">
          Check out all the cool stuff
        </p>
        <Listings />
      </v-row>
    </v-container>
  </v-row>
</template>

<script>
import ListingRequests from '~/components/ListingRequests.vue';
import Listings from '~/components/Listings.vue';

export default {
    components: { Listings, ListingRequests }
}
</script>