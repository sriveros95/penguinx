<template>
  <v-row justify="center" class="fullWidt">
    <v-container fluid class="mainHeader">
      <h1 class="h1">{{ $t('main.title') }}<span class="mainGradient">{{ $t('main.title_higlight') }}</span></h1>
      <p class="mainSub">
        {{ $t('main.sub1') }}<br />{{ $t('main.sub2') }}
      </p>
      <v-row class="containerMain" wrap>
        <v-col cols="12" xs="6" md="4">
          <v-btn to="/sell" class="mainButton">{{ $t('main.btn_sell') }}</v-btn>
        </v-col>
        <v-col cols="12" xs="6" md="4">
          <v-btn to="/buy" class="mainButton">{{ $t('main.btn_buy') }}</v-btn>
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
          <p class="sub2 text-left">
            {{ $t('listings.title') }}
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