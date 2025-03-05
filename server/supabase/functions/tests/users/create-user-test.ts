import { assertEquals } from "jsr:@std/assert"
import { createClient, FunctionsHttpError } from 'jsr:@supabase/supabase-js@2'

const options = {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
      verifyJwt: false
    }
  };
const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    options
  )
  

Deno.test("Should reject user creation if email is not provided", async () => {
    const body = {
        password: "password"
    }

    const { error: func_error } = await supabaseClient.functions.invoke("users", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`
        },
        body: JSON.stringify(body)
    })
    console.log("--------------------------------")

    const err = func_error as FunctionsHttpError

    const context = err.context as Response

    assertEquals(context.ok, false)
    assertEquals(context.status, 400)
    assertEquals(context.statusText, "Bad Request")
    assertEquals(context.headers.get("content-type"), "application/json")

    const _ = await context.json()

    // console.log(resBody)

    // console.log(func_data)
    // console.log(func_error)


    // assertEquals(func_error?.ok, false)

})
    