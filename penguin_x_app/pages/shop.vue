<template>
  <container>
    <v-row class="left marginTopMd">
            <p class="sub2">
              {{ $t('listings.title') }}
            </p>
            <Listings />
    </v-row>
  </container>
</template>
  
  <script>
  import ListingRequests from '~/components/ListingRequests.vue';
  import Listings from '~/components/Listings.vue';
  
  export default {
    components: { Listings, ListingRequests }
  }
  </script>