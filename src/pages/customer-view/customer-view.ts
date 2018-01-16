import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from "../../providers/api/api";
import { ListFormPage } from "../list-form/list-form";

/**
 * Generated class for the CustomerViewPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
    selector: 'page-customer-view',
    templateUrl: 'customer-view.html',
})
export class CustomerViewPage {
    public customer;

    constructor(public navCtrl: NavController, public navParams: NavParams, private apiProvider: ApiProvider) {
    }

    ionViewDidLoad() {
        this.loadItem(this.navParams.get('id'));
    }

    /**
     * Gets one item by id
     */
    loadItem(id) {
        this.apiProvider.builder('customers/' + id).loader().get().then((res) => {
            this.customer = res;
            console.log(res);
        });
    }

    /**
     * Push to list form page
     */
    goToForm() {
        this.navCtrl.push(ListFormPage, {customer: this.customer.id, order: []});
    }
}