import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {HttpModule} from '@angular/http';
import {MyApp} from './app.component';

import {AboutPage} from '../pages/about/about';
import {ContactPage} from '../pages/contact/contact';
import {HomePage} from '../pages/home/home';
import {CustomersPage} from '../pages/customers/customers';
import {OrdersPage} from '../pages/orders/orders';
import {ProductsPage} from '../pages/products/products';
import {OrderViewPage} from '../pages/order-view/order-view'

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {ApiProvider} from '../providers/api/api';

@NgModule({
    declarations: [
        MyApp,
        AboutPage,
        ContactPage,
        HomePage,
        CustomersPage,
        OrdersPage,
        ProductsPage,
        OrderViewPage
    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp)
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        AboutPage,
        ContactPage,
        HomePage,
        CustomersPage,
        OrdersPage,
        ProductsPage,
        OrderViewPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        ApiProvider
    ]
})
export class AppModule {
}
