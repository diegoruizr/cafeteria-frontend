import DashboardLayout from '../components/Dashboard/Layout/DashboardLayout.vue'
// GeneralViews
import NotFound from '../components/GeneralViews/NotFoundPage.vue'
import Login from 'src/components/Dashboard/Views/Pages/Login.vue'
import Home from 'src/components/ModuleComponents/Home.vue'
import Product from 'src/components/ModuleComponents/Products/Product.vue'
import ProductForm from 'src/components/ModuleComponents/Products/ProductForm.vue'
import SaleForm from 'src/components/ModuleComponents/Products/SaleForm.vue'

let loginPage = {
  path: '/login',
  name: 'login',
  component: Login
}

let loginPageReset = {
  path: '/login/:token',
  name: 'reset',
  component: Login
}

const routes = [
  {
    path: '/',
    component: DashboardLayout,
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: Home,
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/products',
        component: Product,
        name: 'products',
        meta: {
          requiresAuth: true,
          hasParams: false
        },
        props: true
      },
      {
        path: '/product/form',
        component: ProductForm,
        name: 'product',
        meta: {
          requiresAuth: true,
          hasParams: true,
          default: 'create'
        },
        props: true
      },
      {
        path: '/product/sale/form',
        component: SaleForm,
        name: 'sale',
        meta: {
          requiresAuth: true,
          hasParams: true,
          default: 'create'
        },
        props: true
      }
    ]
  },
  loginPage,
  loginPageReset,
  {path: '*', component: NotFound}
]

/**
 * Asynchronously load view (Webpack Lazy loading compatible)
 * The specified component must be inside the Views folder
 * @param  {string} name  the filename (basename) of the view to load.
 function view(name) {
   var res= require('../components/Dashboard/Views/' + name + '.vue');
   return res;
};**/

export default routes
