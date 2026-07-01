import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const email = "admin@aublique.com";
  const password = "Admin@123";

  // Create user
  const { data: userData, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError && !createError.message.includes("already been registered")) {
    return new Response(JSON.stringify({ error: createError.message }), { status: 400 });
  }

  let userId = userData?.user?.id;

  if (!userId) {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const existing = users?.find((u: any) => u.email === email);
    userId = existing?.id;
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Could not find user" }), { status: 400 });
  }

  // Assign admin role
  const { error: roleError } = await supabase.from("user_roles").upsert(
    { user_id: userId, role: "admin" },
    { onConflict: "user_id" }
  );

  // Insert default contact details
  const { data: existing } = await supabase.from("contact_details").select("id").limit(1);
  if (!existing || existing.length === 0) {
    await supabase.from("contact_details").insert({
      email: "hello@aublique.com",
      phone: "+91 98765 43210",
      address: "Mumbai, India",
      social_links: { instagram: "https://instagram.com/aublique", linkedin: "https://linkedin.com/company/aublique" },
    });
  }

  return new Response(
    JSON.stringify({ success: true, message: `Admin created: ${email} / ${password}`, roleError }),
    { headers: { "Content-Type": "application/json" } }
  );
});
