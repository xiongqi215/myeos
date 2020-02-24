<template>
  <div class="index">
    <section class="container">
      <aside class="layout-aside">
          <aside-component></aside-component>
      </aside>
      <section class="layout-content">
        <header class="layout-header">
          <header-component></header-component>
        </header>
        <main class="layout-main">
          <transition name="component-fade" mode="out-in">
            <router-view></router-view>
          </transition>
        </main>
        <footer-component></footer-component>
      </section>
    </section>
  </div>
</template>

<script>
import headerComponent from '@/components/common/header'
import asideComponent from '@/components/common/aside'
import footerComponent from '@/components/common/footer'
import { mapActions,mapState  } from 'vuex'

export default {
  name: 'index',
  data () {
    return {
    }
  },
  components: {
    headerComponent,
    asideComponent,
    footerComponent
  },created(){
     this.$notify({
                      title: '',
                      message: ` 欢迎回来 `,
                      duration: 4000,
                      type: 'success',
                      dangerouslyUseHTMLString: true
                  }) 
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.layout-content {
  padding-left: 300px;
  margin-bottom:5px;
}
.layout-main {
  min-height: 90vh;
  margin-top:20px;
}
.layout-aside {
   width: 50px
}
.component-fade-enter-active, .component-fade-leave-active {
  transition: opacity .3s ease;
}
.component-fade-enter, .component-fade-leave-to {
  opacity: 0;
}
</style>
