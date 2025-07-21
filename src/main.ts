import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { App } from './app/app';

bootstrapApplication(App, {
  providers: [importProvidersFrom(HttpClientModule)]
}).catch(err => console.error(err));