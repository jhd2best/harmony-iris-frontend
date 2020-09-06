import Vue from 'vue'
import VueRouter from 'vue-router'
import Layout from '../views/layout.vue'
import ViewsHome from '../views/home.vue'


Vue.use(VueRouter)

const routes = [
    { path: '/', redirect: '/home' },
    {
        path: '/',
        component: Layout,
        children: [
            {
                path: 'home',
                component: ViewsHome,
            },
        ]
    },
]

const router = new VueRouter({
    routes: routes,
})

export default router