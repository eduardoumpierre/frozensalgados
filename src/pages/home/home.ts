import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { CustomersPage } from '../customers/index/customers';
import { OrdersPage } from '../orders/index/orders';
import { ProductsPage } from "../products/index/products";
import { UserPage } from "../users/user/user";
import { Storage } from "@ionic/storage";
import { UsersPage } from "../users/index/users";
import { SyncProvider } from "../../providers/sync/sync";
import { ReportsPage } from "../reports/index/reports";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    currentUser: any = {};

    constructor(public navCtrl: NavController, public storage: Storage, private syncProvider: SyncProvider) {
        this.storage.get('user').then((user) => this.currentUser = user);
    }

    // Push another page onto the history stack
    // Causing the nav controller to animate the new page in
    ionViewWillEnter() {
        this.syncProvider.syncCategories();
    }

    /**
     * Push to customer list page
     */
    goToCustomers() {
        this.navCtrl.push(CustomersPage);
    }

    /**
     * Push to order list page
     */
    goToOrders() {
        this.navCtrl.push(OrdersPage);
    }

    /**
     * Push to product list page
     */
    goToProducts() {
        this.navCtrl.push(ProductsPage);
    }

    /**
     * Push to user page
     */
    goToUser() {
        this.navCtrl.push(UserPage);
    }

    /**
     * Push to sellers page
     */
    goToUsers() {
        this.navCtrl.push(UsersPage);
    }

    /**
     * Push to reports page
     */
    goToReports() {
        this.navCtrl.push(ReportsPage);
    }

    /**
     * Updates all the categories with the refresher
     */
    doRefresh() {
        this.syncProvider
            .syncCategories(['customers', 'orders', 'products', 'users'], true)
            .catch((error) => console.log(error));
    }
}
