import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: './tabs/tabs.module#TabsPageModule' },
  { path: 'conversations', loadChildren: './tabs/tabs.module#ConversationPageModule' },
  { path: 'chat', loadChildren: './conversation/chat/chat.module#ChatPageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
