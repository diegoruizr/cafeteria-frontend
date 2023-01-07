<template>
  <div class="row">
    <div class="col-md-12 card">
      <div class="card-header row">
        <div  class="col-sm-6">
          <h4 class="title"><i class="ti-bag"></i> {{$t('products')}}</h4>
        </div>
        <div v-if="comparePermissions('create_product')" class="col-sm-6">
          <div class="pull-right">
            <h4 class="title">
            <button @click.prevent="goCreateForm" class="btn btn-default btn-fill btn-wd">{{$t('create_product')}}</button>
            </h4>
          </div>
        </div>
      </div>
      <div class="card-content row">
        <div class="col-sm-3">
          <label>
            {{$t('name')}}
          <div class="input-group">
            <input type="text" maxlength="40" style="text-transform: uppercase;" clearable v-model="nameSearch" @keyup="updateTableData()" class="form-control" :placeholder="$t('search')">
            <span class="input-group-addon" @click.prevent="updateTableData()"><i class="fa fa-search"></i></span>
          </div>
          </label>
        </div>
        <div class="col-sm-3">
          <label>
            {{$t('reference')}}
          <div class="input-group">
            <input type="text" maxlength="40" style="text-transform: uppercase;" clearable v-model="referenceSearch" @keyup="updateTableData()" class="form-control" :placeholder="$t('search')">
            <span class="input-group-addon" @click.prevent="updateTableData()"><i class="fa fa-search"></i></span>
          </div>
          </label>
        </div>
        <div class="col-sm-12">
          <el-table class="table-striped"
                    :data="tableData"
                    border
                    style="width: 100%">
            <el-table-column v-for="column in tableColumns"
                             :key="column.label"
                             :min-width="column.minWidth"
                             :formatter="column.formatter"
                             :prop="column.prop"
                             :label="column.label">
            </el-table-column>
            <el-table-column
              :min-width="25"
              fixed="right"
              :label="$t('actions')">
              <template slot-scope="props">
                <a v-if="comparePermissions('state_product')" class="btn btn-simple btn-xs  btn-icon" :class="props.row.state === 1 ? 'btn-danger' : 'btn-success'" @click="changeState(props.row)">
                  <i :class="props.row.state === 1 ? 'ti-close' : 'ti-check'" v-tooltip.top="StateTooltip"></i>
                </a>
                <a v-if="comparePermissions('edit_product') && props.row.state === 1" class="btn btn-simple btn-xs btn-warning btn-icon" @click="handleEdit(props.$index, props.row)">
                  <i class="ti-pencil-alt" v-tooltip.top="EditTooltip"></i>
                </a>
                <a v-if="comparePermissions('view_product')" class="btn btn-simple btn-xs btn-info btn-icon"  @click="handleView(props.$index, props.row)">
                  <i class="ti-eye" v-tooltip.top="ViewTooltip"></i>
                </a>
                <a v-if="comparePermissions('view_sale') && props.row.state === 1" class="btn btn-simple btn-xs btn-success btn-icon" @click="handleSaleView(props.$index, props.row)">
                  <i class="ti-money" v-tooltip.top="ResponsableTooltip"></i>
                </a>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="col-sm-6 pagination-info">
          <p class="category">{{$t('showing_pages', {from: from+1, to: to, total: total})}}</p>
        </div>
        <div class="col-sm-6">
          <p-pagination class="pull-right"
                        v-model="currentPage"
                        :per-page="perPage"
                        :total="total">
          </p-pagination>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import Vue from 'vue'
  import {Table, TableColumn, Select, Option, Notification} from 'element-ui'
  import PPagination from 'src/components/UIComponents/Pagination.vue'
  import request from '@/plugins/request'
  import {mapGetters} from 'vuex'
  import swal from 'sweetalert2'
  Vue.use(Table)
  Vue.use(TableColumn)
  export default{
    components: {
      PPagination,
      [Option.name]: Option,
      [Select.name]: Select,
      [Notification.name]: Notification
    },
    computed: {
      ...mapGetters(['getAccessToken', 'getIpServer', 'comparePermissions', 'getCompany']),
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
        StateTooltip: 'Estado Producto',
        EditTooltip: 'Editar Producto',
        ViewTooltip: 'Ver Producto',
        ResponsableTooltip: 'Vender Producto',
        perPage: 10,
        currentPage: 1,
        total: 0,
        nameSearch: '',
        tableColumns: [
          {
            prop: 'name',
            label: this.$t('name'),
            minWidth: '40'
          },
          {
            prop: 'reference',
            label: this.$t('reference'),
            minWidth: '25'
          },
          {
            prop: 'category_name',
            label: this.$t('category'),
            minWidth: '25'
          },
          {
            prop: 'price',
            label: this.$t('price'),
            minWidth: '25'
          },
          {
            prop: 'weight',
            label: this.$t('weight'),
            minWidth: '25'
          },
          {
            prop: 'stock',
            label: this.$t('stock'),
            minWidth: '25'
          },
          {
            prop: 'state',
            label: this.$t('state'),
            formatter: this.stateName,
            minWidth: '15'
          }
        ],
        tableData: []
      }
    },
    methods: {
      changeState (row) {
        let state = row.state === 0 ? 1 : 0
        let msg = state === 0 ? '¿Esta seguro de inactivar el producto?' : '¿Desea activar el producto?'
        this.status = 0
        swal({
          title: row.name,
          text: msg,
          type: 'question',
          showCancelButton: true,
          confirmButtonColor: '#666261',
          cancelButtonColor: '#ddd4d2',
          confirmButtonText: 'Si',
          cancelButtonText: 'No'
        }).then((result) => {
          let state = row.state === 0 ? 1 : 0
          this.$spinner.show()
          request.post(`api/product/update/state`, {new_state: state, id: row.id})
            .then(res => {
              this.$spinner.close()
              this.updateTableData()
              this.mensaje('Estado modificado', 'success', 'Correcto')
            }).catch(err => {
              this.$spinner.close()
              console.log(err)
              this.mensaje('Error al cambiar estado', 'error', 'Error Servidor')
            })
        }).catch(swal.noop)
      },
      handleEdit (index, row) {
        this.$router.push({ name: 'product', params: { paramAction: 'edit', objectID: row.id } })
      },
      handleView (index, row) {
        this.$router.push({ name: 'product', params: { paramAction: 'view', objectID: row.id } })
      },
      handleSaleView (index, row) {
        this.$router.push({ name: 'sale', params: { paramAction: 'view', objectID: row.id } })
      },
      updateTableData () {
        request.post(`api/product/list?page=${this.currentPage}`, {name: this.nameSearch, reference: this.referenceSearch})
          .then(res => {
            this.total = res.data.products.total
            this.tableData = res.data.products.data
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
      goCreateForm () {
        this.$router.push({ name: 'product', params: { paramAction: 'create' } })
      },
      stateName (row, column) {
        return row.state === 1 ? this.$t('active') : this.$t('inactive')
      }
    },
    mounted () {
      this.updateTableData()
    },
    watch: {
      currentPage (value) {
        this.updateTableData()
      }
    }
  }
</script>
<style scope>
</style>
