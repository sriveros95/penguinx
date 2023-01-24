<template>
  <v-app dark>
    <!-- <v-navigation-drawer
      v-model="drawer"
      :mini-variant="miniVariant"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->
    <v-app-bar :clipped-left="clipped" color='#151B28' fixed app class='header'>
      <nuxt-link :to="localePath('/')" class="text-decoration-none white--text"><v-toolbar-title v-text="title" /></nuxt-link>
      <v-spacer />
      <v-btn class="description" text v-for="(item, i) in items" :key="i" :to="localePath(item.to)" router exact>
        <v-icon class="description" v-if="item.icon">{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
      <v-btn class="description" href="https://discord.gg/ByuUgytbJ5" target="_blank">
        Discord
      </v-btn>
      <v-menu offset-y>
        <template v-slot:activator="{ on }">
          <v-btn class="description" v-on="on">{{ $t('lang') }}</v-btn>
        </template>
        <v-list class="menuBox">
          <v-list-item>
            <v-list-item-title>
              <nuxt-link :to="switchLocalePath('en')" class="description">🇺🇸 English</nuxt-link>
            </v-list-item-title>
          </v-list-item>
          <v-list-item>
            <v-list-item-title>
              <nuxt-link :to="switchLocalePath('es')" class="description">🇨🇴 Español</nuxt-link>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- <v-btn small icon href="https://discord.gg/ByuUgytbJ5">
        <v-img height="15" contain src="/discord.png"></v-img>
      </v-btn> -->
      <!-- <div :class="[classNameA, { classNameB: condition }]"></div>
      <v-btn icon @click.stop="rightDrawer = !rightDrawer">
        <v-icon>mdi-menu</v-icon>
      </v-btn> -->

      <WalletConnect />
    </v-app-bar>
    <v-main>
      <v-container>
        <Nuxt />
      </v-container>
    </v-main>
    <!-- <v-navigation-drawer
      v-model="rightDrawer"
      :right="right"
      temporary
      fixed
    >
      <v-list>
        <v-list-item @click.native="right = !right">
          <v-list-item-action>
            <v-icon light>
              mdi-repeat
            </v-icon>
          </v-list-item-action>
          <v-list-item-title>Switch drawer (click me)</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->
    <v-footer
      :absolute="!fixed"
      app
      color='#151B28'
    >
    <v-card
        flat
        tile
        width="100%"
        class="description lighten-1 text-center"
      >
        <v-card-text>
          <v-btn class="description" href="https://twitter.com/PenguinExchange" target="_blank">
            Twitter
          </v-btn>
          <v-btn class="description" href="https://discord.gg/ByuUgytbJ5" target="_blank">
            Discord
          </v-btn>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-text class="white--text">
          {{ new Date().getFullYear() }} — penguinX
        </v-card-text>
      </v-card>
    
    </v-footer>
  </v-app>
</template>

<script>
import WalletConnect from '~/components/WalletConnect.vue';
const regex = /\/ipfs\/([\w]*)\//gm;

export default {
    data() {
        return {
            clipped: false,
            drawer: false,
            fixed: false,
            items: [],
            miniVariant: false,
            right: true,
            rightDrawer: false,
            title: "🐧 penguinX"
        };
    },
    mounted() {
      this.items = [
        { title: this.$t('nav_bar.buy'), to: "/shop"},
        { title: this.$t('nav_bar.sell'), to: "/sell" },
        { title: this.$t('nav_bar.about'), to: "/about" }
      ]
    },
    components: { WalletConnect }
}
</script>
