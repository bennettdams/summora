/**
 * This is a kill switch middleware.
 * It will disable all pages and API routes.
 * Rename this file to "middleware" and uncomment all lines to activate it.
 */

export {}

// import type { NextRequest } from 'next/server'
// import { NextResponse } from 'next/server'

// const maintenancePath = '/maintenance'

// export function middleware(request: NextRequest) {
//   // allowed paths, even in maintenance mode
//   if (
//     request.nextUrl.pathname.startsWith(maintenancePath) ||
//     request.nextUrl.pathname.startsWith('/_next/static') ||
//     request.nextUrl.pathname.startsWith('/favicon.ico')
//   ) {
//     return NextResponse.next()
//   }

//   // all API requests respond with an error
//   if (request.nextUrl.pathname.startsWith('/api')) {
//     return NextResponse.error()
//   }

//   // all routes will be redirected to maintenance page
//   return NextResponse.redirect(new URL(maintenancePath, request.url))
// }
