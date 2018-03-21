import { Component } from '@angular/core';
import {
    IonicPage,
    NavController,
    NavParams,
    ModalController,
    ActionSheetController,
    AlertController
} from 'ionic-angular';
import { SelectSearchable } from '../../../components/select/select';
import { ApiProvider } from "../../../providers/api/api";
import { OrderProductModalPage } from '../modal/order-product-modal';
import { OrdersPage } from "../index/orders";
import { Product } from "../../../models/Product";
import { Storage } from "@ionic/storage";
import { SyncProvider } from "../../../providers/sync/sync";

/**
 * Generated class for the OrderFormPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-order-form',
    templateUrl: 'order-form.html',
})
export class OrderFormPage {
    pageTitle = 'Criar pedido';
    customer;
    lists = [];
    order: Product[] = [];
    customers = [];

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams,
        public apiProvider: ApiProvider,
        public storage: Storage,
        public modalCtrl: ModalController,
        public actionSheetCtrl: ActionSheetController,
        private alertCtrl: AlertController,
        private syncProvider: SyncProvider
    ) {
        if (navParams.get('product')) {
            this.pageTitle = 'Editar pedido';
        }

        this.storage.get('sync').then(sync => {
            if (sync['all_customers']) {
                this.customers = sync['all_customers']['items'];
            } else {
                this.apiProvider.builder('customers').loader().get({all: 'true'}).subscribe((res) => {
                    sync['all_customers'] = [];
                    sync['all_customers']['date'] = new Date().getTime();
                    sync['all_customers']['items'] = res;

                    this.storage.set('sync', sync).then(() => this.customers = res);
                });
            }

            console.log('customers', this.customers);
        });
    }

    ionViewDidLoad() {
        console.log(this.order);
    }

    /**
     * Loads the customer data
     *
     * @param event
     */
    searchCustomers(event: { component: SelectSearchable, text: string }) {
        let id = event.text || '';

        event.component.isSearching = true;
        this.order = [];

        // Do the customer search
        if (id && id.trim() != '') {
            event.component.items = this.customers.filter(item => {
                return item.name.toLowerCase().indexOf(id) !== -1 ||
                    item.id.toString().indexOf(id) !== -1;
            });

            event.component.isSearching = false;
        }
    }

    /**
     * Loads the customer's order lists
     *
     * @param event
     */
    searchCustomerLists(event: { component: SelectSearchable, value: any }) {
        this.order = [];

        this.apiProvider.builder('lists').get({customer: event.value.id}).subscribe((lists) => {
            this.lists = lists;
        });
    }

    loadList(selectedValue: any) {
        console.log('Selected', selectedValue);

        this.apiProvider.builder('lists/' + selectedValue).get().subscribe((res) => {
            console.log(res);

            this.order = [];

            let updatedOrder = [];

            res.list_product.forEach(function (e, i) {
                updatedOrder.push(new Product(e.product.id, e.product.name, '', e.product.price, e.quantity));
            });

            this.order = updatedOrder;

            console.log(this.order);
        });
    }

    /**
     * Loads the product modal
     */
    loadProductModal() {
        let productModal = this.modalCtrl.create(OrderProductModalPage);

        productModal.onDidDismiss(data => {
            if (data instanceof Product) {
                this.order.push(data);
            }
        });

        productModal.present();
    }

    /**
     * Creates the order and redirects to the orders page
     */
    create() {
        let data = {customer: this.customer.id, order: this.normalizeOrderData(this.order)};

        this.apiProvider.builder('orders').loader().post(data).subscribe((res) => {
            // this.syncProvider.sync(['orders']).then((r) => {
            //     this.navCtrl.push(OrdersPage).then(() => {
            //         this.navCtrl.remove(this.navCtrl.getActive().index - 2, 2);
            //     });
            // }).catch(error => console.log(error));
        });
    }

    /**
     * Removes the unnecessary data from the array
     *
     * @param order
     * @returns {Array}
     */
    normalizeOrderData(order) {
        let data = [];

        order.forEach(function (e, i) {
            data.push({id: e.id, qnt: e.quantity});
        });

        return data;
    }

    showOptions(id: number, key: number) {
        let actionSheet = this.actionSheetCtrl.create({
            title: 'Opções',
            buttons: [
                {
                    text: 'Editar',
                    handler: () => {
                        let productModal = this.modalCtrl.create(OrderProductModalPage, {product: this.order[key]});

                        productModal.onDidDismiss(data => {
                            if (data instanceof Product) {
                                this.order[key] = data;
                            }
                        });

                        productModal.present();
                    }
                },
                {
                    text: 'Excluir',
                    role: 'destructive',
                    handler: () => {
                        let alert = this.alertCtrl.create({
                            title: 'Confirmar exclusão',
                            message: 'Deseja remover esse produto?',
                            buttons: [
                                {
                                    text: 'Cancelar',
                                    role: 'cancel'
                                },
                                {
                                    text: 'Remover',
                                    handler: () => {
                                        this.removeFromOrder(key);
                                    }
                                }
                            ]
                        });

                        alert.present();
                    }
                },
                {
                    text: 'Cancelar',
                    role: 'cancel'
                }
            ]
        });

        actionSheet.present();
    }

    /**
     * Removes a order item
     *
     * @param {number} key
     */
    removeFromOrder(key: number) {
        if (this.order[key]) {
            this.order.splice(key, 1);
        }
    }
}
