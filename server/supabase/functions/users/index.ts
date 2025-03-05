import { Hono } from 'jsr:@hono/hono'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { newUserSchema } from '@shared/schema/users.ts';

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? '',
)

const functionName = 'users' // function name
const app = new Hono().basePath(`/${functionName}`);

app.get('/', async (c) => {
  const { data, error } = await supabaseClient.from('profiles').select('*')
if (error) {
    return c.json({error: error.message}, 400)
  }
  return c.json(data)
});

app.post('/', async (c) => {
  const body = await c.req.json()

  const {data: parsedData, error: parseError} =  newUserSchema.safeParse(body)
  if (parseError) {
    return c.json({error: parseError.message}, 400)
  }

  const authResponse = await supabaseClient.auth.signUp({
    email: parsedData.email,
    password: parsedData.password,
  })

  if (authResponse.error) {
    return c.json({error: authResponse.error.message}, 400)
  }

  const {password: _, ...userData} = parsedData
  const profileData = {
    id: authResponse.data?.user?.id,
    username: userData.username ?? authResponse.data?.user?.email,
    ...userData,
  }

  const {data, error} = await supabaseClient.from('profiles').insert(profileData)
  if (error) {
    return c.json({error: error.message}, 400)
  }

  return c.json(data)
});


Deno.serve(app.fetch)