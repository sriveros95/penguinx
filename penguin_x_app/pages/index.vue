<template>
  <v-row justify="center" class="fullWidt">
    <v-container fluid class="mainHeader">
      <h1 class="h1">{{ $t('main.title') }}<span class="mainGradient">{{ $t('main.title_higlight') }}</span></h1>
      <p class="mainSub">
        {{ $t('main.sub1') }}<br />{{ $t('main.sub2') }}
      </p>
      <v-row class="containerMain" >
        <v-col cols="12" xs="4" md="4" class="justifyRight">
          <v-btn to="/sell" class="mainButton">{{ $t('main.btn_sell') }}</v-btn>
        </v-col>
        <v-col cols="12" xs="4" md="4" class="justifyLeft">
          <v-btn to="/buy" class="mainButton">{{ $t('main.btn_buy') }}</v-btn>
        </v-col>
      </v-row>

    </v-container>
    <v-container>
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
import Listings from '~/components/Listings.vue';

export default {
  components: { Listings }
}
</script>