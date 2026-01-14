import { supabase } from "./supabase";

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function requireSession() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  let { data: userRow, error: userErr } = await supabase
    .from("users")
    .select("*")
    .eq("supabase_uid", data.user.id)
    .single();
  if (userErr || !userRow) {
    const metadata = data.user.user_metadata || {};
    const firstName = metadata.firstName || metadata.first_name || "User";
    const lastName = metadata.lastName || metadata.last_name || "Account";
    const username = metadata.username || (data.user.email ? data.user.email.split("@")[0] : `user-${data.user.id.slice(0,6)}`);
    const role = metadata.role === "clinician" ? "clinician" : "patient";
    const { data: inserted, error: insertErr } = await supabase
      .from("users")
      .insert({
        supabase_uid: data.user.id,
        email: data.user.email,
        username,
        first_name: firstName,
        last_name: lastName,
        role,
        password: `supabase:${data.user.id}`,
      })
      .select()
      .single();
    if (insertErr || !inserted) throw new Error("User profile missing");
    userRow = inserted;
  }
  return { authUser: data.user, appUser: userRow };
}

export async function handleApiRequest(method: string, url: string, body?: any): Promise<Response> {
  const { appUser, authUser } = await requireSession();

  // Normalize URL (strip query)
  const [path, queryString] = url.split("?");
  const params = new URLSearchParams(queryString || "");

  // /api/user
  if (path === "/api/user" && method === "GET") {
    const { password, ...rest } = appUser;
    return jsonResponse(rest);
  }

  if (path === "/api/user/profile" && method === "PATCH") {
    const updates = body || {};
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", appUser.id)
      .select()
      .single();
    if (error) throw error;
    const { password, ...rest } = data;
    return jsonResponse(rest);
  }

  if (path === "/api/user/change-password" && method === "POST") {
    const { newPassword } = body || {};
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return jsonResponse({ message: "Password updated" });
  }

  // Pregnancies
  if (path === "/api/pregnancy" && method === "GET") {
    if (appUser.role === "patient") {
      const { data, error } = await supabase
        .from("pregnancies")
        .select("*")
        .eq("patient_id", appUser.id)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return new Response("Not found", { status: 404 });
      return jsonResponse(data);
    } else {
      const patientId = params.get("patientId");
      if (!patientId) return new Response("patientId required", { status: 400 });
      const { data, error } = await supabase
        .from("pregnancies")
        .select("*")
        .eq("patient_id", Number(patientId))
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) return new Response("Not found", { status: 404 });
      return jsonResponse(data);
    }
  }

  if (path === "/api/pregnancies/user" && method === "GET") {
    const { data, error } = await supabase
      .from("pregnancies")
      .select("*")
      .eq("patient_id", appUser.id)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return new Response("Not found", { status: 404 });
    return jsonResponse(data);
  }

  if (path === "/api/pregnancies/patient" && method === "GET") {
    const patientId = params.get("patientId");
    if (!patientId) return new Response("patientId required", { status: 400 });
    const { data, error } = await supabase
      .from("pregnancies")
      .select("*")
      .eq("patient_id", Number(patientId))
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return new Response("Not found", { status: 404 });
    return jsonResponse(data);
  }

  if (path === "/api/pregnancies/all" && method === "GET") {
    const { data, error } = await supabase.from("pregnancies").select("*");
    if (error) throw error;
    return jsonResponse(data || []);
  }

  if (path.startsWith("/api/pregnancy/") && method === "PATCH") {
    const id = Number(path.split("/").pop());
    const { data, error } = await supabase
      .from("pregnancies")
      .update(body || {})
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return jsonResponse(data);
  }

  // Appointments
  if (path === "/api/appointments" && method === "GET") {
    let pregnancyId: number | null = null;
    if (appUser.role === "patient") {
      const { data: preg } = await supabase
        .from("pregnancies")
        .select("id")
        .eq("patient_id", appUser.id)
        .limit(1)
        .maybeSingle();
      pregnancyId = preg?.id ?? null;
    } else {
      const pid = params.get("pregnancyId");
      pregnancyId = pid ? Number(pid) : null;
    }
    const query = supabase.from("appointments").select("*").order("date_time", { ascending: true });
    if (pregnancyId) query.eq("pregnancy_id", pregnancyId);
    const { data, error } = await query;
    if (error) throw error;
    return jsonResponse(data || []);
  }

  if (path === "/api/appointments" && method === "POST") {
    const { data, error } = await supabase.from("appointments").insert(body).select().single();
    if (error) throw error;
    return jsonResponse(data, 201);
  }

  if (path.startsWith("/api/appointments/") && method === "PATCH") {
    const id = Number(path.split("/").pop());
    const { data, error } = await supabase
      .from("appointments")
      .update(body || {})
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return jsonResponse(data);
  }

  if (path.startsWith("/api/appointments/") && method === "DELETE") {
    const id = Number(path.split("/").pop());
    const { error } = await supabase.from("appointments").delete().eq("id", id);
    if (error) throw error;
    return jsonResponse({ ok: true });
  }

  // Vital stats
  if (path === "/api/vital-stats" && method === "GET") {
    const pregnancyId = params.get("pregnancyId");
    const query = supabase.from("vital_stats").select("*").order("date", { ascending: false });
    if (pregnancyId) query.eq("pregnancy_id", Number(pregnancyId));
    const { data, error } = await query;
    if (error) throw error;
    return jsonResponse(data || []);
  }

  if (path === "/api/vital-stats" && method === "POST") {
    const { data, error } = await supabase.from("vital_stats").insert(body).select().single();
    if (error) throw error;
    return jsonResponse(data, 201);
  }

  // Test results
  if (path === "/api/test-results" && method === "GET") {
    const pregnancyId = params.get("pregnancyId");
    const query = supabase.from("test_results").select("*").order("date", { ascending: false });
    if (pregnancyId) query.eq("pregnancy_id", Number(pregnancyId));
    const { data, error } = await query;
    if (error) throw error;
    return jsonResponse(data || []);
  }

  if (path === "/api/test-results" && method === "POST") {
    const { data, error } = await supabase.from("test_results").insert(body).select().single();
    if (error) throw error;
    return jsonResponse(data, 201);
  }

  // Scans
  if (path === "/api/scans" && method === "GET") {
    const pregnancyId = params.get("pregnancyId");
    const query = supabase.from("scans").select("*").order("date", { ascending: false });
    if (pregnancyId) query.eq("pregnancy_id", Number(pregnancyId));
    const { data, error } = await query;
    if (error) throw error;
    return jsonResponse(data || []);
  }

  if (path === "/api/scans" && method === "POST") {
    const { data, error } = await supabase.from("scans").insert(body).select().single();
    if (error) throw error;
    return jsonResponse(data, 201);
  }

  // Messages
  if (path.startsWith("/api/messages") && method === "GET") {
    const pregnancyId = params.get("pregnancyId");
    const otherUserId = params.get("otherUserId");
    let query = supabase.from("messages").select("*").order("timestamp", { ascending: true });
    if (pregnancyId) query = query.eq("pregnancy_id", Number(pregnancyId));
    if (otherUserId) {
      query = query.or(
        `and(from_id.eq.${appUser.id},to_id.eq.${otherUserId}),and(from_id.eq.${otherUserId},to_id.eq.${appUser.id})`
      );
    }
    const { data, error } = await query;
    if (error) throw error;
    return jsonResponse(data || []);
  }

  if (path === "/api/messages" && method === "POST") {
    const payload = { ...body, from_id: appUser.id };
    const { data, error } = await supabase.from("messages").insert(payload).select().single();
    if (error) throw error;
    return jsonResponse(data, 201);
  }

  if (path.startsWith("/api/messages/") && path.endsWith("/read") && method === "POST") {
    const id = Number(path.split("/")[3]);
    const { error } = await supabase.from("messages").update({ read: true }).eq("id", id);
    if (error) throw error;
    return jsonResponse({ ok: true });
  }

  // Education modules
  if (path.startsWith("/api/education-modules") && method === "GET") {
    const week = params.get("week");
    const { data, error } = await supabase.from("education_modules").select("*");
    if (error) throw error;
    const modules =
      week && data
        ? data.filter((m) => {
            const [start, end] = (m.week_range || "").split("-").map((s: string) => parseInt(s.trim(), 10));
            const w = parseInt(week, 10);
            if (!Number.isFinite(w)) return true;
            if (Number.isFinite(start) && Number.isFinite(end)) return w >= start && w <= end;
            if (Number.isFinite(start)) return w === start;
            return true;
          })
        : data || [];
    return jsonResponse(modules);
  }

  // Immunisation history
  if (path === "/api/immunisation-history" && method === "GET") {
    const pregnancyId = params.get("pregnancyId");
    if (!pregnancyId) return new Response("pregnancyId required", { status: 400 });
    const { data, error } = await supabase
      .from("immunisation_history")
      .select("*")
      .eq("pregnancy_id", Number(pregnancyId))
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    if (!data) return new Response("Not found", { status: 404 });
    return jsonResponse(data);
  }

  if (path === "/api/immunisation-history" && method === "POST") {
    const { data, error } = await supabase.from("immunisation_history").insert(body).select().single();
    if (error) throw error;
    return jsonResponse(data, 201);
  }

  if (path.startsWith("/api/immunisation-history/") && method === "PATCH") {
    const id = Number(path.split("/").pop());
    const { data, error } = await supabase
      .from("immunisation_history")
      .update(body || {})
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return jsonResponse(data);
  }

  // Patients list
  if (path === "/api/patients" && method === "GET") {
    const { data, error } = await supabase.from("users").select("*").eq("role", "patient");
    if (error) throw error;
    return jsonResponse(data || []);
  }

  // Patient by id
  if (path.startsWith("/api/patients/") && method === "GET") {
    const id = Number(path.split("/").pop());
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
    if (error) throw error;
    return jsonResponse(data);
  }

  // Clinician appointments overview
  if (path === "/api/clinician/appointments" && method === "GET") {
    const { data, error } = await supabase.from("appointments").select("*").order("date_time", { ascending: true });
    if (error) throw error;
    return jsonResponse(data || []);
  }

  // Clinician statistics placeholder
  if (path === "/api/clinician/statistics" && method === "GET") {
    return jsonResponse({ patients: 0, appointments: 0, alerts: 0 });
  }

  // Default: not implemented
  return new Response(`Not implemented: ${method} ${url}`, { status: 501 });
}
