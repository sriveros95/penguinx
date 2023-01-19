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
    <v-app-bar :clipped-left="clipped" color='#262936' fixed app class='header'>
      <nuxt-link to="/" class="text-decoration-none white--text"><v-toolbar-title v-text="title" /></nuxt-link>
      <v-spacer />
      <v-btn class="description" text v-for="(item, i) in items" :key="i" :to="item.to" router exact>
        <v-icon v-if="item.icon">{{ item.icon }}</v-icon>
        {{ item.title }}
      </v-btn>
      
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
    <!-- <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer> -->
  </v-app>
</template>

<script>
import WalletConnect from '~/components/WalletConnect.vue';

export default {
    data() {
        return {
            clipped: false,
            drawer: false,
            fixed: false,
            items: [
                {
                    title: "Shop",
                    to: "/shop"
                },
                {
                    title: "Sell",
                    to: "/sell"
                },
                {
                    title: "About",
                    to: "/about"
                }
            ],
            miniVariant: false,
            right: true,
            rightDrawer: false,
            title: "🐧 penguinX"
        };
    },
    components: { WalletConnect }
}
</script>
