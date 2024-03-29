import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { ApiProvider } from "../../../providers/api/api";
import { ProductsPage } from "../index/products";
import { Validators, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { SyncProvider } from "../../../providers/sync/sync";
import { DecimalPipe } from "@angular/common";

@IonicPage()
@Component({
    selector: 'page-product-form',
    templateUrl: 'product-form.html',
})
export class ProductFormPage {
    private pageTitle = 'Novo produto';
    private form: FormGroup;
    private id: number = null;
    private categories = [];

    constructor(public navCtrl: NavController, public navParams: NavParams, private apiProvider: ApiProvider,
                private formBuilder: FormBuilder, private syncProvider: SyncProvider, private decimalPipe: DecimalPipe) {
        if (navParams.get('id')) {
            this.pageTitle = 'Editar produto';
            this.id = navParams.get('id');
        }

        this.form = this.formBuilder.group({
            name: new FormControl('', Validators.required),
            price: new FormControl('', Validators.required),
            weight: new FormControl('', Validators.required),
            category_id: new FormControl('', Validators.required)
        });
    }

    /**
     *
     */
    ionViewWillEnter() {
        this.syncProvider
            .verifySync('categories', this.navParams.get('force'))
            .then(categories => {
                this.categories = categories;

                if (this.id) {
                    this.apiProvider.builder('products/' + this.id).loader().get().subscribe(res => {
                        this.form.controls['name'].setValue(res.name);
                        this.form.controls['weight'].setValue(this.decimalPipe.transform(res.weight, '1.3-3', 'pt-BR'));
                        this.form.controls['price'].setValue(this.decimalPipe.transform(res.price, '1.2-2', 'pt-BR'));

                        if (res.category) {
                            this.form.controls['category_id'].setValue(res.category.id);
                        }
                    });
                }
            })
            .catch((error) => console.log(error));
    }

    /**
     * Submit function
     */
    submit() {
        if (this.id) {
            this.apiProvider.builder('products/' + this.id).loader().put(Object.assign({}, {id: this.id}, this.form.value)).subscribe(res => this.redirect());
        } else {
            this.apiProvider.builder('products').loader().post(this.form.value).subscribe(res => this.redirect());
        }
    }

    /**
     *
     */
    redirect() {
        this.navCtrl.push(ProductsPage, {force: true}).then(() => {
            this.navCtrl.remove(this.navCtrl.getActive().index - 2, 2);
        });
    }
}
