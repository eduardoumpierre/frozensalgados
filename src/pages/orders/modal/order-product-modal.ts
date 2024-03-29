import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { SelectSearchable } from '../../../components/select/select';
import { ApiProvider } from "../../../providers/api/api";
import { Product } from "../../../models/Product";
import { Storage } from "@ionic/storage";
import { SyncProvider } from "../../../providers/sync/sync";
import { Category } from "../../../models/Category";
import { DecimalPipe } from "@angular/common";

/**
 * Generated class for the OrderProductModalPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-order-product-modal',
    templateUrl: 'order-product-modal.html',
})
export class OrderProductModalPage {
    pageTitle = 'Adicionar produto';
    order: Product;
    quantity: number;
    price: string;
    priceText: string;
    products: Product[] = [];
    totalPrice: number = 0;

    category: Category;
    categories: Category[] = [];
    filteredProducts: Product[] = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, public apiProvider: ApiProvider,
                public viewCtrl: ViewController, public storage: Storage, public syncProvider: SyncProvider,
                private decimalPipe: DecimalPipe) {
        this.syncProvider
            .verifySync('categories')
            .then(categories => {
                categories.unshift({id: 0, name: 'Todas as categorias'});
                this.categories = categories;
                this.category = this.categories[0];

                this.syncProvider
                    .verifySync('products')
                    .then(products => {
                        this.products = products;
                        this.filteredProducts = this.products;

                        if (navParams.get('product')) {
                            this.pageTitle = 'Editar produto';
                            this.order = navParams.get('product');
                            this.quantity = this.order.quantity;
                            this.category = this.order.category;
                            this.price = this.decimalPipe.transform(this.order.price, '1.2-2', 'pt-BR');

                            this.updateTotalPrice();
                        } else {
                            this.order = new Product();
                            this.quantity = 1;
                            this.price = this.decimalPipe.transform(0, '1.2-2', 'pt-BR');
                        }
                    })
                    .catch((error) => console.log(error));
            })
            .catch((error) => console.log(error));
    }

    /**
     *
     * @param {{component: SelectSearchable; text: string}} event
     */
    searchProducts(event: { component: SelectSearchable, text: string }) {
        let id = event.text || '';

        event.component.isSearching = true;

        if (id && id.trim() != '') {
            event.component.items = this.products.filter(item => item.name.toLowerCase().indexOf(id.toLowerCase()) !== -1 || item.id.toString().indexOf(id) !== -1);

            event.component.isSearching = false;
        }
    }

    /**
     * @param {{component: SelectSearchable; value: any}} event
     */
    updateProduct(event: { component: SelectSearchable, value: any }) {
        const product = event.value;

        this.order = Object.assign(this.order, product);
        this.order.image = 'assets/images/placeholder-60.jpg';

        this.price = this.decimalPipe.transform(this.order.price, '1.2-2', 'pt-BR');

        this.updateTotalPrice();
    }

    /**
     * @param {{component: SelectSearchable; value: any}} event
     */
    updateCategory(event: { component: SelectSearchable, value: any }) {
        const category = event.value;
        const products = this.products;

        this.order = null;

        if (category.id == 0) {
            this.filteredProducts = products;
        } else {
            this.filteredProducts = products.filter(item => item.category.id == category.id);
        }
    }

    /**
     * Dismiss product modal
     */
    dismiss() {
        if (this.validate()) {
            this.viewCtrl.dismiss(new Product(this.order.id, this.order.name, this.order.image, this.fixPrice(this.price), this.quantity, this.order.weight, new Category(this.order.category.id, this.order.category.name)));
        }
    }

    /**
     * @returns {boolean}
     */
    validate() {
        return this.order.name && this.quantity > 0 && this.fixPrice(this.price) > 0;
    }

    /**
     *
     * @param {any} event
     */
    updateTotalPrice(event = null) {
        setTimeout(() => {
            this.totalPrice = this.price ? this.fixPrice(this.price) * this.quantity : 0;
        }, 150);
    }

    /**
     *
     * @param {string} price
     * @returns {number}
     */
    fixPrice(price: string) {
        return parseFloat(price.replace(/\./g, '').replace(/,/g, '.'))
    }
}
