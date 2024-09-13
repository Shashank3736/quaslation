import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { db } from '../db'
import { userTable } from '../db/schema'
import { eq } from 'drizzle-orm'
import { getNovelFirstChapter, getNovelLastChapter } from '../db/query'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (request.nextUrl.pathname.startsWith('/admin')) {
    
    if(!user) {
      // no user, potentially respond by redirecting the user to the login page
      const url = request.nextUrl.clone()
      url.searchParams.set("next", url.pathname)
      url.pathname = '/auth/login'
      return NextResponse.redirect(url)
    }
    
    const userRole = (await db.select().from(userTable).where(eq(userTable.clerkId, user.id))).at(0);
    if(!userRole || userRole.role !== "ADMIN") {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url);
    }
  }
  // _series logic 
  if(request.nextUrl.pathname.startsWith("/_series")) {
    const breakdown = request.nextUrl.pathname.split("/");
    const novelId = breakdown.at(-2);
    const position = breakdown.at(-1);

    if(novelId && position) {
      const url = request.nextUrl.clone();
      let data = {
        novel: "",
        slug: ""
      };
      if(position === "-1") {
        data = await getNovelLastChapter(parseInt(novelId));
      } else {
        data = await getNovelFirstChapter(parseInt(novelId));
      }
      url.pathname = `/novels/${data.novel}/${data.slug}`;
      return NextResponse.redirect(url);
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}