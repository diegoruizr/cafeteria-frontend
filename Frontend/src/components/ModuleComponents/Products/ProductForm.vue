<template>
  <div class="row">
    <div class="col-md-12 card">
      <div class="card-header">
        <h4 v-if="paramAction === 'edit'" class="title">{{$t('edit_product')}}</h4>
        <h4 v-else-if="paramAction === 'view'" class="title">{{$t('view_product')}}</h4>
        <h4 v-else class="title">{{$t('product_register')}}</h4>
      </div>
      <div class="card-content">
        <fieldset>
          <div class="row">
            <div class="col-sm-4 padding-top-20">
              <label>{{$t('name')}}</label>
              <input type="text"  name="name" v-model="product.name" :disabled="paramAction === 'view'" class="form-control" :data-vv-as="'name'" v-validate="modelValidations.name">
              <small class="text-danger" v-show="name.invalid">
                {{ getError('name') }}
              </small>
            </div>
            <div class="col-sm-4 padding-top-20">
              <label>{{$t('reference')}}</label>
              <input type="text" name="reference" v-model="product.reference" :disabled="paramAction == 'view'" @blur="checkReference(product.reference)" class="form-control" :data-vv-as="'reference'" v-validate="modelValidations.reference">
              <small class="text-danger" v-show="reference.invalid">
                {{ getError('reference') }}
              </small>
            </div>
            <div class="col-md-4 padding-top-20">
              <label>{{$t('price')}}</label>
              <input type="number" name="price"  min="0" v-model="product.price" :disabled="paramAction === 'view'" class="form-control" :data-vv-as="$t('price')" v-validate="modelValidations.price">
              <small class="text-danger" v-show="price.invalid">
                {{ getError('price') }}
              </small>
            </div>
          </div>
          <div class="row">
            <div class="col-md-4 padding-top-20">
              <label>{{$t('weight')}} - (g)</label>
              <input type="number" name="weight"  min="1" v-model="product.weight" :disabled="paramAction === 'view'" class="form-control" :data-vv-as="$t('weight')" v-validate="modelValidations.weight">
              <small class="text-danger" v-show="weight.invalid">
                {{ getError('weight') }}
              </small>
            </div>
            <div class="col-md-4 padding-top-20">
              <label>{{$t('stock')}}</label>
              <input type="number" name="stock"  min="1" max="999" v-model="product.stock" :disabled="paramAction === 'view'" class="form-control" :data-vv-as="$t('stock')" v-validate="modelValidations.stock">
              <small class="text-danger" v-show="stock.invalid">
                {{ getError('stock') }}
              </small>
            </div>
            <div class="col-md-4 padding-top-20">
              <div class="c-boxCompany">
                <label>{{$t('category')}}</label>
                <el-select name="category_id"
                            :data-vv-as="'category_id'"
                            v-validate="modelValidations.category_id"
                            size="large"
                            :disabled="paramAction === 'view'"
                            :placeholder="$t('select_option')"
                            v-model="product.category_id"
                            >
                  <el-option
                    v-for="option in selects.categories"
                    :value="option.id"
                    :label="option.name"
                    :key="option.id">{{option.name}}
                  </el-option>
                </el-select>
                <small class="text-danger" v-show="category_id.invalid">
                  {{ getError('category_id') }}
                </small>
              </div>
            </div>
          </div>
        </fieldset>
      </div>
      <div class="card-footer">
        <div class="pull-right">
          <div class="form-group padding-top-20">
            <button type="button" @click="$router.go(-1)" class="btn btn-fill btn-default">{{$t('cancel')}}</button>
            <button v-if="paramAction === 'edit'" type="submit" @click="sendData" class="btn btn-fill btn-default">{{$t('edit')}}</button>
            <button v-else-if="paramAction != 'view'" type="submit" @click="sendData" class="btn btn-fill btn-default">{{$t('create')}}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import {mapFields} from 'vee-validate'
  import {Select, Option, Upload, Notification} from 'element-ui'
  import {mapGetters} from 'vuex'
  import request from '@/plugins/request'

  export default{
    props: {
      objectID: {
        type: Number
      },
      paramAction: {
        type: String
      },
      multiple: {
        type: Boolean
      }
    },
    components: {
      [Option.name]: Option,
      [Select.name]: Select,
      [Upload.name]: Upload,
      [Notification.name]: Notification
    },
    computed: {
      ...mapGetters(['getAccessToken', 'getIpServer', 'comparePermissions', 'getCompany', 'getCompanyType']),
      ...mapFields(['name', 'reference', 'price', 'weight', 'stock', 'category_id'])
    },
    data () {
      return {
        reference_anterior: 0,
        iniReference: true,
        product: {
          product_id: '',
          price: 0,
          weight: 1,
          category_id: '',
          name: '',
          reference: '',
          address: '',
          number_room: 1
        },
        selects: {
          categories: []
        },
        modelValidations: {
          name: {
            required: true,
            min: 2,
            max: 191
          },
          reference: {
            required: true,
            min: 1
          },
          price: {
            required: true,
            numeric: true,
            min: 1
          },
          weight: {
            required: true,
            numeric: true,
            min: 1
          },
          stock: {
            required: true,
            numeric: true,
            min: 1
          },
          category_id: {
            required: true
          }
        }
      }
    },
    methods: {
      mensaje (texto, type, tittle) {
        Notification({ title: tittle,
          message: texto,
          type: type
        })
      },
      getError (fieldName) {
        return this.errors.first(fieldName)
      },
      resetInput ($event) {
        let keyCode = ($event.keyCode ? $event.keyCode : $event.which)
        if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
          $event.preventDefault()
        }
      },
      checkReference (reference) {
        request.post(`api/product/unique/reference`, {reference: reference, action: this.paramAction})
          .then(res => {
            if (res.data.status === 501) {
              if ((this.reference_anterior !== 0 && this.reference_anterior !== this.product.reference) || (this.reference_anterior === 0)) {
                this.iniReference = false
                this.product.reference = ''
                this.mensaje('El producto ya se encuentra registrado', 'warning', 'Advertencia')
              }
            } else {
              this.iniReference = true
            }
          }).catch(err => {
            console.log(err)
            this.$notify(
              {
                component: {
                  template: `<span>{{$t('product_form_error')}}</span>`
                },
                icon: 'ti-check',
                horizontalAlign: 'right',
                verticalAlign: 'top',
                type: 'danger'
              })
          })
      },
      sendData () {
        this.$validator.validateAll()
        .then((result) => {
          if (result && this.iniReference === true) {
            var route = '/create'
            if (this.paramAction === 'edit') {
              route = '/update'
            }
            request.post(`api/product${route}`, {product: this.product})
              .then(res => {
                if (res.data.valid === 0) {
                  this.mensaje('Se ha agregado/modificado correctamente.', 'success', 'Correcto')
                  this.$router.go(-1)
                }
              }).catch(err => {
                console.log(err)
                this.$spinner.close()
                this.mensaje('Se ha producido un error al agregar producto.', 'error', 'Error')
              })
          }
          setTimeout(() => {
            this.$spinner.close()
          }, 2000)
        })
      }
    },
    mounted () {
      if (this.paramAction === 'view' || this.paramAction === 'edit') {
        this.$spinner.show()
        request.post(`api/product/show`, {id: this.objectID})
          .then(res => {
            this.product.product_id = res.data.product.id
            this.reference_anterior = res.data.product.reference
            this.product = res.data.product
            this.selects.categories = res.data.categories
            this.$validator.reset()
            this.$spinner.close()
          }).catch(err => {
            console.log(err)
            this.$notify({
              component: {
                template: `<span>{{$t('product_view_error')}}</span>`
              },
              icon: 'ti-check',
              horizontalAlign: 'right',
              verticalAlign: 'top',
              type: 'danger'
            })
            this.$spinner.close()
            this.$router.go(-1)
          })
      }
      request.get(`api/product/detail/category`, {})
      .then(res => {
        this.selects.categories = res.data.categories
      }).catch(err => {
        console.log(err)
        this.mensaje('Error cargando las categorias.', 'error', 'Error')
      })
    }
  }
</script>
<style scoped>
.c-boxCompany{
  display: flex;
  flex-direction: column;
}
.c-select{
border-radius: 10px;
border-style: solid;
border-width: 0.2em;
}
.c-option:checked{
background: linear-gradient(90deg, #231F20, gray, #231F20);
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
