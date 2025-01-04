/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RegisterIndexImport } from './routes/register/index'
import { Route as LoginIndexImport } from './routes/login/index'
import { Route as DashboardIndexImport } from './routes/dashboard/index'
import { Route as AboutIndexImport } from './routes/about/index'

// Create Virtual Routes

const IndexLazyImport = createFileRoute('/')()

// Create/Update Routes

const IndexLazyRoute = IndexLazyImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any).lazy(() => import('./routes/index.lazy').then((d) => d.Route))

const RegisterIndexRoute = RegisterIndexImport.update({
  id: '/register/',
  path: '/register/',
  getParentRoute: () => rootRoute,
} as any)

const LoginIndexRoute = LoginIndexImport.update({
  id: '/login/',
  path: '/login/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  id: '/dashboard/',
  path: '/dashboard/',
  getParentRoute: () => rootRoute,
} as any)

const AboutIndexRoute = AboutIndexImport.update({
  id: '/about/',
  path: '/about/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexLazyImport
      parentRoute: typeof rootRoute
    }
    '/about/': {
      id: '/about/'
      path: '/about'
      fullPath: '/about'
      preLoaderRoute: typeof AboutIndexImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/': {
      id: '/dashboard/'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof rootRoute
    }
    '/login/': {
      id: '/login/'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginIndexImport
      parentRoute: typeof rootRoute
    }
    '/register/': {
      id: '/register/'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexLazyRoute
  '/about': typeof AboutIndexRoute
  '/dashboard': typeof DashboardIndexRoute
  '/login': typeof LoginIndexRoute
  '/register': typeof RegisterIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexLazyRoute
  '/about': typeof AboutIndexRoute
  '/dashboard': typeof DashboardIndexRoute
  '/login': typeof LoginIndexRoute
  '/register': typeof RegisterIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexLazyRoute
  '/about/': typeof AboutIndexRoute
  '/dashboard/': typeof DashboardIndexRoute
  '/login/': typeof LoginIndexRoute
  '/register/': typeof RegisterIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/about' | '/dashboard' | '/login' | '/register'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/about' | '/dashboard' | '/login' | '/register'
  id: '__root__' | '/' | '/about/' | '/dashboard/' | '/login/' | '/register/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexLazyRoute: typeof IndexLazyRoute
  AboutIndexRoute: typeof AboutIndexRoute
  DashboardIndexRoute: typeof DashboardIndexRoute
  LoginIndexRoute: typeof LoginIndexRoute
  RegisterIndexRoute: typeof RegisterIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexLazyRoute: IndexLazyRoute,
  AboutIndexRoute: AboutIndexRoute,
  DashboardIndexRoute: DashboardIndexRoute,
  LoginIndexRoute: LoginIndexRoute,
  RegisterIndexRoute: RegisterIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/about/",
        "/dashboard/",
        "/login/",
        "/register/"
      ]
    },
    "/": {
      "filePath": "index.lazy.tsx"
    },
    "/about/": {
      "filePath": "about/index.tsx"
    },
    "/dashboard/": {
      "filePath": "dashboard/index.tsx"
    },
    "/login/": {
      "filePath": "login/index.tsx"
    },
    "/register/": {
      "filePath": "register/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
