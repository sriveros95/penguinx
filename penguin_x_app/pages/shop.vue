<template>
    <v-row justify="center" class="fullWidt">
      
      <v-container>
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