<template>
  <div class="row">
    <div class="col-md-12 card">
      <div class="card-header">
        <h4 class="title">{{$t('product_sale')}}</h4>
      </div>
      <div class="card-content">
        <fieldset>
          <div class="row">
            <div class="col-md-6 padding-top-20">
              <div class="c-boxCompany">
                <label>{{$t('quantity')}}</label>
                <input type="number" min="1" max="999" name="quantity" v-model="sale.quantity"  class="form-control" :data-vv-as="'quantity'" v-validate="modelValidations.quantity">
                <small class="text-danger" v-show="quantity.invalid">
                  {{ getError('quantity') }}
                </small>
              </div>
            </div>
            <div class="col-md-12 col-sm-12 padding-top-20">
              <div class="col-md-5 form-group text-left">
                <p> <b>Producto:</b> {{name_product}} - Diponible en stock: {{stock}}</p>
              </div>
              <div class="col-md-7 form-group text-left">
                <el-tooltip class="item" effect="dark" :content="'Agregar configuración'" placement="left">
                    <button @click.prevent="sendData(sale)" class="btn btn-fill btn-default">{{$t('sale')}}</button>
                </el-tooltip>
              </div>
            </div>
          </div>
          <br>
          <br>
          <div class="col-sm-12">
            <el-table class="table-striped" :data="tableData" border style="width: 53%">
              <el-table-column
                prop="product_name"
                label="Producto"
                width="300">
              </el-table-column>
              <el-table-column
                prop="quantity"
                label="Cantidad"
                width="300">
              </el-table-column>
            </el-table>
          </div>
          <div class="col-sm-6 pagination-info">
            <p class="category">{{$t('showing_pages', {from: from+1, to: to, total: total})}}</p>
          </div>
          <div class="col-sm-12">
            <p-pagination class="pull-left" v-model="currentPage" :per-page="perPage" :total="total"></p-pagination>
          </div>
        </fieldset>
      </div>
      <div class="card-footer">
        <div class="pull-right">
          <div class="form-group padding-top-20">
            <button type="button" @click="$router.go(-1)" class="btn btn-fill btn-default">{{$t('cancel')}}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import {mapFields} from 'vee-validate'
  import PPagination from 'src/components/UIComponents/Pagination.vue'
  import {Notification, Table, TableColumn, Button} from 'element-ui'
  import {mapGetters} from 'vuex'
  import request from '@/plugins/request'
  Vue.use(Table)
  Vue.use(TableColumn)

  export default{
    props: {
      objectID: {
        type: Number
      },
      paramAction: {
        type: String
      }
    },
    components: {
      PPagination,
      [Button.name]: Button,
      [Notification.name]: Notification
    },
    computed: {
      ...mapGetters(['getAccessToken', 'getIpServer', 'comparePermissions', 'getCompany', 'getCompanyType']),
      ...mapFields(['quantity']),
      pagedData () {
        return this.tableData
      },
      to () {
        let highBound = this.from + this.perPage
        if (this.total < highBound) {
          highBound = this.total
        }
        return highBound
      },
      from () {
        return this.perPage * (this.currentPage - 1)
      }
    },
    data () {
      return {
        currentPage: 1,
        perPage: 10,
        total: 0,
        name_product: '',
        stock: 0,
        number_room: 0,
        tableData: [],
        sale: {
          quantity: 1
        },
        modelValidations: {
          quantity: {
            required: true,
            numeric: true,
            min: 1
          }
        }
      }
    },
    methods: {
      updateTableData () {
        request.post(`api/sale/list?page=${this.currentPage}`, {id: this.objectID})
          .then(res => {
            this.total = res.data.sales.total
            this.tableData = res.data.sales.data
          }).catch(err => {
            console.log(err)
          })
      },
      mensaje (texto, type, tittle) {
        Notification({ title: tittle,
          message: texto,
          type: type
        })
      },
      getError (fieldName) {
        return this.errors.first(fieldName)
      },
      sendData () {
        this.$validator.validateAll()
        .then((result) => {
          if (result) {
            if (parseInt(this.stock) > 0 && (parseInt(this.sale.quantity) < parseInt(this.stock) || parseInt(this.sale.quantity) === parseInt(this.stock))) {
              request.post(`api/sale/create`, {sale: this.sale, product_id: this.objectID})
              .then(res => {
                this.updateTableData()
                this.stock = res.data.stock
                this.mensaje('Venta registrada', 'success', 'Vendido')
                this.sale = {
                  quantity: 0
                }
              }).catch(err => {
                console.log(err)
                this.mensaje('Error creando la venta por producto', 'error', 'Error')
              })
            } else {
              this.mensaje('No es posible realizar la venta', 'warning', 'Advertencia')
            }
          }
        })
      }
    },
    mounted () {
      request.post(`api/product/show`, {id: this.objectID})
      .then(res => {
        this.stock = res.data.product.stock
        this.name_product = res.data.product.name
      }).catch(err => {
        console.log(err)
        this.mensaje('Error cargando los datos del producto', 'error', 'Error')
      })
      this.updateTableData()
    },
    watch: {
      currentPage (value) {
        this.updateTableData()
      }
    }
  }
</script>
<style scoped>
.c-boxCompany{
  display: flex;
  flex-direction: column;
}
@media screen and (max-width: 750px){
  .c-boxCompany{
    padding-left: 2em;
    width: 95%;
  }
}
input[type="file"] {
  margin: 300%;
  display: block !important;
}
.modal-content {
  width: 45%;
}
</style>
<style>
</style>
