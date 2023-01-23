<template>
  <v-row justify="center" class="fullWidt">
    <v-container fluid class="mainHeader">
      <h1 class="h1">Buy and sell unique items with <span class="mainGradient">crypto</span></h1>
      <p class="mainSub">
        Etsy meets crypto: shop unique, hand-made pieces from artisans around the world.<br />Sign in with MetaMask.
      </p>
      <v-row class="containerMain" wrap>
        <v-col cols="12" xs="6" md="4">
          <v-btn to="/sell" class="mainButton mx-1">{{ $t('main.btn_sell') }}</v-btn>
        </v-col>
        <v-col cols="12" xs="6" md="4">
          <v-btn to="/buy" class="mainButton mx-1">Shop Cool Stuff</v-btn>
        </v-col>
      </v-row>

    </v-container>
    <v-container>
      <v-row class="left">
        <p class="sub2 text-left">
          {{ $t('listing_requests.title') }}
          <ListingRequests></ListingRequests>
        </p>
      </v-row>
      <!-- <v-row class="left">
        <p class="sub2 text-left">
          Unverified listings
        </p>
      </v-row> -->
      <v-row class="left">
        <v-col cols="12">
          <p class="sub2 text-left">
            {{ $t('listings.title') }}
          </p>
          <Listings />
        </v-col>
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