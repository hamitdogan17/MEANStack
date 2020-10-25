import { AuthService } from './../../auth/auth.service';
import { INFERRED_TYPE } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, Input, OnDestroy} from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading = false;
  totalPost = 0;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  private authStatusSubs: Subscription;

  constructor(public postsService: PostsService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postData: {posts: Post[], postsCount: number}) => {
        this.isLoading = false;
        this.totalPost = postData.postsCount;
        this.posts = postData.posts;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated;
    });
  }

  onChangedPage(pageData: PageEvent){
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  ngOnDestroy(){
    this.postsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }

  onDelete(id){
    this.isLoading = true;
    this.postsService.deletePost(id).subscribe(() => {
      this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }
}
