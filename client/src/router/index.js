import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import BucketView from '../views/BucketView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/bucket/:bucketName',
    name: 'BucketView',
    component: BucketView,
    props: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router