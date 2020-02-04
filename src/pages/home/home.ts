import { Component } from '@angular/core';
import { NavController, MenuController, LoadingController, Config } from 'ionic-angular';
import { JsonApiCall } from '../../providers/json-api-call/json-api-call';
import { PostDetailPage } from '../post-detail/post-detail';
import { WpCategoryAndPages } from '../../providers/json-api-call/wp-categories-and-pages';
import { SearchPage } from '../search/search';
import 'rxjs/add/operator/toPromise';


/*
  Generated class for the Home page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  //Set class variables for different uses
  login :any;
  detailPage: any;                //Our variable for the PostDetailPage
  searchPage: any;                //Our variable for the SearchPage
  categoryPage: any;              //Our variable for the CategoryPage
  loading:any;                    //Our loading variable in page
  feedData: any;                  //variable for holding our posts
  didNotLoad: boolean = false;    //variable for if an error has occured
  debugData : any;
  WpPostData : any;
  pageNumber : number = 1;        //starting page for our endpoint /posts?page=this.pageNumber
  categoryList : any;

  constructor(
    public navCtrl: NavController,
    public menu: MenuController,
    public jsonApiCall: JsonApiCall,
    public loadingController: LoadingController,
    public config : Config,
    public wpCategoryAndPages : WpCategoryAndPages
  ) {

    this.searchPage = SearchPage; // class variable to navigate to search
    this.feedData = [];           // we're defining this as an array to push our posts later
    

  }

  ionViewDidLoad() {
    console.log('Hello HomePage Page');
    this.loadFeed(true); //sets cache=true, so it loads new content first, then caches it
    this.getCategories();

  }

  // Function Fired on pull-to-refresh
  doRefresh(refresher) {
    this.loadFeed(false); //sets cache=false, so it always loads new content
    refresher.complete();
  }

  public getCategories(){
    this.wpCategoryAndPages.Categories.subscribe(
      data => {
        this.categoryList = this.wpCategoryAndPages.CategoryFilter;
        // console.log('fetched category object from wp-categories-and-pages: ', this.wpCategoryAndPages.CategoryFilter);
      }
    )
  }

  // Function to load more posts using ion-infinite-scoll.
  doInfinite(infiniteScroll) {
    console.log('Begin infinite scrolling operation');
      // increase our page number which tells our wp-api to fetch posts
      // from next page. eg: www.domain.com/wp-json/wp/v2/posts?page=1
      this.pageNumber = this.pageNumber + 1;

      // make our request with new pageNumber
      this.jsonApiCall.load(this.config.get("apiUrl")+"/posts?page="+this.pageNumber, false).subscribe(
        data => {
          // Since successful, push each post from our result into our
          // feedData
          for(let post of data[0]){
            this.feedData.push(post);
          }
          // console.log('data after infiniteScroll operation: ', data[0])
          if(data[0].length < 1)
          {
            // No more data was returned.
            // reduce our pageNumber back by 1, so next time we scroll down,
            // we don't skip a number
            this.pageNumber = this.pageNumber - 1;
          }
          // declare our scrolling complete
          infiniteScroll.complete();
        },
        err => {
          // end our scrolling
          infiniteScroll.complete();
          // reduce our pageNumber back by 1, so next time we scroll down,
          // we don't skip a number
          this.pageNumber = this.pageNumber - 1;
        }
      )

  }


  // Function Name: loadFeed(cache)
  // Usage: this.loadFeed(true/false) - boolean;

  /* Parameters:
    ------------
    cache : specify if we want to cache results or not when we use this.JsonApiCall.load().
    This becomes the second parameter in our instance of loadFeed(endpoint, cache)
  */
  private loadFeed(cache: boolean = false) {
        //A Local variable for configuring our loadingController
        let loader = this.loadingController.create({
          content: `<div class='app-spinner'></div>`
        });

        //Show Loader on screen
        loader.present();

        // Load the data using our http Service. Remember the cache parameter is either true/false
        // this.config.get("apiUrl") is defined in our app.module.ts as our app wide wordpress constant
        // for all our endpoints. This returns an observable we can subscribe to.
        this.jsonApiCall.load(this.config.get("apiUrl")+"/posts?page="+this.pageNumber, cache).subscribe(
          data => {
            // Successful Request
            for(let post of data[0]){
              this.feedData.push(post);
            }
            console.log(this.feedData);

            // Property for our Error Message. Set to False since request was Successful
            this.didNotLoad = false;

            // console.log('Post Data: ',this.feedData);

            // Dismiss our loader
            loader.dismiss();
          },
          err => {
            // Error Management

            // Property for our Error Message. Set to True since request was not Successful
            this.didNotLoad = true;

            // Remove Loader on screen
            loader.dismiss();

            // For Debugging
            console.log(err);
            this.debugData = err;
          }
        )
    }


  // Method navigation to PostDetailPage with Post ID
  gotoDetailPost(id) {
    console.log(id);
    this.navCtrl.push(PostDetailPage, {
      id: id
    })
  }

}
